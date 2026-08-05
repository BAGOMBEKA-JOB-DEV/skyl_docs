import Link from 'next/link';
import { siteConfig, skylVersion, topNav } from '@/config/site';
import { buildSearchIndex } from '@/lib/search-index';
import { SearchDialog } from './search-dialog';
import { ThemeToggle } from './theme-toggle';
import { NavLinks, MobileNavToggle } from './nav-links';

/**
 * The global header.
 *
 * Four nav items, a version badge and a search box, following react.dev — a
 * shape that has been load-bearing on a very large docs site for years, and
 * which tells a reader at a glance that there are exactly two kinds of page
 * here: things to read, and things to look up.
 */
export function SiteHeader() {
  const index = buildSearchIndex();

  return (
    <header
      className="sticky top-0 z-40 border-b backdrop-blur"
      style={{ background: 'color-mix(in srgb, var(--bg) 88%, transparent)' }}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-4 px-4 lg:px-6">
        <MobileNavToggle />

        <Link href="/" className="flex shrink-0 items-center gap-2 no-underline">
          <SkylMark />
          <span className="text-lg font-bold tracking-tight">{siteConfig.name}</span>
          <span
            className="hidden rounded-full px-2 py-0.5 font-mono text-[11px] font-medium sm:inline"
            style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
            title="The skyl version these docs describe"
          >
            v{skylVersion}
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2 md:ml-4">
          <SearchDialog index={index} />
        </div>

        <NavLinks items={[...topNav]} />

        <div className="flex items-center gap-1">
          <ThemeToggle />
          <a
            href={siteConfig.repo}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="skyl on GitHub"
            className="rounded-md p-2 text-[var(--fg-muted)] transition-colors hover:bg-[var(--bg-subtle)] hover:text-[var(--fg)]"
          >
            <GitHubIcon />
          </a>
        </div>
      </div>
    </header>
  );
}

function SkylMark() {
  return (
    <svg width="26" height="26" viewBox="0 0 32 32" fill="none" aria-hidden>
      <title>skyl</title>
      <path
        d="M6 20a5 5 0 0 1 1.2-9.85A7 7 0 0 1 20.6 9.3 5.35 5.35 0 1 1 22 20H6z"
        fill="var(--accent)"
        opacity="0.9"
      />
      <path d="M11 24.5h10M14 28h7" stroke="var(--accent)" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2 0-.4-.5-1.6.2-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0C17.3 4.9 18.3 5.2 18.3 5.2c.7 1.6.2 2.8.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.6-2.8 5.6-5.5 5.9.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3z" />
    </svg>
  );
}
