import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import GithubSlugger from 'github-slugger';

/**
 * Reads MDX content from `src/content`.
 *
 * A route maps to a file by its path: `/learn/streaming` is
 * `src/content/learn/streaming.mdx`, and a route that is also a parent (a
 * chapter overview) may live at `streaming/index.mdx` instead. Both forms are
 * accepted so a chapter can own a directory without its overview needing a
 * different URL.
 */

const CONTENT_ROOT = path.join(process.cwd(), 'src', 'content');

export interface Frontmatter {
  title: string;
  description?: string;
  /** Renders a badge beside the H1, e.g. "Unvalidated". */
  badge?: string;
  /** Suppresses the "Copy page" affordance where it makes no sense. */
  noCopy?: boolean;
  /** ISO publication date. Blog posts only; renders as a byline. */
  date?: string;
  /** Byline author. Blog posts only. */
  author?: string;
}

export interface Doc {
  route: string;
  filePath: string;
  frontmatter: Frontmatter;
  body: string;
  headings: Heading[];
}

export interface Heading {
  depth: 2 | 3;
  text: string;
  id: string;
}

/** Resolves a route to the file backing it, or undefined when there is none. */
export function resolveContentFile(route: string): string | undefined {
  const rel = route.replace(/^\//, '');
  const candidates = [
    path.join(CONTENT_ROOT, `${rel}.mdx`),
    path.join(CONTENT_ROOT, rel, 'index.mdx'),
  ];
  return candidates.find((c) => fs.existsSync(c));
}

/**
 * Extracts the ## and ### headings for the table of contents.
 *
 * Parsing the raw MDX rather than the rendered tree keeps this synchronous and
 * cheap, and the slugs match `rehype-slug` because both use github-slugger.
 * Fenced code is stripped first, so a Go comment beginning with `##` — or a
 * Markdown heading inside an example — cannot invent a phantom TOC entry.
 */
export function extractHeadings(body: string): Heading[] {
  const withoutCode = body.replace(/^```[\s\S]*?^```/gm, '');
  const slugger = new GithubSlugger();
  const out: Heading[] = [];

  for (const line of withoutCode.split('\n')) {
    const match = /^(#{2,3})\s+(.+?)\s*$/.exec(line);
    if (!match?.[1] || !match[2]) continue;
    const depth = match[1].length === 2 ? 2 : 3;
    // Strip inline markdown so the TOC reads as prose, not as source.
    const text = match[2]
      .replace(/`([^`]+)`/g, '$1')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .trim();
    out.push({ depth, text, id: slugger.slug(text) });
  }
  return out;
}

/** Loads the document for a route. Throws when the file is missing. */
export function getDoc(route: string): Doc {
  const filePath = resolveContentFile(route);
  if (!filePath) {
    throw new Error(
      `No MDX file for route "${route}". Expected src/content${route}.mdx or ` +
        `src/content${route}/index.mdx.`,
    );
  }
  const raw = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(raw);
  const frontmatter = data as Frontmatter;

  if (!frontmatter.title) {
    throw new Error(`${filePath} has no "title" in its frontmatter.`);
  }

  return {
    route,
    filePath,
    frontmatter,
    body: content,
    headings: extractHeadings(content),
  };
}

/** Every MDX file present on disk, as routes. Used by the link checker. */
export function listAllContentRoutes(): string[] {
  const out: string[] = [];
  const walk = (dir: string, prefix: string) => {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full, `${prefix}/${entry.name}`);
      } else if (entry.name.endsWith('.mdx')) {
        const base = entry.name.replace(/\.mdx$/, '');
        out.push(base === 'index' ? prefix : `${prefix}/${base}`);
      }
    }
  };
  walk(CONTENT_ROOT, '');
  return out;
}
