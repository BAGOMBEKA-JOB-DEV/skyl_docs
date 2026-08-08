'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Sidebar, SidebarItem } from '@/sidebars/types';

/**
 * The per-track sidebar.
 *
 * A branch expands when the current page is inside it, so a reader deep in a
 * chapter sees that chapter's siblings and not all 160 routes at once. Every
 * entry comes from `src/sidebars/*.ts` — the same source the link checker and
 * the search index read.
 */
export function DocSidebar({ sidebar }: { sidebar: Sidebar }) {
  const pathname = usePathname() ?? '';

  return (
      <aside
        data-testid="doc-sidebar"
        // Desktop only. Below `xl` navigation lives in `MobileNav`, which is
        // mounted in the layout so it exists on the home page too — this
        // component cannot serve that role because `DocPage` does not render
        // there.
        className={[
          'hidden w-72 overflow-y-auto border-r px-4 pb-16',
          'xl:sticky xl:top-16 xl:block xl:h-[calc(100vh-4rem)] xl:pt-6',
        ].join(' ')}
        style={{ background: 'var(--bg)' }}
        aria-label="Documentation navigation"
      >
        {sidebar.map((section) => (
          <div key={section.title} className="mb-7">
            <h2 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-[var(--fg-subtle)]">
              {section.title}
            </h2>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarNode key={item.title} item={item} pathname={pathname} depth={0} />
              ))}
            </ul>
          </div>
        ))}
      </aside>
  );
}

function containsPath(item: SidebarItem, pathname: string): boolean {
  if (item.path === pathname) return true;
  return item.children?.some((c) => containsPath(c, pathname)) ?? false;
}

function SidebarNode({
  item,
  pathname,
  depth,
}: {
  item: SidebarItem;
  pathname: string;
  depth: number;
}) {
  const active = item.path === pathname;
  const inBranch = containsPath(item, pathname);
  const hasChildren = Boolean(item.children?.length);

  return (
    <li>
      {item.path ? (
        <Link
          href={item.path}
          aria-current={active ? 'page' : undefined}
          className="flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors"
          style={{
            paddingLeft: `${0.5 + depth * 0.75}rem`,
            color: active ? 'var(--accent)' : inBranch ? 'var(--fg)' : 'var(--fg-muted)',
            background: active ? 'var(--accent-subtle)' : 'transparent',
            fontWeight: active ? 600 : depth === 0 ? 500 : 400,
          }}
        >
          <span>{item.title}</span>
          {item.badge ? (
            <span
              className="ml-2 shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium"
              style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}
            >
              {item.badge}
            </span>
          ) : null}
        </Link>
      ) : (
        <span className="block px-2 py-1.5 text-sm font-semibold">{item.title}</span>
      )}

      {hasChildren && inBranch ? (
        <ul
          className="mt-0.5 space-y-0.5 border-l"
          style={{ marginLeft: `${0.75 + depth * 0.75}rem` }}
        >
          {item.children?.map((child) => (
            <SidebarNode key={child.title} item={child} pathname={pathname} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
