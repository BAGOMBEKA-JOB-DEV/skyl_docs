'use client';

import { useEffect, useState } from 'react';

/**
 * The hero's central argument, animated: the constructor is the only line that
 * changes between vendors.
 *
 * Everything above and below the highlighted line stays fixed while the middle
 * cycles, so the eye sees exactly how small the diff is. It pauses on hover and
 * respects `prefers-reduced-motion`, because an animation a reader cannot stop
 * is a reading obstacle.
 */
const VARIANTS = [
  { pkg: 'anthropic', call: 'anthropic.New(os.Getenv("ANTHROPIC_API_KEY"))', model: 'claude-opus-5' },
  { pkg: 'openai', call: 'openai.New(os.Getenv("OPENAI_API_KEY"))', model: 'gpt-5.6' },
  { pkg: 'gemini', call: 'gemini.New(os.Getenv("GEMINI_API_KEY"))', model: 'gemini-3.6-flash' },
  {
    pkg: 'openaicompat',
    call: 'openaicompat.New(openaicompat.WithBaseURL(ollama))',
    model: 'llama3.3',
  },
];

export function ProviderSwap() {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % VARIANTS.length), 2600);
    return () => window.clearInterval(id);
  }, [paused]);

  const v = VARIANTS[i] as (typeof VARIANTS)[number];

  return (
    <div
      className="overflow-hidden rounded-xl border text-left"
      style={{ background: 'var(--bg-code)' }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      data-testid="provider-swap"
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-2"
        style={{ background: 'var(--bg-subtle)' }}
      >
        <span className="font-mono text-xs text-[var(--fg-muted)]">main.go</span>
        <div className="ml-auto flex gap-1">
          {VARIANTS.map((variant, n) => (
            <button
              key={variant.pkg}
              type="button"
              onClick={() => setI(n)}
              aria-label={`Show the ${variant.pkg} example`}
              className="h-1.5 w-6 rounded-full transition-colors"
              style={{ background: n === i ? 'var(--accent)' : 'var(--border)' }}
            />
          ))}
        </div>
      </div>

      <pre className="overflow-x-auto px-5 py-4 font-mono text-[0.82rem] leading-6 sm:text-[0.9rem]">
        <code>
          <Line>
            <Kw>client</Kw> := skyl.New(
            <span
              key={v.pkg}
              className="rounded px-1 transition-colors"
              style={{ background: 'var(--accent-subtle)', color: 'var(--accent)' }}
            >
              {v.call}
            </span>
            )
          </Line>
          <Line>{'\n'}</Line>
          <Line>
            <Kw>resp</Kw>, <Kw>err</Kw> := client.Complete(ctx, &amp;skyl.Request{'{'}
          </Line>
          <Line>
            {'    '}Model: <Str>&quot;{v.model}&quot;</Str>,
          </Line>
          <Line>
            {'    '}Messages: []skyl.Message{'{'}skyl.UserText(<Str>&quot;Hello&quot;</Str>){'}'},
          </Line>
          <Line>{'})'}</Line>
          <Line>{'\n'}</Line>
          <Line>
            fmt.Println(resp.Text())
          </Line>
        </code>
      </pre>
    </div>
  );
}

function Line({ children }: { children: React.ReactNode }) {
  return <span className="block whitespace-pre">{children}</span>;
}

function Kw({ children }: { children: React.ReactNode }) {
  return <span style={{ color: 'var(--deep-dive)' }}>{children}</span>;
}

function Str({ children }: { children: React.ReactNode }) {
  return <span style={{ color: 'var(--recap)' }}>{children}</span>;
}
