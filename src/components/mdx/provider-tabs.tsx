'use client';

import type { ReactNode } from 'react';
import { Tabs } from './tabs';
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
 * clicks between the tabs sees exactly how little changes — a more convincing
 * argument than a paragraph saying so.
 */
export function ProviderTabs({
  children,
  only,
}: {
  children: ReactNode;
  /** Restricts the tab set, for a feature only some adapters support. */
  only?: ProviderId[];
}) {
  return (
    <Tabs<ProviderId>
      storageKey="skyl-provider"
      values={only ?? ORDER}
      labels={LABELS}
      fallback="anthropic"
      label="Choose a provider"
      emptyMessage="No example for this provider."
      testId="provider-tabs"
    >
      {children}
    </Tabs>
  );
}

/** One panel of a `ProviderTabs`, in the order given by the tab list. */
export function Panel({ children }: { children: ReactNode; provider?: ProviderId }) {
  return <>{children}</>;
}
