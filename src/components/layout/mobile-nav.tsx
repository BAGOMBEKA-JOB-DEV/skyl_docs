'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { topNav } from '@/config/site';
import { tracks, trackForPath } from '@/sidebars';
import type { SidebarItem } from '@/sidebars/types';
import { useSidebarDrawer } from './sidebar-drawer-context';

/**
 * The navigation drawer for narrow screens.
 *
 * It lives in the root layout rather than in `DocPage`, because `DocPage` does
 * not run on the home page — and a drawer that only exists on documentation
 * routes leaves a phone reader stranded on the landing page with nothing but
 * two hero buttons.
 *
 * It carries **both** levels of navigation, which is the part that was missing:
 * the four tracks (hidden in the header until `lg`) and, when the current route
 * belongs to one, that track's pages. Without the track links there is no way
 * to get from Learn to Reference on a phone at all.
 *
 * Open state, auto-close on navigation and the body scroll lock all come from
 * the existing `SidebarDrawerProvider`.
 */
export function MobileNav() {
  const { open, setOpen } = useSidebarDrawer();
  const pathname = usePathname() ?? '/';

  const track = trackForPath(pathname);
  const sidebar = track ? tracks[track].sidebar : null;

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-black/50 xl:hidden"
          onClick={() => setOpen(false)}
          role="presentation"
          data-testid="mobile-nav-backdrop"
        />
      ) : null}

      <div
        id="mobile-nav"
        data-testid="mobile-nav"
        aria-hidden={!open}
        className={[
          'fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] overflow-y-auto border-r',
          'px-4 pb-16 pt-20 transition-transform xl:hidden',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        style={{ background: 'var(--bg)' }}
      >
        <nav aria-label="Site sections">
          <h2 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-[var(--fg-subtle)]">
            Documentation
          </h2>
          <ul className="mb-7 space-y-0.5">
            {topNav.map((item) => {
              // `/reference/skyl` is the Reference landing, so compare on the
              // first segment rather than the whole href.
              const root = `/${item.href.split('/')[1]}`;
              const active = pathname === root || pathname.startsWith(`${root}/`);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className="block rounded-md px-2 py-2 text-[0.95rem] font-medium transition-colors"
                    style={{
                      color: active ? 'var(--accent)' : 'var(--fg)',
                      background: active ? 'var(--accent-subtle)' : 'transparent',
                    }}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {sidebar ? (
          <nav aria-label="On this section">
            {sidebar.map((section) => (
              <div key={section.title} className="mb-7">
                <h2 className="mb-2 px-2 text-xs font-bold uppercase tracking-wider text-[var(--fg-subtle)]">
                  {section.title}
                </h2>
                <ul className="space-y-0.5">
                  {section.items.map((item) => (
                    <MobileNode key={item.title} item={item} pathname={pathname} depth={0} />
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        ) : null}
      </div>
    </>
  );
}

function containsPath(item: SidebarItem, pathname: string): boolean {
  if (item.path === pathname) return true;
  return item.children?.some((c) => containsPath(c, pathname)) ?? false;
}

function MobileNode({
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

  return (
    <li>
      {item.path ? (
        <Link
          href={item.path}
          aria-current={active ? 'page' : undefined}
          className="block rounded-md px-2 py-1.5 text-sm transition-colors"
          style={{
            paddingLeft: `${0.5 + depth * 0.75}rem`,
            color: active ? 'var(--accent)' : inBranch ? 'var(--fg)' : 'var(--fg-muted)',
            background: active ? 'var(--accent-subtle)' : 'transparent',
            fontWeight: active ? 600 : depth === 0 ? 500 : 400,
          }}
        >
          {item.title}
        </Link>
      ) : (
        <span className="block px-2 py-1.5 text-sm font-semibold">{item.title}</span>
      )}

      {item.children?.length && inBranch ? (
        <ul className="mt-0.5 space-y-0.5 border-l" style={{ marginLeft: `${0.75 + depth * 0.75}rem` }}>
          {item.children.map((child) => (
            <MobileNode key={child.title} item={child} pathname={pathname} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}
