import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * The callout family.
 *
 * Each has one job and they are not interchangeable:
 *   Note      — useful context you can skip.
 *   Pitfall   — something that will bite you. Reserved for real traps.
 *   DeepDive  — why skyl works this way. Collapsed by default.
 *   Wip       — a documented gap, stated plainly rather than hidden.
 */

function Callout({
  tone,
  label,
  children,
}: {
  tone: 'note' | 'pitfall' | 'recap' | 'warn';
  label: string;
  children: ReactNode;
}) {
  const colors = {
    note: { fg: 'var(--note)', bg: 'var(--note-bg)' },
    pitfall: { fg: 'var(--pitfall)', bg: 'var(--pitfall-bg)' },
    recap: { fg: 'var(--recap)', bg: 'var(--recap-bg)' },
    warn: { fg: 'var(--warn)', bg: 'var(--warn-bg)' },
  }[tone];

  return (
    <aside
      className="my-6 rounded-lg border-l-4 px-5 py-4"
      style={{ borderLeftColor: colors.fg, background: colors.bg }}
      aria-label={label}
    >
      <p
        className="mb-2 text-xs font-bold uppercase tracking-wider"
        style={{ color: colors.fg }}
      >
        {label}
      </p>
      <div className="callout-body text-[0.95rem] leading-7">{children}</div>
    </aside>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return (
    <Callout tone="note" label="Note">
      {children}
    </Callout>
  );
}

export function Pitfall({ children }: { children: ReactNode }) {
  return (
    <Callout tone="pitfall" label="Pitfall">
      {children}
    </Callout>
  );
}

export function Wip({ children }: { children: ReactNode }) {
  return (
    <Callout tone="warn" label="Under construction">
      {children}
    </Callout>
  );
}

/**
 * Why skyl works this way.
 *
 * Collapsed by default because it is genuinely optional: a reader shipping code
 * does not need the rationale, and a reader evaluating the library needs
 * nothing else.
 */
export function DeepDive({ title, children }: { title: string; children: ReactNode }) {
  return (
    <details
      className="my-6 rounded-lg border px-5 py-4"
      style={{ background: 'var(--deep-dive-bg)', borderColor: 'var(--deep-dive)' }}
    >
      <summary className="cursor-pointer list-none font-semibold" style={{ color: 'var(--deep-dive)' }}>
        <span className="mr-2 text-xs font-bold uppercase tracking-wider">Deep dive</span>
        <span className="text-[var(--fg)]">{title}</span>
      </summary>
      <div className="callout-body mt-3 text-[0.95rem] leading-7">{children}</div>
    </details>
  );
}

/**
 * Stability badges.
 *
 * These exist to state the project's real status rather than imply either more
 * or less confidence than is warranted — which cuts both ways, as the comment
 * below records.
 */
/**
 * Live validation is a snapshot, not a subscription.
 *
 * This used to read "not yet validated against a live provider", and it was
 * true when written. It stopped being true on 2026-08-05 and stayed on fourteen
 * pages for a month afterwards, understating the project on every one of them —
 * which is the same failure as overstating it, pointing the other way.
 *
 * The caveat is kept rather than deleted because the underlying risk is real:
 * providers change their wire format without warning, and a passing run in
 * August proves nothing about today.
 */
export function ValidationSnapshot({ children }: { children?: ReactNode }) {
  return (
    <Callout tone="note" label="Validated on 2026-08-05 — a snapshot, not a subscription">
      {children ?? (
        <p>
          Every adapter has been exercised against its live provider API, so the wire mapping
          is confirmed rather than merely self-consistent. That was a point in time: providers
          change their formats, and a run that passed then proves nothing about today.{' '}
          <Link href="/reference/sandbox/validating">Re-run it against your own account</Link> before
          depending on a behaviour that matters to you.
        </p>
      )}
    </Callout>
  );
}

export function ApiStable({ children }: { children?: ReactNode }) {
  return (
    <Callout tone="note" label="Stable since v1.0.0">
      {children ?? (
        <p>
          Everything on this page is part of the frozen API: it will not change without a major
          version, which in Go means a new import path. Additions arrive in minor releases and
          are listed in the changelog.
        </p>
      )}
    </Callout>
  );
}
