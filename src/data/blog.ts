/**
 * Blog post metadata.
 *
 * Single source of truth for the sidebar, the index page and the search index —
 * the same rule the rest of the site follows, so a post cannot appear in the
 * navigation with one title and on the index with another.
 *
 * Posts are listed newest-first here and rendered in that order.
 */

export interface BlogPost {
  slug: string;
  title: string;
  /** ISO date. Rendered as the byline and used for ordering. */
  date: string;
  author: string;
  /** One or two sentences shown on the index and in search results. */
  summary: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: 'silently-ignored',
    title: 'The fourteen things skyl silently ignores',
    date: '2026-08-05',
    author: 'skyl maintainers',
    summary:
      'Every place the library accepts something and then does not do it — with the reason and ' +
      'the workaround for each. This is the list that costs you an afternoon if nobody writes it down.',
  },
  {
    slug: 'no-copilot-provider',
    title: 'Why there is no Copilot provider',
    date: '2026-08-05',
    author: 'skyl maintainers',
    summary:
      'A package that could exist, would be popular, and deliberately does not. Copilot exposes ' +
      'no completions API, so the only thing skyl could ship under that name would be a lie.',
  },
  {
    slug: 'introducing-skyl',
    title: 'Introducing skyl',
    date: '2026-08-05',
    author: 'skyl maintainers',
    summary:
      'One Go interface for every AI model: the problem it solves, the four-module split that ' +
      'keeps the core dependency-free, and an honest account of what is not yet proven.',
  },
];

/** Formats an ISO date for display, e.g. "5 August 2026". */
export function formatPostDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${d} ${months[(m ?? 1) - 1]} ${y}`;
}
