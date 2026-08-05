import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { formatPostDate } from '@/data/blog';
import type { SidebarItem, SidebarSection } from '@/sidebars/types';
import { CopyPageButton } from './copy-page-button';

/** The trail above the H1: track › section › chapter. */
export function Breadcrumbs({
  track,
  trackHref,
  section,
  parent,
}: {
  track: string;
  trackHref: string;
  section?: SidebarSection;
  parent?: SidebarItem;
}) {
  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-xs font-semibold uppercase tracking-wider">
      <ol className="flex flex-wrap items-center gap-1.5 text-[var(--accent)]">
        <li>
          <Link href={trackHref}>{track}</Link>
        </li>
        {section ? (
          <li className="flex items-center gap-1.5 text-[var(--fg-subtle)]">
            <span aria-hidden>›</span>
            <span>{section.title}</span>
          </li>
        ) : null}
        {parent?.path ? (
          <li className="flex items-center gap-1.5">
            <span aria-hidden className="text-[var(--fg-subtle)]">
              ›
            </span>
            <Link href={parent.path}>{parent.title}</Link>
          </li>
        ) : null}
      </ol>
    </nav>
  );
}

/** The page title, its badge, and the copy affordance. */
export function PageHeader({
  title,
  description,
  badge,
  markdownPath,
  noCopy,
  date,
  author,
}: {
  title: string;
  description?: string;
  badge?: string;
  markdownPath: string;
  noCopy?: boolean;
  date?: string;
  author?: string;
}) {
  return (
    <div className="mb-6">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-4xl font-bold leading-tight tracking-tight">
          {title}
          {badge ? (
            <span
              className="ml-3 align-middle rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide"
              style={{ background: 'var(--warn-bg)', color: 'var(--warn)' }}
            >
              {badge}
            </span>
          ) : null}
        </h1>
        {noCopy ? null : <CopyPageButton markdownPath={markdownPath} />}
      </div>
      {date ? (
        <p className="mt-3 text-sm text-[var(--fg-subtle)]">
          <time dateTime={date}>{formatPostDate(date)}</time>
          {author ? <> · {author}</> : null}
        </p>
      ) : null}
      {description ? (
        <p className="mt-3 text-lg text-[var(--fg-muted)]">{description}</p>
      ) : null}
    </div>
  );
}

/** Sequential navigation through the flattened sidebar. */
export function PrevNext({ prev, next }: { prev?: SidebarItem; next?: SidebarItem }) {
  if (!prev && !next) return null;
  return (
    <nav
      className="mt-16 grid gap-4 border-t pt-8 sm:grid-cols-2"
      aria-label="Previous and next page"
    >
      {prev?.path ? (
        <Link
          href={prev.path}
          className="rounded-xl border p-4 no-underline transition-colors hover:border-[var(--accent)]"
        >
          <span className="block text-xs uppercase tracking-wider text-[var(--fg-subtle)]">
            Previous
          </span>
          <span className="mt-1 block font-semibold text-[var(--accent)]">← {prev.title}</span>
        </Link>
      ) : (
        <span />
      )}
      {next?.path ? (
        <Link
          href={next.path}
          className="rounded-xl border p-4 text-right no-underline transition-colors hover:border-[var(--accent)] sm:col-start-2"
        >
          <span className="block text-xs uppercase tracking-wider text-[var(--fg-subtle)]">
            Next
          </span>
          <span className="mt-1 block font-semibold text-[var(--accent)]">{next.title} →</span>
        </Link>
      ) : null}
    </nav>
  );
}

/** The edit link, so a reader who spots an error can fix it. */
export function EditThisPage({ filePath }: { filePath: string }) {
  const rel = filePath.split('skyl_docs/')[1] ?? filePath;
  return (
    <p className="mt-8 text-sm">
      <a
        href={`${siteConfig.docsRepo}/edit/main/${rel}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--fg-muted)] hover:text-[var(--accent)]"
      >
        Edit this page on GitHub
      </a>
    </p>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t py-10 text-sm text-[var(--fg-muted)]">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-4 px-6">
        <p>
          skyl is licensed under {siteConfig.license}. Documentation licensed under CC BY 4.0.
        </p>
        <div className="flex gap-5">
          <Link href="/community/versions">Versions</Link>
          <Link href="/community/security">Security</Link>
          <a href={siteConfig.repo} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
        </div>
      </div>
    </footer>
  );
}
