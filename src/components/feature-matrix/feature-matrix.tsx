'use client';

import { useMemo, useState } from 'react';
import { matrixGroupLabels, matrixRows } from '@/data/feature-matrix';
import type { MatrixGroup, ProviderId, SupportState } from '@/types';

const PROVIDERS: ProviderId[] = ['anthropic', 'openai', 'gemini', 'openaicompat'];

const PROVIDER_LABELS: Record<ProviderId, string> = {
  anthropic: 'anthropic',
  openai: 'openai',
  gemini: 'gemini',
  openaicompat: 'openaicompat',
};

const STATE_META: Record<SupportState, { symbol: string; label: string; color: string }> = {
  mapped: { symbol: '✅', label: 'Mapped', color: 'var(--recap)' },
  rejected: { symbol: '⛔', label: 'Rejected', color: 'var(--pitfall)' },
  ignored: { symbol: '⚠️', label: 'Silently ignored', color: 'var(--warn)' },
  na: { symbol: '—', label: 'Not applicable', color: 'var(--fg-subtle)' },
};

/**
 * The provider feature matrix, filterable.
 *
 * The printed matrix in the repository is 298 lines and answers one question at
 * a time. Here a reader can ask the question they actually have — "what does
 * Gemini silently drop?" — and get four rows instead of a page of scrolling.
 *
 * The filters default to showing everything, because the honest default is the
 * complete picture, not a flattering subset.
 */
export function FeatureMatrix() {
  const [states, setStates] = useState<Set<SupportState>>(
    () => new Set<SupportState>(['mapped', 'rejected', 'ignored', 'na']),
  );
  const [provider, setProvider] = useState<ProviderId | 'all'>('all');
  const [query, setQuery] = useState('');

  const toggleState = (s: SupportState) =>
    setStates((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });

  // Memoised so it is referentially stable: the filter below depends on it,
  // and a fresh array each render would recompute the whole matrix every time.
  const columns = useMemo(
    () => (provider === 'all' ? PROVIDERS : [provider]),
    [provider],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return matrixRows.filter((row) => {
      if (q && !row.feature.toLowerCase().includes(q)) return false;
      // A row survives if any *visible* column is in a selected state.
      return columns.some((p) => states.has(row.cells[p].state));
    });
  }, [columns, states, query]);

  const grouped = useMemo(() => {
    const out = new Map<MatrixGroup, typeof matrixRows>();
    for (const row of filtered) {
      const list = out.get(row.group) ?? [];
      list.push(row);
      out.set(row.group, list);
    }
    return out;
  }, [filtered]);

  return (
    <div className="my-8" data-testid="feature-matrix">
      <div
        className="mb-6 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border px-4 py-3"
        style={{ background: 'var(--bg-subtle)' }}
      >
        <label className="flex items-center gap-2 text-sm">
          <span className="font-semibold">Provider</span>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as ProviderId | 'all')}
            className="rounded-md border px-2 py-1 text-sm"
            style={{ background: 'var(--bg)', color: 'var(--fg)' }}
          >
            <option value="all">All four</option>
            {PROVIDERS.map((p) => (
              <option key={p} value={p}>
                {PROVIDER_LABELS[p]}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold">Show</span>
          {(Object.keys(STATE_META) as SupportState[]).map((s) => {
            const on = states.has(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleState(s)}
                aria-pressed={on}
                className="rounded-full border px-3 py-1 text-xs font-medium transition-colors"
                style={{
                  background: on ? 'var(--bg)' : 'transparent',
                  color: on ? STATE_META[s].color : 'var(--fg-subtle)',
                  borderColor: on ? STATE_META[s].color : 'var(--border)',
                  opacity: on ? 1 : 0.55,
                }}
              >
                {STATE_META[s].symbol} {STATE_META[s].label}
              </button>
            );
          })}
        </div>

        <label className="flex flex-1 items-center gap-2 text-sm">
          <span className="sr-only">Filter features</span>
          <input
            type="search"
            value={query}
            placeholder="Filter features…"
            onChange={(e) => setQuery(e.target.value)}
            className="w-full min-w-[10rem] rounded-md border px-3 py-1.5 text-sm"
            style={{ background: 'var(--bg)', color: 'var(--fg)' }}
          />
        </label>
      </div>

      <p className="mb-4 text-sm text-[var(--fg-muted)]">
        Showing <strong>{filtered.length}</strong> of {matrixRows.length} rows.
      </p>

      {grouped.size === 0 ? (
        <p className="rounded-lg border px-4 py-6 text-center text-sm text-[var(--fg-muted)]">
          Nothing matches those filters.
        </p>
      ) : (
        (Object.keys(matrixGroupLabels) as MatrixGroup[]).map((group) => {
          const rows = grouped.get(group);
          if (!rows?.length) return null;
          return (
            <section key={group} className="mb-8">
              <h3 className="mb-3 text-lg font-semibold">{matrixGroupLabels[group]}</h3>
              <div className="overflow-x-auto rounded-xl border">
                <table className="w-full border-collapse text-left text-[0.875rem]">
                  <thead style={{ background: 'var(--bg-subtle)' }}>
                    <tr>
                      <th className="px-4 py-2.5 font-semibold">Feature</th>
                      {columns.map((p) => (
                        <th key={p} className="px-4 py-2.5 font-mono text-xs font-semibold">
                          {PROVIDER_LABELS[p]}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row) => (
                      <tr key={row.id} id={`matrix-${row.id}`} className="border-t align-top">
                        <td className="px-4 py-3">
                          <span className="font-mono text-[0.85rem] font-semibold">
                            {row.feature}
                          </span>
                          {row.note ? (
                            <p className="mt-1.5 text-[0.8rem] leading-5 text-[var(--fg-subtle)]">
                              {row.note}
                            </p>
                          ) : null}
                        </td>
                        {columns.map((p) => {
                          const cell = row.cells[p];
                          const meta = STATE_META[cell.state];
                          return (
                            <td key={p} className="px-4 py-3">
                              <span title={meta.label} aria-label={meta.label}>
                                {meta.symbol}
                              </span>
                              {cell.detail ? (
                                <p
                                  className="mt-1 text-[0.8rem] leading-5"
                                  style={{
                                    color:
                                      cell.state === 'mapped'
                                        ? 'var(--fg-subtle)'
                                        : meta.color,
                                  }}
                                >
                                  {cell.detail}
                                </p>
                              ) : null}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
