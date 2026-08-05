import { visit } from 'unist-util-visit';
import { createHighlighter, type Highlighter } from 'shiki';
import type { Element, Root } from 'hast';

/**
 * Highlights fenced code blocks with Shiki at build time.
 *
 * Both themes are rendered into the output and one is hidden with CSS, rather
 * than re-highlighting on the client. Highlighting is the single most expensive
 * thing this site does, and doing it once per build instead of once per reader
 * is what keeps the pages static and instant.
 *
 * Supported meta on the fence:
 *
 *     ```go title="main.go" {3,7-9} verify
 *
 * `verify` marks a snippet that `scripts/check-snippets.mjs` must compile
 * against the real library.
 */

const LANGS = [
  'go',
  'bash',
  'shell',
  'json',
  'jsonc',
  'yaml',
  'toml',
  'typescript',
  'tsx',
  'javascript',
  'diff',
  'http',
  'text',
  'md',
  'mdx',
  'dockerfile',
  'ini',
] as const;

let highlighterPromise: Promise<Highlighter> | undefined;

function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: ['github-light', 'github-dark'],
    langs: [...LANGS],
  });
  return highlighterPromise;
}

/** Parses `{1,3-5}` from a fence's meta string into a set of line numbers. */
function parseHighlightedLines(meta: string): Set<number> {
  const out = new Set<number>();
  const match = /\{([\d,\s-]+)\}/.exec(meta);
  if (!match?.[1]) return out;
  for (const part of match[1].split(',')) {
    const range = part.trim();
    if (!range) continue;
    const [rawStart, rawEnd] = range.split('-');
    const start = Number(rawStart);
    const end = rawEnd === undefined ? start : Number(rawEnd);
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    for (let i = start; i <= end; i++) out.add(i);
  }
  return out;
}

/** Parses `title="main.go"` from a fence's meta string. */
function parseTitle(meta: string): string | undefined {
  return /title="([^"]+)"/.exec(meta)?.[1];
}

interface CodeNode {
  lang: string;
  meta: string;
  value: string;
  parent: Element;
  index: number;
  grandparentIndex: number;
  grandparent: Root | Element;
}

export function rehypeShiki() {
  return async function transformer(tree: Root): Promise<void> {
    const jobs: CodeNode[] = [];

    visit(tree, 'element', (node: Element, index, parent) => {
      if (node.tagName !== 'pre' || index === undefined || !parent) return;
      const code = node.children.find(
        (c): c is Element => c.type === 'element' && c.tagName === 'code',
      );
      if (!code) return;

      const className = code.properties?.className;
      const classes = Array.isArray(className) ? className.map(String) : [];
      const langClass = classes.find((c) => c.startsWith('language-'));
      const lang = langClass?.replace('language-', '') ?? 'text';

      const value = code.children
        .filter((c): c is { type: 'text'; value: string } => c.type === 'text')
        .map((c) => c.value)
        .join('');

      // `remarkCodeMeta` copies the fence's meta string here, because
      // mdast-util-to-hast drops everything after the language.
      const meta = String(code.properties?.['dataMeta'] ?? code.properties?.['data-meta'] ?? '');

      jobs.push({
        lang: (LANGS as readonly string[]).includes(lang) ? lang : 'text',
        meta,
        value,
        parent: node,
        index,
        grandparent: parent as Root | Element,
        grandparentIndex: index,
      });
    });

    if (jobs.length === 0) return;
    const highlighter = await getHighlighter();

    for (const job of jobs) {
      const highlighted = parseHighlightedLines(job.meta);
      const title = parseTitle(job.meta);
      const isVerified = /\bverify\b/.test(job.meta);

      const render = (theme: 'github-light' | 'github-dark', variant: 'light' | 'dark') =>
        highlighter.codeToHast(job.value.replace(/\n$/, ''), {
          lang: job.lang,
          theme,
          transformers: [
            {
              name: 'skyl-line-highlight',
              line(node, line) {
                node.properties['class'] = highlighted.has(line) ? 'line highlighted' : 'line';
              },
              pre(node) {
                const existing = String(node.properties['class'] ?? '');
                node.properties['class'] = `${existing} shiki--${variant}`.trim();
              },
            },
          ],
        }) as Root;

      const light = render('github-light', 'light');
      const dark = render('github-dark', 'dark');

      const wrapper: Element = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['code-block'],
          'data-language': job.lang,
          ...(title ? { 'data-title': title } : {}),
          ...(isVerified ? { 'data-verify': 'true' } : {}),
          'data-code': job.value,
        },
        children: [...light.children, ...dark.children] as Element[],
      };

      const siblings = (job.grandparent as Root).children;
      siblings[job.index] = wrapper;
    }
  };
}
