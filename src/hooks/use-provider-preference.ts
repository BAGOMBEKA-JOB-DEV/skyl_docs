'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ProviderId } from '@/types';

const STORAGE_KEY = 'skyl-provider';
const EVENT = 'skyl:provider-change';
const DEFAULT: ProviderId = 'anthropic';

function isProviderId(v: string | null): v is ProviderId {
  return v === 'anthropic' || v === 'openai' || v === 'gemini' || v === 'openaicompat';
}

/**
 * The reader's chosen provider, shared across every tabbed snippet on the page
 * and persisted across navigations.
 *
 * Syncing matters more than it looks: a page can carry a dozen snippets, and a
 * reader who picks Gemini once should not have to pick it twelve more times.
 * The custom event propagates the change between components in this tab; the
 * `storage` event handles other tabs.
 */
export function useProviderPreference(): [ProviderId, (id: ProviderId) => void] {
  // Always start at the default so the server and first client render agree;
  // the stored value is applied in an effect, after hydration.
  const [provider, setProviderState] = useState<ProviderId>(DEFAULT);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isProviderId(stored)) setProviderState(stored);
    } catch {
      /* Storage unavailable: the default is fine. */
    }

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<ProviderId>).detail;
      if (isProviderId(detail)) setProviderState(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && isProviderId(e.newValue)) setProviderState(e.newValue);
    };

    window.addEventListener(EVENT, onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(EVENT, onCustom);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const setProvider = useCallback((id: ProviderId) => {
    setProviderState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      /* Storage unavailable: the choice still applies for this page. */
    }
    window.dispatchEvent(new CustomEvent<ProviderId>(EVENT, { detail: id }));
  }, []);

  return [provider, setProvider];
}
