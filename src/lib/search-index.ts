import { sidebarBlog, sidebarCommunity, sidebarLearn, sidebarReference } from '@/sidebars';
import type { Sidebar, SidebarItem } from '@/sidebars/types';
import type { SearchEntry } from '@/components/layout/search-dialog';

/**
 * Builds the search index at compile time.
 *
 * Sourced from the sidebars rather than by crawling MDX, so the index and the
 * navigation can never disagree — and a page missing from the sidebar is a
 * link-checker failure rather than a page nobody can find.
 */
export function buildSearchIndex(): SearchEntry[] {
  const out: SearchEntry[] = [];

  const collect = (sidebar: Sidebar, track: string) => {
    const walk = (items: SidebarItem[], trail: string[]) => {
      for (const item of items) {
        if (item.path) {
          out.push({
            route: item.path,
            title: item.title,
            section: [track, ...trail].join(' › '),
            ...(item.description ? { description: item.description } : {}),
          });
        }
        if (item.children) walk(item.children, [...trail, item.title]);
      }
    };
    for (const section of sidebar) walk(section.items, [section.title]);
  };

  collect(sidebarLearn, 'Learn');
  collect(sidebarReference, 'Reference');
  collect(sidebarCommunity, 'Community');
  collect(sidebarBlog, 'Blog');

  return out;
}
