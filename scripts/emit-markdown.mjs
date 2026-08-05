#!/usr/bin/env node
/**
 * Copies every page's Markdown source into `public/md/`, so the "Copy page"
 * button has something to fetch.
 *
 * For a reader pasting a page into an LLM, the source is more useful than the
 * rendered HTML. Serving it as a static file keeps the site a pure static
 * export.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const CONTENT = path.join(ROOT, 'src', 'content');
const OUT = path.join(ROOT, 'public', 'md');

function walk(dir, prefix = '') {
  const out = [];
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

fs.rmSync(OUT, { recursive: true, force: true });

let count = 0;
for (const { route, file } of walk(CONTENT)) {
  const dest = path.join(OUT, `${route}.md`);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(file, dest);
  count++;
}

console.log(`✓ Emitted ${count} Markdown sources to public/md/`);
