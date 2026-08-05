#!/usr/bin/env node
/**
 * One-off maintenance tool: removes the `verify` marker from snippets that do
 * not compile standalone.
 *
 * `verify` renders a **Compiles** badge on the page, so it has to mean exactly
 * one thing: this snippet type-checks against the real library on its own. Many
 * snippets are legitimately excerpts — they refer to a helper defined three
 * paragraphs earlier, or to a variable the surrounding narrative introduced —
 * and those must not claim a guarantee they cannot keep.
 *
 * Run `check-snippets.mjs --keep` first, then this against the work directory.
 *
 *   node scripts/demote-snippets.mjs [--dry-run]
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const ROOT = path.resolve(import.meta.dirname, '..');
const WORK = path.join(ROOT, '.snippet-check');
const CONTENT = path.join(ROOT, 'src', 'content');
const DRY = process.argv.includes('--dry-run');

if (!fs.existsSync(WORK)) {
  console.error('No .snippet-check directory. Run: node scripts/check-snippets.mjs --keep');
  process.exit(1);
}

// --- which packages fail ---
const build = spawnSync('go', ['build', '-gcflags=-e', './...'], {
  cwd: WORK,
  env: { ...process.env, GOWORK: 'off' },
  encoding: 'utf8',
});
const failing = new Set(
  [...(build.stderr ?? '').matchAll(/^# snippetcheck\/s(\d+)$/gm)].map((m) => Number(m[1])),
);

if (failing.size === 0) {
  console.log('✓ Nothing to demote — every verified snippet compiles.');
  process.exit(0);
}

// --- rebuild the same snippet ordering the checker used ---
function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (entry.name.endsWith('.mdx')) out.push(full);
  }
  return out;
}

const FENCE = /^```go([^\n]*)\n([\s\S]*?)^```$/gm;

const snippets = [];
for (const file of walk(CONTENT)) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(FENCE)) {
    if (!/\bverify\b/.test(m[1] ?? '')) continue;
    snippets.push({ file, start: m.index, meta: m[1] });
  }
}

// --- strip the marker, back to front so offsets stay valid ---
const byFile = new Map();
for (const n of failing) {
  const s = snippets[n];
  if (!s) continue;
  if (!byFile.has(s.file)) byFile.set(s.file, []);
  byFile.get(s.file).push(s);
}

let demoted = 0;
for (const [file, list] of byFile) {
  let src = fs.readFileSync(file, 'utf8');
  for (const s of list.sort((a, b) => b.start - a.start)) {
    const lineEnd = src.indexOf('\n', s.start);
    const line = src.slice(s.start, lineEnd);
    const stripped = line.replace(/\s*\bverify\b/, '');
    if (stripped === line) continue;
    src = src.slice(0, s.start) + stripped + src.slice(lineEnd);
    demoted++;
  }
  if (!DRY) fs.writeFileSync(file, src);
}

console.log(
  `${DRY ? 'Would demote' : 'Demoted'} ${demoted} snippet(s) across ${byFile.size} file(s).`,
);
console.log('These are excerpts that depend on surrounding context; they keep their');
console.log('syntax highlighting but no longer claim to compile standalone.');
