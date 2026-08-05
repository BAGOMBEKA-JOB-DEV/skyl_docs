'use client';

import { useCallback, useEffect, useState } from 'react';

/**
 * A tab choice, shared across every tab group of the same kind on the page and
 * persisted across navigations.
 *
 * Syncing matters more than it looks: a page can carry a dozen snippets, and a
 * reader who picks Gemini — or Python — once should not have to pick it twelve
 * more times. The custom event propagates the change between components in this
 * tab; the `storage` event handles other browser tabs.
 *
 * Generalised from the provider-only version so language tabs get the same
 * behaviour without a second copy of it.
 */
export function useTabPreference<T extends string>(
  /** localStorage key, e.g. `skyl-provider`. Also namespaces the sync event. */
  storageKey: string,
  /** The permitted values. Anything else in storage is ignored. */
  values: readonly T[],
  fallback: T,
): [T, (value: T) => void] {
  // Always start at the fallback so the server and first client render agree;
  // the stored value is applied in an effect, after hydration.
  const [value, setValueState] = useState<T>(fallback);

  useEffect(() => {
    const isValid = (v: string | null): v is T => v !== null && (values as readonly string[]).includes(v);
    const event = `skyl:${storageKey}-change`;

    try {
      const stored = localStorage.getItem(storageKey);
      if (isValid(stored)) setValueState(stored);
    } catch {
      /* Storage unavailable: the fallback is fine. */
    }

    const onCustom = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      if (isValid(detail)) setValueState(detail);
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey && isValid(e.newValue)) setValueState(e.newValue);
    };

    window.addEventListener(event, onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(event, onCustom);
      window.removeEventListener('storage', onStorage);
    };
    // `values` is a module-level constant at every call site; listing it would
    // re-register the listeners on every render for no benefit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const setValue = useCallback(
    (next: T) => {
      setValueState(next);
      try {
        localStorage.setItem(storageKey, next);
      } catch {
        /* Storage unavailable: the choice still applies for this page. */
      }
      window.dispatchEvent(new CustomEvent<string>(`skyl:${storageKey}-change`, { detail: next }));
    },
    [storageKey],
  );

  return [value, setValue];
}
