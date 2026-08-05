import type { ReactNode } from 'react';
import { CopyButton } from './code-block';

/**
 * A command you type, distinguished from a program you write.
 *
 * react.dev separates these for a good reason: a reader scanning for "what do I
 * run" should not have to read Go to find it.
 */
export function TerminalBlock({ children }: { children: ReactNode }) {
  const text = extractText(children);
  return (
    <figure className="group relative my-6 overflow-hidden rounded-xl border" style={{ background: 'var(--bg-inset)' }}>
      <figcaption
        className="flex items-center gap-2 border-b px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-subtle)]"
        style={{ background: 'var(--bg-subtle)' }}
      >
        Terminal
      </figcaption>
      <CopyButton code={text} />
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[0.875rem] leading-6">
        <code>{children}</code>
      </pre>
    </figure>
  );
}

/**
 * Program output.
 *
 * Kept visually distinct from input so an example that shows both cannot be
 * misread as two commands.
 */
export function ConsoleBlock({ children }: { children: ReactNode }) {
  return (
    <figure className="my-6 overflow-hidden rounded-xl border" style={{ background: 'var(--bg-subtle)' }}>
      <figcaption className="border-b px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[var(--fg-subtle)]">
        Output
      </figcaption>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[0.875rem] leading-6 text-[var(--fg-muted)]">
        <code>{children}</code>
      </pre>
    </figure>
  );
}

function extractText(node: ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    const props = (node as { props?: { children?: ReactNode } }).props;
    return extractText(props?.children);
  }
  return '';
}
