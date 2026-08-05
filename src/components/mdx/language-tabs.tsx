'use client';

import type { ReactNode } from 'react';
import { Tabs } from './tabs';

/** Client languages the gateway documentation carries examples for. */
export type ClientLanguage = 'curl' | 'python' | 'typescript';

const ORDER: ClientLanguage[] = ['curl', 'python', 'typescript'];

const LABELS: Record<ClientLanguage, string> = {
  curl: 'curl',
  python: 'Python',
  typescript: 'TypeScript',
};

/**
 * The same gateway call, per client language.
 *
 * `curl` comes first and stays first: it is the wire form, and the others are
 * conveniences built on it. A reader debugging a request wants the bytes.
 *
 * The choice persists site-wide through the shared tab preference, so a Python
 * developer picks once and reads Python on every gateway page after that.
 */
export function LanguageTabs({
  children,
  only,
}: {
  children: ReactNode;
  /** Restricts the tab set where an example genuinely differs by language. */
  only?: ClientLanguage[];
}) {
  return (
    <Tabs<ClientLanguage>
      storageKey="skyl-language"
      values={only ?? ORDER}
      labels={LABELS}
      fallback="curl"
      label="Choose a client language"
      emptyMessage="No example in this language yet."
      testId="language-tabs"
    >
      {children}
    </Tabs>
  );
}
