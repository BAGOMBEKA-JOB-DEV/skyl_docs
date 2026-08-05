import { sidebarLearn } from './learn';
import { sidebarReference } from './reference';
import { sidebarCommunity } from './community';
import { sidebarBlog } from './blog';
import { flattenSidebar, type Sidebar } from './types';

export { sidebarLearn, sidebarReference, sidebarCommunity, sidebarBlog };
export * from './types';

/** The four tracks the header links to. */
export type TrackId = 'learn' | 'reference' | 'community' | 'blog';

export const tracks: Record<TrackId, { label: string; sidebar: Sidebar; root: string }> = {
  learn: { label: 'Learn', sidebar: sidebarLearn, root: '/learn' },
  reference: { label: 'Reference', sidebar: sidebarReference, root: '/reference/skyl' },
  community: { label: 'Community', sidebar: sidebarCommunity, root: '/community' },
  blog: { label: 'Blog', sidebar: sidebarBlog, root: '/blog' },
};

/** Resolves a route to its track, so the shell knows which sidebar to render. */
export function trackForPath(path: string): TrackId | undefined {
  if (path === '/learn' || path.startsWith('/learn/')) return 'learn';
  if (path === '/reference' || path.startsWith('/reference/')) return 'reference';
  if (path === '/community' || path.startsWith('/community/')) return 'community';
  if (path === '/blog' || path.startsWith('/blog/')) return 'blog';
  return undefined;
}

/** Every routed page across all sidebars, for the link checker and e2e. */
export function allRoutes(): string[] {
  return Object.values(tracks).flatMap((t) =>
    flattenSidebar(t.sidebar).map((i) => i.path as string),
  );
}
