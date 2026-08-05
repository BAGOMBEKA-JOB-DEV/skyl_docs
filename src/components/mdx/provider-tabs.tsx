'use client';

import { useId, type ReactNode } from 'react';
import { useProviderPreference } from '@/hooks/use-provider-preference';
import type { ProviderId } from '@/types';

const ORDER: ProviderId[] = ['anthropic', 'openai', 'gemini', 'openaicompat'];

const LABELS: Record<ProviderId, string> = {
  anthropic: 'Anthropic',
  openai: 'OpenAI',
  gemini: 'Gemini',
  openaicompat: 'Compatible',
};

/**
 * The same example, per provider.
 *
 * This is skyl's central claim rendered as a UI affordance: everything below
 * the seam is identical, and swapping vendors is one constructor. A reader who
 * clicks between the tabs sees exactly how little changes — which is a more
 * convincing argument than a paragraph saying so.
 *
 * Every panel stays in the DOM and inactive ones are hidden, so the choice
 * costs no re-render and the page's height does not jump.
 */
export function ProviderTabs({
  children,
  only,
}: {
  children: ReactNode;
  /** Restricts the tab set, for a feature only some adapters support. */
  only?: ProviderId[];
}) {
  const [provider, setProvider] = useProviderPreference();
  const baseId = useId();
  const shown = only ?? ORDER;
  // A reader whose stored choice is not offered here still sees something.
  const active = shown.includes(provider) ? provider : (shown[0] as ProviderId);

  const panels = Array.isArray(children) ? children : [children];

  return (
    <div className="my-6 overflow-hidden rounded-xl border" data-testid="provider-tabs">
      <div
        role="tablist"
        aria-label="Choose a provider"
        className="flex flex-wrap gap-1 border-b px-2 pt-2"
        style={{ background: 'var(--bg-subtle)' }}
      >
        {shown.map((id) => {
          const selected = id === active;
          return (
            <button
              key={id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${id}`}
              onClick={() => setProvider(id)}
              className="rounded-t-md px-3.5 py-2 text-sm font-medium transition-colors"
              style={{
                background: selected ? 'var(--bg)' : 'transparent',
                color: selected ? 'var(--accent)' : 'var(--fg-muted)',
                boxShadow: selected ? 'inset 0 -2px 0 var(--accent)' : undefined,
              }}
            >
              {LABELS[id]}
            </button>
          );
        })}
      </div>

      {shown.map((id, i) => (
        <div
          key={id}
          role="tabpanel"
          id={`${baseId}-panel-${id}`}
          aria-labelledby={`${baseId}-tab-${id}`}
          hidden={id !== active}
          className="provider-panel px-1"
        >
          {panels[i] ?? (
            <p className="px-4 py-6 text-sm text-[var(--fg-muted)]">
              No example for this provider.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

/** One panel of a `ProviderTabs`, in the order given by the tab list. */
export function Panel({ children }: { children: ReactNode; provider?: ProviderId }) {
  return <>{children}</>;
}
