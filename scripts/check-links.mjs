#!/usr/bin/env node
/**
 * Structural integrity check for the documentation.
 *
 * The build already fails on a broken MDX file. This catches the things a build
 * cannot see:
 *
 *   1. A sidebar entry with no MDX file behind it — a 404 in the navigation.
 *   2. An MDX file no sidebar links to — a page nobody can find.
 *   3. An internal link pointing at a route that does not exist.
 *   4. Unbalanced MDX component tags, which produce a cryptic acorn error.
 *   5. Placeholder content — the guard that "no stubs" is a real claim.
 *   6. Missing frontmatter.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'src', 'content');

const errors = [];
const warnings = [];

// --------------------------------------------------------------------------
// Sidebars. Parsed from source rather than imported, so this script stays a
// plain Node file with no build step of its own.
// --------------------------------------------------------------------------

function routesFromSidebar(file) {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'sidebars', file), 'utf8');
  return [...src.matchAll(/path:\s*'([^']+)'/g)].map((m) => m[1]);
}

const sidebarRoutes = [
  ...routesFromSidebar('learn.ts'),
  ...routesFromSidebar('reference.ts'),
  ...routesFromSidebar('community.ts'),
];

// --------------------------------------------------------------------------
// Content files on disk.
// --------------------------------------------------------------------------

function walk(dir, prefix = '') {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...walk(full, `${prefix}/${entry.name}`));
    } else if (entry.name.endsWith('.mdx')) {
      const base = entry.name.replace(/\.mdx$/, '');
      out.push({ route: base === 'index' ? prefix : `${prefix}/${base}`, file: full });
    }
  }
  return out;
}

const files = walk(CONTENT);
const byRoute = new Map(files.map((f) => [f.route, f.file]));

// --------------------------------------------------------------------------
// 1 & 2. Sidebar and content must agree exactly.
// --------------------------------------------------------------------------

for (const route of sidebarRoutes) {
  if (!byRoute.has(route)) {
    errors.push(`Sidebar entry "${route}" has no MDX file (expected src/content${route}.mdx or ${route}/index.mdx)`);
  }
}

const sidebarSet = new Set(sidebarRoutes);
for (const { route, file } of files) {
  if (!sidebarSet.has(route)) {
    errors.push(`Orphaned page: ${path.relative(ROOT, file)} is not linked from any sidebar`);
  }
}

// --------------------------------------------------------------------------
// 3-6. Per-file checks.
// --------------------------------------------------------------------------

/** Component tags that must balance. Self-closing components are excluded. */
const PAIRED_TAGS = [
  'Intro', 'YouWillLearn', 'YouWillLearnCard', 'LearnMore', 'Recap',
  'Challenges', 'Challenge', 'Hint', 'Solution', 'CardGrid', 'WhatsNext',
  'Note', 'Pitfall', 'DeepDive', 'Wip', 'Unvalidated', 'PreV1',
  'Signature', 'Parameters', 'Returns', 'Caveats', 'Recipe', 'Trouble',
  'TerminalBlock', 'ConsoleBlock', 'ProviderTabs', 'Diagram', 'AsciiDiagram',
];

const PLACEHOLDER = /\b(TODO|FIXME|TBD|lorem ipsum|coming soon|placeholder)\b/i;

/** Routes that exist outside the three sidebars. */
const EXTRA_ROUTES = new Set(['/', '/reference', '/blog']);

for (const { route, file } of files) {
  const raw = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);

  // --- frontmatter ---
  const fm = /^---\n([\s\S]*?)\n---\n/.exec(raw);
  if (!fm) {
    errors.push(`${rel}: missing frontmatter`);
    continue;
  }
  if (!/^title:/m.test(fm[1])) {
    errors.push(`${rel}: frontmatter has no "title"`);
  }

  const body = raw.slice(fm[0].length);

  // Fenced code is excluded: Go and JSON legitimately contain <, >, TODO and
  // unbalanced-looking text that is not MDX.
  const prose = body.replace(/^```[\s\S]*?^```/gm, '');

  // --- placeholders ---
  const placeholder = PLACEHOLDER.exec(prose);
  if (placeholder) {
    errors.push(`${rel}: placeholder content found ("${placeholder[0]}")`);
  }

  // --- substance ---
  if (prose.trim().length < 400) {
    warnings.push(`${rel}: unusually short (${prose.trim().length} chars of prose)`);
  }

  // --- tag balance ---
  // Several of these components are also valid self-closing (`<Unvalidated />`),
  // so those are counted separately and excluded from the opening tally.
  for (const tag of PAIRED_TAGS) {
    const all = (prose.match(new RegExp(`<${tag}(?=[\\s>/])`, 'g')) ?? []).length;
    const selfClosing = (prose.match(new RegExp(`<${tag}[^<>]*/>`, 'g')) ?? []).length;
    const open = all - selfClosing;
    const close = (prose.match(new RegExp(`</${tag}>`, 'g')) ?? []).length;
    if (open !== close) {
      errors.push(
        `${rel}: <${tag}> opened ${open} time(s) but closed ${close} time(s)` +
          (selfClosing ? ` (plus ${selfClosing} self-closing)` : ''),
      );
    }
  }

  // --- internal links ---
  for (const m of prose.matchAll(/\]\((\/[^)\s#]*)(#[^)\s]*)?\)/g)) {
    const target = m[1].replace(/\/$/, '') || '/';
    if (byRoute.has(target) || EXTRA_ROUTES.has(target)) continue;
    errors.push(`${rel}: link to "${target}" — no such route`);
  }

  // --- href props in JSX ---
  for (const m of prose.matchAll(/(?:href|path)=["'](\/[^"'#]*)(#[^"']*)?["']/g)) {
    const target = m[1].replace(/\/$/, '') || '/';
    if (byRoute.has(target) || EXTRA_ROUTES.has(target)) continue;
    errors.push(`${rel}: href/path to "${target}" — no such route`);
  }

  void route;
}

// --------------------------------------------------------------------------
// Report.
// --------------------------------------------------------------------------

console.log(`Checked ${files.length} pages against ${sidebarRoutes.length} sidebar routes.`);

if (warnings.length) {
  console.log(`\n${warnings.length} warning(s):`);
  for (const w of warnings) console.log(`  - ${w}`);
}

if (errors.length) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  ✗ ${e}`);
  process.exit(1);
}

console.log('\n✓ Every sidebar entry has a page, every page is linked, every internal link resolves.');
