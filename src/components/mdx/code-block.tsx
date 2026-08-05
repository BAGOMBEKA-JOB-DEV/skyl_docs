'use client';

import { useCallback, useState, type ReactNode } from 'react';

/**
 * Wraps a Shiki-highlighted block with a filename bar and a copy button.
 *
 * The rehype plugin has already rendered both themes into the children; this
 * component only adds chrome. The raw source travels in `data-code` so copying
 * yields the code a reader can paste, not the highlighted markup.
 */
export function CodeBlock({
  children,
  ...props
}: {
  children?: ReactNode;
  className?: string;
  'data-language'?: string;
  'data-title'?: string;
  'data-code'?: string;
  'data-verify'?: string;
}) {
  const title = props['data-title'];
  const language = props['data-language'];
  const code = props['data-code'] ?? '';
  const verified = props['data-verify'] === 'true';

  return (
    <figure
      className="group my-6 overflow-hidden rounded-xl border"
      style={{ background: 'var(--bg-code)' }}
    >
      {(title || verified) && (
        <figcaption
          className="flex items-center justify-between border-b px-4 py-2 text-xs"
          style={{ background: 'var(--bg-subtle)' }}
        >
          <span className="font-mono text-[var(--fg-muted)]">{title ?? language}</span>
          {verified ? (
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
              style={{ background: 'var(--recap-bg)', color: 'var(--recap)' }}
              title="This snippet is compiled against the real library in CI."
            >
              Compiles
            </span>
          ) : null}
        </figcaption>
      )}
      <div className="relative">
        <CopyButton code={code} />
        <div className="overflow-x-auto py-3 text-[0.875rem] leading-6">{children}</div>
      </div>
    </figure>
  );
}

export function CopyButton({ code, label = 'Copy' }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    void navigator.clipboard.writeText(code).then(
      () => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      },
      () => setCopied(false),
    );
  }, [code]);

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied' : label}
      className="absolute right-2 top-2 z-10 rounded-md border px-2 py-1 text-xs opacity-0 transition-opacity focus-visible:opacity-100 group-hover:opacity-100"
      style={{ background: 'var(--bg-elevated)', color: 'var(--fg-muted)' }}
    >
      {copied ? 'Copied' : label}
    </button>
  );
}
