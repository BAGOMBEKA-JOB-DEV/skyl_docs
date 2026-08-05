'use client';

import { useState } from 'react';

/**
 * Copies the page's Markdown source.
 *
 * For a reader pasting a page into an LLM, the source is more useful than the
 * rendered HTML — and it is already on disk, so serving it costs nothing.
 */
export function CopyPageButton({ markdownPath }: { markdownPath: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const copy = async () => {
    try {
      const res = await fetch(markdownPath);
      if (!res.ok) throw new Error(String(res.status));
      await navigator.clipboard.writeText(await res.text());
      setState('copied');
    } catch {
      setState('failed');
    }
    window.setTimeout(() => setState('idle'), 2000);
  };

  return (
    <button
      type="button"
      onClick={() => void copy()}
      data-testid="copy-page"
      className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium text-[var(--fg-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      title="Copy this page's Markdown source"
    >
      {state === 'copied' ? 'Copied' : state === 'failed' ? 'Failed' : 'Copy page'}
    </button>
  );
}
