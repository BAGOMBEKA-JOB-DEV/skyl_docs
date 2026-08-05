import type { ReactNode } from 'react';

/**
 * A labelled figure.
 *
 * Diagrams here are inline SVG or pre-formatted ASCII rather than images, so
 * they inherit the theme and stay legible in both. An image would be wrong in
 * one theme or the other, and would not scale with the reader's font size.
 */
export function Diagram({ caption, children }: { caption?: string; children: ReactNode }) {
  return (
    <figure className="my-8">
      <div
        className="overflow-x-auto rounded-xl border px-5 py-5"
        style={{ background: 'var(--bg-subtle)' }}
      >
        {children}
      </div>
      {caption ? (
        <figcaption className="mt-2 text-center text-sm text-[var(--fg-muted)]">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

/** ASCII structure — module trees, request paths. Monospace, theme-aware. */
export function AsciiDiagram({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <Diagram caption={caption}>
      <pre className="font-mono text-[0.8rem] leading-6 text-[var(--fg-muted)]">{children}</pre>
    </Diagram>
  );
}

/**
 * The layered path a request takes through skyl.
 *
 * Used on the architecture and Client pages. Everything cross-cutting lives in
 * the Client band; below the seam, each adapter only translates.
 */
export function ClientStackDiagram() {
  return (
    <Diagram caption="Everything cross-cutting lives in Client, so it is written and tested once.">
      <div className="mx-auto max-w-md space-y-2 text-center text-sm">
        <Band label="your code" tone="muted" />
        <Arrow />
        <div
          className="rounded-lg border px-4 py-3"
          style={{ background: 'var(--accent-subtle)', borderColor: 'var(--accent)' }}
        >
          <p className="font-mono font-semibold">skyl.Client</p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            validation · retry/backoff · timeout · hooks
          </p>
        </div>
        <Arrow />
        <div
          className="rounded-lg border-2 border-dashed px-4 py-3"
          style={{ borderColor: 'var(--fg-subtle)' }}
        >
          <p className="font-mono font-semibold">skyl.Provider</p>
          <p className="mt-1 text-xs text-[var(--fg-muted)]">
            the seam — four methods
          </p>
        </div>
        <Arrow />
        <div className="grid grid-cols-2 gap-2">
          {[
            ['anthropic', 'api.anthropic.com'],
            ['openai', 'api.openai.com'],
            ['gemini', 'generativelanguage…'],
            ['openaicompat', 'any OpenAI-shaped host'],
          ].map(([name, host]) => (
            <div
              key={name}
              className="rounded-lg border px-3 py-2 text-left"
              style={{ background: 'var(--bg-elevated)' }}
            >
              <p className="font-mono text-xs font-semibold">{name}</p>
              <p className="text-[0.7rem] text-[var(--fg-subtle)]">{host}</p>
            </div>
          ))}
        </div>
      </div>
    </Diagram>
  );
}

function Band({ label, tone }: { label: string; tone?: 'muted' }) {
  return (
    <div
      className="rounded-lg border px-4 py-2 font-mono text-sm"
      style={{
        background: 'var(--bg-elevated)',
        color: tone === 'muted' ? 'var(--fg-muted)' : 'var(--fg)',
      }}
    >
      {label}
    </div>
  );
}

function Arrow() {
  return (
    <p aria-hidden className="text-[var(--fg-subtle)]">
      ↓
    </p>
  );
}
