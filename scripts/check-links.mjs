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

/**
 * `blog.ts` builds its entries from `src/data/blog.ts` with a template literal,
 * so the regex above sees only the literal `/blog`. Expand the generated post
 * routes from the data file instead — otherwise every post looks orphaned.
 */
function blogPostRoutes() {
  const src = fs.readFileSync(path.join(ROOT, 'src', 'data', 'blog.ts'), 'utf8');
  return [...src.matchAll(/^\s*slug:\s*'([^']+)'/gm)].map((m) => `/blog/${m[1]}`);
}

const sidebarRoutes = [
  ...routesFromSidebar('learn.ts'),
  ...routesFromSidebar('reference.ts'),
  ...routesFromSidebar('community.ts'),
  ...routesFromSidebar('blog.ts'),
  ...blogPostRoutes(),
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

/**
 * Routes that exist outside the three sidebars.
 *
 * Keep this list minimal. It is an *exemption* from checking, so anything added
 * here stops being verified — which is exactly how a dead `/blog` nav item
 * survived: it was listed here rather than checked, and 404'd in the browser
 * while this script reported success.
 */
const EXTRA_ROUTES = new Set(['/']);

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
// App icons. An SVG served as image/svg+xml is parsed as strict XML, so a
// double hyphen inside a comment makes the browser reject it — while the file
// still returns 200 and passes every check that only looks at status codes.
// This shipped once; it is cheap to make impossible.
// --------------------------------------------------------------------------

for (const icon of ['icon.svg']) {
  const file = path.join(ROOT, 'src', 'app', icon);
  if (!fs.existsSync(file)) {
    errors.push(`src/app/${icon} is missing — the site would fall back to the browser's default favicon`);
    continue;
  }
  const svg = fs.readFileSync(file, 'utf8');
  for (const comment of svg.matchAll(/<!--([\s\S]*?)-->/g)) {
    if (comment[1].includes('--')) {
      errors.push(
        `src/app/${icon}: a comment contains a double hyphen, which is invalid XML — ` +
          `browsers will refuse to render the icon`,
      );
    }
  }
  if (/var\(/.test(svg)) {
    errors.push(
      `src/app/${icon}: uses a CSS custom property, which does not resolve outside the page`,
    );
  }
}

// --------------------------------------------------------------------------
// The top navigation. Checked from source, because a dead nav item is the most
// visible possible broken link and lives outside the sidebars entirely.
// --------------------------------------------------------------------------

const siteConfig = fs.readFileSync(path.join(ROOT, 'src', 'config', 'site.ts'), 'utf8');
const navBlock = /export const topNav = \[([\s\S]*?)\] as const;/.exec(siteConfig);

if (!navBlock) {
  errors.push('src/config/site.ts: could not find topNav — the nav check is not running');
} else {
  const navHrefs = [...navBlock[1].matchAll(/href:\s*'([^']+)'/g)].map((m) => m[1]);
  if (navHrefs.length === 0) {
    errors.push('src/config/site.ts: topNav has no entries');
  }
  for (const href of navHrefs) {
    const target = href.replace(/\/$/, '') || '/';
    if (byRoute.has(target) || EXTRA_ROUTES.has(target)) continue;
    errors.push(`src/config/site.ts: nav item "${href}" points at a route that does not exist`);
  }
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
