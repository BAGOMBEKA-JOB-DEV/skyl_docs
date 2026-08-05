'use client';

import { useEffect, useState } from 'react';
import type { Heading } from '@/lib/content';

/**
 * The right-hand table of contents, tracking the reader's position.
 *
 * The observer's root margin biases towards the heading nearest the top of the
 * viewport, so the highlight follows what you are reading rather than whatever
 * happens to be centred.
 */
export function Toc({ headings }: { headings: Heading[] }) {
  const [activeId, setActiveId] = useState<string>('');

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return <div className="hidden w-56 shrink-0 2xl:block" />;

  return (
    <nav
      className="hidden w-56 shrink-0 2xl:block"
      aria-label="On this page"
      data-testid="toc"
    >
      <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto pb-8">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[var(--fg-subtle)]">
          On this page
        </p>
        <ul className="space-y-1 border-l">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className="block py-1 text-[0.8rem] leading-5 transition-colors"
                style={{
                  paddingLeft: h.depth === 2 ? '0.75rem' : '1.5rem',
                  marginLeft: '-1px',
                  borderLeft: activeId === h.id ? '2px solid var(--accent)' : '2px solid transparent',
                  color: activeId === h.id ? 'var(--accent)' : 'var(--fg-muted)',
                  fontWeight: activeId === h.id ? 600 : 400,
                }}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
