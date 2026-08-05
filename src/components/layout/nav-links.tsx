'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSidebarDrawer } from './sidebar-drawer-context';

/** Top-level nav, with the current track highlighted. */
export function NavLinks({ items }: { items: { label: string; href: string }[] }) {
  const pathname = usePathname() ?? '/';

  return (
    <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
      {items.map((item) => {
        // `/reference/skyl` is the Reference landing, so compare on the first segment.
        const root = `/${item.href.split('/')[1]}`;
        const active = pathname === root || pathname.startsWith(`${root}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className="rounded-md px-3 py-2 text-sm font-medium transition-colors"
            style={{
              color: active ? 'var(--accent)' : 'var(--fg-muted)',
              background: active ? 'var(--accent-subtle)' : 'transparent',
            }}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

/** Opens the sidebar as a drawer on narrow screens. */
export function MobileNavToggle() {
  const { open, setOpen } = useSidebarDrawer();
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      aria-label="Toggle navigation"
      aria-expanded={open}
      data-testid="nav-toggle"
      className="rounded-md p-2 text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-subtle)] xl:hidden"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    </button>
  );
}
