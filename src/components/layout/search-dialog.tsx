'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

export interface SearchEntry {
  route: string;
  title: string;
  section: string;
  description?: string;
}

/**
 * Ctrl/Cmd-K search over every page.
 *
 * The index is a static JSON payload built at compile time from the sidebars
 * and frontmatter, so search works on a static host with no server and no
 * third-party service. Matching is deliberately simple — title, section and
 * description — because on a site this size a reader almost always knows the
 * name of what they want.
 */
export function SearchDialog({ index }: { index: SearchEntry[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setQuery('');
      setActive(0);
      // The dialog mounts in the same tick; focus after paint.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.slice(0, 12);
    const scored = index
      .map((e) => {
        const title = e.title.toLowerCase();
        let score = 0;
        if (title === q) score = 100;
        else if (title.startsWith(q)) score = 80;
        else if (title.includes(q)) score = 60;
        else if (e.description?.toLowerCase().includes(q)) score = 30;
        else if (e.section.toLowerCase().includes(q)) score = 10;
        return { e, score };
      })
      .filter((r) => r.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);
    return scored.map((r) => r.e);
  }, [index, query]);

  const go = useCallback(
    (route: string) => {
      setOpen(false);
      router.push(route);
    },
    [router],
  );

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const hit = results[active];
      if (hit) go(hit.route);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="search-open"
        className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm text-[var(--fg-subtle)] transition-colors hover:border-[var(--accent)] md:w-64"
        style={{ background: 'var(--bg-subtle)' }}
        aria-label="Search documentation"
      >
        <SearchIcon />
        <span className="hidden md:inline">Search</span>
        <kbd
          className="ml-auto hidden rounded border px-1.5 py-0.5 font-mono text-[10px] md:inline"
          style={{ background: 'var(--bg)' }}
        >
          Ctrl K
        </kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 pt-[10vh]"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <div
            className="w-full max-w-xl overflow-hidden rounded-xl border shadow-2xl"
            style={{ background: 'var(--bg-elevated)' }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Search documentation"
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setActive(0);
              }}
              onKeyDown={onKeyDown}
              placeholder="Search skyl docs…"
              data-testid="search-input"
              className="w-full border-b bg-transparent px-4 py-3.5 text-base outline-none"
            />
            <ul className="max-h-[55vh] overflow-y-auto py-2" data-testid="search-results">
              {results.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-[var(--fg-muted)]">
                  Nothing matches “{query}”.
                </li>
              ) : (
                results.map((r, i) => (
                  <li key={r.route}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(r.route)}
                      className="block w-full px-4 py-2.5 text-left"
                      style={{ background: i === active ? 'var(--accent-subtle)' : 'transparent' }}
                    >
                      <span className="block text-sm font-medium">{r.title}</span>
                      <span className="block text-xs text-[var(--fg-subtle)]">{r.section}</span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}
