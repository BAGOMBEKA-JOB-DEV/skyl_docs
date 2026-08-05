import type { ReactNode } from 'react';
import type { GoField } from '@/types';

/**
 * The Reference-page template, following react.dev's rigid structure:
 *
 *   Reference → signature, Parameters, Returns, Caveats
 *   Usage     → task-oriented recipes
 *   Troubleshooting → headings phrased as the reader's own complaint
 *
 * The rigidity is the feature. A reader who has read one reference page knows
 * exactly where to look on all sixty of the others.
 */

/** The exact Go declaration, set apart from prose. */
export function Signature({ children }: { children: ReactNode }) {
  return (
    <div
      className="my-5 overflow-x-auto rounded-lg border px-4 py-3 font-mono text-[0.9rem] leading-7"
      style={{ background: 'var(--bg-inset)' }}
    >
      {children}
    </div>
  );
}

/** Every parameter: type, meaning, and what happens if you omit it. */
export function Parameters({ children }: { children: ReactNode }) {
  return (
    <section className="my-6" aria-label="Parameters">
      <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-[var(--fg-subtle)]">
        Parameters
      </h4>
      <div className="params text-[0.95rem] leading-7">{children}</div>
    </section>
  );
}

export function Returns({ children }: { children: ReactNode }) {
  return (
    <section className="my-6" aria-label="Returns">
      <h4 className="mb-2 text-sm font-bold uppercase tracking-wider text-[var(--fg-subtle)]">
        Returns
      </h4>
      <div className="returns text-[0.95rem] leading-7">{children}</div>
    </section>
  );
}

/**
 * The non-obvious rules.
 *
 * This is the section that earns a reference page its keep — the behaviour a
 * signature cannot express and a reader will otherwise learn in production.
 */
export function Caveats({ children }: { children: ReactNode }) {
  return (
    <section
      className="my-6 rounded-lg border-l-4 px-5 py-4"
      style={{ borderLeftColor: 'var(--warn)', background: 'var(--warn-bg)' }}
      aria-label="Caveats"
    >
      <h4 className="mb-2 text-sm font-bold uppercase tracking-wider" style={{ color: 'var(--warn)' }}>
        Caveats
      </h4>
      <div className="caveats text-[0.95rem] leading-7">{children}</div>
    </section>
  );
}

/** A named recipe inside the Usage section. */
export function Recipe({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="my-8">
      <h3 className="mb-3 text-xl font-semibold">{title}</h3>
      {children}
    </section>
  );
}

/** One Troubleshooting entry, headed as the reader's complaint. */
export function Trouble({ problem, children }: { problem: string; children: ReactNode }) {
  return (
    <section className="my-7">
      <h3 className="mb-2 text-lg font-semibold">{problem}</h3>
      <div className="text-[0.95rem] leading-7">{children}</div>
    </section>
  );
}

/**
 * Renders a struct's fields as a table.
 *
 * Driven by `src/data`, so a field documented once appears identically on the
 * reference page, the guide that uses it, and the gateway's wire-format page.
 */
export function FieldTable({ fields, showJson = false }: { fields: GoField[]; showJson?: boolean }) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-left text-[0.9rem]">
        <thead style={{ background: 'var(--bg-subtle)' }}>
          <tr>
            <th className="px-4 py-2.5 font-semibold">Field</th>
            <th className="px-4 py-2.5 font-semibold">Type</th>
            {showJson ? <th className="px-4 py-2.5 font-semibold">JSON</th> : null}
            <th className="px-4 py-2.5 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {fields.map((f) => (
            <tr key={f.name} className="border-t align-top">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-[0.85rem] font-semibold">
                {f.name}
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-[0.8rem] text-[var(--fg-muted)]">
                {f.type}
              </td>
              {showJson ? (
                <td className="whitespace-nowrap px-4 py-3 font-mono text-[0.8rem] text-[var(--fg-muted)]">
                  {f.json ?? '—'}
                </td>
              ) : null}
              <td className="px-4 py-3 leading-6">
                {f.description}
                {f.zeroValue ? (
                  <div className="mt-1.5 text-[0.85rem] text-[var(--fg-subtle)]">
                    <span className="font-semibold">Zero value:</span> {f.zeroValue}
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A generic data table, so MDX never hand-writes a grid. */
export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: (string | number | ReactNode)[][];
}) {
  return (
    <div className="my-6 overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-left text-[0.9rem]">
        <thead style={{ background: 'var(--bg-subtle)' }}>
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-2.5 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t align-top">
              {row.map((cell, j) => (
                <td key={j} className="px-4 py-3 leading-6">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
