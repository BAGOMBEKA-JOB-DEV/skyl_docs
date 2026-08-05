import Link from 'next/link';
import { SiteFooter } from '@/components/layout/page-chrome';

export default function NotFound() {
  return (
    <>
      <main id="main-content" className="mx-auto max-w-2xl px-6 py-28 text-center">
        <p className="text-6xl font-bold text-[var(--fg-subtle)]">404</p>
        <h1 className="mt-4 text-3xl font-bold">This page does not exist</h1>
        <p className="mt-4 text-[var(--fg-muted)]">
          It may have moved. Both documentation tracks are indexed below — or press{' '}
          <kbd className="rounded border px-1.5 py-0.5 font-mono text-xs">Ctrl K</kbd> to search.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/learn"
            className="rounded-full px-6 py-2.5 font-semibold no-underline"
            style={{ background: 'var(--accent)', color: 'var(--accent-fg)' }}
          >
            Learn skyl
          </Link>
          <Link href="/reference/skyl" className="rounded-full border px-6 py-2.5 font-semibold no-underline">
            API Reference
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
