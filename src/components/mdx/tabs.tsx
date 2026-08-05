'use client';

import { useId, type ReactNode } from 'react';
import { useTabPreference } from '@/hooks/use-tab-preference';

/**
 * A tab group whose choice persists and syncs across every group of the same
 * kind on the page.
 *
 * Extracted from the provider tabs so language tabs get identical behaviour —
 * keyboard semantics, persistence, cross-block sync — without a second copy.
 * Panels are matched to tabs **by index**, which keeps MDX authoring plain:
 * write one fenced block per tab, in tab order.
 */
export function Tabs<T extends string>({
  storageKey,
  values,
  labels,
  fallback,
  label,
  emptyMessage,
  testId,
  children,
}: {
  storageKey: string;
  /** Tab values in display order. */
  values: readonly T[];
  labels: Record<T, string>;
  fallback: T;
  /** Accessible name for the tablist, e.g. "Choose a provider". */
  label: string;
  emptyMessage: string;
  testId: string;
  children: ReactNode;
}) {
  const [stored, setStored] = useTabPreference<T>(storageKey, values, fallback);
  const baseId = useId();

  // A reader whose stored choice is not offered by this particular group still
  // sees something rather than an empty box.
  const active = values.includes(stored) ? stored : (values[0] as T);
  const panels = Array.isArray(children) ? children : [children];

  return (
    <div className="my-6 overflow-hidden rounded-xl border" data-testid={testId}>
      <div
        role="tablist"
        aria-label={label}
        className="flex flex-wrap gap-1 border-b px-2 pt-2"
        style={{ background: 'var(--bg-subtle)' }}
      >
        {values.map((value) => {
          const selected = value === active;
          return (
            <button
              key={value}
              type="button"
              role="tab"
              id={`${baseId}-tab-${value}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${value}`}
              onClick={() => setStored(value)}
              className="rounded-t-md px-3.5 py-2 text-sm font-medium transition-colors"
              style={{
                background: selected ? 'var(--bg)' : 'transparent',
                color: selected ? 'var(--accent)' : 'var(--fg-muted)',
                boxShadow: selected ? 'inset 0 -2px 0 var(--accent)' : undefined,
              }}
            >
              {labels[value]}
            </button>
          );
        })}
      </div>

      {/*
        Every panel stays mounted and inactive ones are hidden, so switching
        costs no re-render and the page height does not jump.
      */}
      {values.map((value, i) => (
        <div
          key={value}
          role="tabpanel"
          id={`${baseId}-panel-${value}`}
          aria-labelledby={`${baseId}-tab-${value}`}
          hidden={value !== active}
          className="tab-panel px-1"
        >
          {panels[i] ?? <p className="px-4 py-6 text-sm text-[var(--fg-muted)]">{emptyMessage}</p>}
        </div>
      ))}
    </div>
  );
}
