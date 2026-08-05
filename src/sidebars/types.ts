/**
 * Sidebar model.
 *
 * A route exists on this site if and only if it appears in one of these trees.
 * That is deliberate: the link checker walks the sidebars and asserts an MDX
 * file behind every entry, so an orphaned page or a dead link fails the build
 * rather than reaching a reader.
 */

export interface SidebarItem {
  title: string;
  /** Route path, e.g. `/learn/streaming`. Omitted for a pure grouping heading. */
  path?: string;
  /** Short description, used on chapter cards and in search results. */
  description?: string;
  children?: SidebarItem[];
  /** Renders a small badge, e.g. "Unvalidated". */
  badge?: string;
}

export interface SidebarSection {
  /** The uppercase group heading, e.g. "GET STARTED". */
  title: string;
  items: SidebarItem[];
}

export type Sidebar = SidebarSection[];

/** Flattens a sidebar into an ordered list of routed pages, for prev/next. */
export function flattenSidebar(sidebar: Sidebar): SidebarItem[] {
  const out: SidebarItem[] = [];
  const walk = (items: SidebarItem[]) => {
    for (const item of items) {
      if (item.path) out.push(item);
      if (item.children) walk(item.children);
    }
  };
  for (const section of sidebar) walk(section.items);
  return out;
}

/** Finds an item by route, returning it with its section title. */
export function findInSidebar(
  sidebar: Sidebar,
  path: string,
): { item: SidebarItem; section: SidebarSection; parent?: SidebarItem } | undefined {
  for (const section of sidebar) {
    const search = (
      items: SidebarItem[],
      parent?: SidebarItem,
    ): { item: SidebarItem; parent?: SidebarItem } | undefined => {
      for (const item of items) {
        if (item.path === path) return { item, parent };
        if (item.children) {
          const hit = search(item.children, item);
          if (hit) return hit;
        }
      }
      return undefined;
    };
    const hit = search(section.items);
    if (hit) return { item: hit.item, section, parent: hit.parent };
  }
  return undefined;
}
