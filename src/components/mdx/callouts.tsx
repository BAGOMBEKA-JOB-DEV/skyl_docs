import type { ReactNode } from 'react';

/**
 * The callout family, following react.dev's vocabulary.
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
 * skyl's real status is unusual and worth being honest about: the code is
 * written, tested and CI-green, but no adapter has yet made a call to a live
 * provider. `Unvalidated` says exactly that, rather than implying either more
 * or less confidence than is warranted.
 */
export function Unvalidated({ children }: { children?: ReactNode }) {
  return (
    <Callout tone="warn" label="Not yet validated against a live provider">
      {children ?? (
        <p>
          Everything on this page is implemented, unit-tested, contract-tested and exercised
          end to end over real sockets — but every fake in the test suite was written from the
          same provider documentation as the adapter it tests. If a field name is wrong, the
          fake is wrong in the same way and both stay green. Treat it as ready to evaluate,
          not ready to depend on.
        </p>
      )}
    </Callout>
  );
}

export function PreV1({ children }: { children?: ReactNode }) {
  return (
    <Callout tone="note" label="Pre-v1">
      {children ?? (
        <p>
          skyl has not reached v1.0.0. Breaking changes may land in minor releases; each one is
          listed in the changelog with a migration note.
        </p>
      )}
    </Callout>
  );
}
