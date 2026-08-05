import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * The Learn-track page furniture, following react.dev.
 *
 * These components are what make a Learn page a Learn page: an intro that
 * frames the topic, a contract about what you will know afterwards, a recap
 * that closes it, and challenges that prove it.
 */

/** The lead paragraph. Larger than body text; every page opens with one. */
export function Intro({ children }: { children: ReactNode }) {
  return (
    <div className="intro mb-10 text-lg leading-8 text-[var(--fg-muted)]">{children}</div>
  );
}

/**
 * The contract with the reader.
 *
 * `isChapter` renders the chapter variant used on overview pages, which
 * promises what the whole chapter covers rather than one page.
 */
export function YouWillLearn({
  children,
  isChapter = false,
}: {
  children: ReactNode;
  isChapter?: boolean;
}) {
  return (
    <section
      className="my-8 rounded-xl border px-6 py-5"
      style={{ background: 'var(--bg-subtle)', borderColor: 'var(--border)' }}
      aria-label={isChapter ? 'In this chapter' : 'You will learn'}
    >
      <h2 className="!mt-0 !mb-3 !border-0 !pb-0 text-lg font-bold">
        {isChapter ? 'In this chapter' : 'You will learn'}
      </h2>
      <div className="you-will-learn text-[0.95rem] leading-7">{children}</div>
    </section>
  );
}

/** A card linking onward, used in grids on overview pages. */
export function YouWillLearnCard({
  title,
  path,
  children,
}: {
  title: string;
  path: string;
  children?: ReactNode;
}) {
  return (
    <Link
      href={path}
      className="group block rounded-xl border p-5 no-underline transition-colors hover:border-[var(--accent)]"
      style={{ background: 'var(--bg-elevated)', boxShadow: 'var(--shadow-card)' }}
    >
      <h4 className="!m-0 font-semibold text-[var(--fg)] group-hover:text-[var(--accent)]">
        {title}
      </h4>
      {children ? (
        <div className="mt-2 text-sm leading-6 text-[var(--fg-muted)]">{children}</div>
      ) : null}
    </Link>
  );
}

/** The "Read X to learn how to…" link that closes each section of an overview. */
export function LearnMore({ children, path }: { children: ReactNode; path?: string }) {
  return (
    <div
      className="my-6 rounded-lg border px-5 py-4 text-[0.95rem]"
      style={{ background: 'var(--accent-subtle)', borderColor: 'var(--accent)' }}
    >
      <div className="learn-more">{children}</div>
      {path ? (
        <p className="!mb-0 !mt-3">
          <Link href={path} className="font-semibold text-[var(--accent)]">
            Read more →
          </Link>
        </p>
      ) : null}
    </div>
  );
}

/** Closes a Learn page: the five to eight things that page was actually for. */
export function Recap({ children }: { children: ReactNode }) {
  return (
    <section
      className="my-10 rounded-xl border-l-4 px-6 py-5"
      style={{ borderLeftColor: 'var(--recap)', background: 'var(--recap-bg)' }}
      aria-label="Recap"
    >
      <h2 className="!mt-0 !mb-3 !border-0 !pb-0 text-lg font-bold" style={{ color: 'var(--recap)' }}>
        Recap
      </h2>
      <div className="recap-body text-[0.95rem] leading-7">{children}</div>
    </section>
  );
}

/** The exercises block. */
export function Challenges({ children }: { children: ReactNode }) {
  return (
    <section className="my-12" aria-label="Challenges">
      <h2 className="mb-2 border-b pb-2 text-2xl font-bold">Try out some challenges</h2>
      <p className="mb-6 text-[var(--fg-muted)]">
        Each of these is solvable with what this page covered. Run them against the sandbox —
        no API key needed.
      </p>
      <div className="space-y-6">{children}</div>
    </section>
  );
}

export function Challenge({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div
      className="rounded-xl border p-5"
      style={{ background: 'var(--bg-elevated)', boxShadow: 'var(--shadow-card)' }}
    >
      <h3 className="!mt-0 !mb-3 text-lg font-semibold">{title}</h3>
      {children}
    </div>
  );
}

export function Hint({ children }: { children: ReactNode }) {
  return (
    <details className="my-3 rounded-lg border px-4 py-3" style={{ background: 'var(--bg-subtle)' }}>
      <summary className="cursor-pointer text-sm font-semibold text-[var(--fg-muted)]">
        Show hint
      </summary>
      <div className="mt-2 text-[0.95rem] leading-7">{children}</div>
    </details>
  );
}

export function Solution({ children }: { children: ReactNode }) {
  return (
    <details
      className="my-3 rounded-lg border px-4 py-3"
      data-testid="solution"
      style={{ background: 'var(--bg-subtle)' }}
    >
      <summary className="cursor-pointer text-sm font-semibold text-[var(--accent)]">
        Show solution
      </summary>
      <div className="mt-2 text-[0.95rem] leading-7">{children}</div>
    </details>
  );
}

/** A grid, for card layouts on overview pages. */
export function CardGrid({ children }: { children: ReactNode }) {
  return <div className="my-6 grid gap-4 sm:grid-cols-2">{children}</div>;
}

/** Closes a chapter overview: where to go next, and when to skip ahead. */
export function WhatsNext({ children }: { children: ReactNode }) {
  return (
    <section className="my-10" aria-label="What's next">
      <h2 className="mb-3 border-b pb-2 text-2xl font-bold">What&rsquo;s next?</h2>
      <div className="text-[0.95rem] leading-7">{children}</div>
    </section>
  );
}
