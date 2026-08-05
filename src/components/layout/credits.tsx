'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A hidden credits panel, revealed by typing a sequence on any page.
 *
 * # On secrecy
 *
 * Client-side code cannot keep a secret: everything shipped to a browser can be
 * read, and no amount of encryption changes that because the key would have to
 * ship alongside it. What this achieves is *obscurity*, honestly:
 *
 *   - The sequence is matched by SHA-256 digest, so the word itself is nowhere
 *     in the bundle. `grep -ri` for it returns nothing.
 *   - The details are base64 at rest and decoded only when the panel opens, so
 *     the plaintext is absent too. That defeats the address harvesters that
 *     regex for `@` and digit runs — most of them — but not a person who runs
 *     the page and reads the memory.
 *
 * Treat it as hard to stumble on, not as private.
 */

/** SHA-256 of the trigger, lowercased. The word itself never appears here. */
const TRIGGER_DIGEST = '1ef4b02e1e8297fa689a6da0edbfa651234c2670cb2889742d61b3bc2ef81d07';

/** Longer than the sequence, so a rolling buffer always contains it. */
const BUFFER = 16;

/**
 * Details, base64 at rest.
 *
 * The panel omits any entry whose value is empty, so a field can be left blank
 * rather than shipping a broken link. To change one:
 *
 *     node -e "console.log(Buffer.from('VALUE').toString('base64'))"
 *
 * ── `why` is a draft ─────────────────────────────────────────────────────────
 * Written from the problem statement in skyl/docs/idea.md, not from the author.
 * Replace it with your own words, re-encoded the same way.
 */
const ENCODED = {
  name: 'QmFnb21iZWthIEpvYg==',
  role: 'Q3JlYXRvciBvZiBza3ls',
  why: 'RXZlcnkgR28gdGVhbSB0aGF0IGFkZHMgYW4gQUkgZmVhdHVyZSB3cml0ZXMgdGhlIHNhbWUgNDAwIHRvIDYwMCBsaW5lcyBiZWZvcmUgdGhleSByZWFjaCBhbnkgcHJvZHVjdCBsb2dpYzogcmVxdWVzdCBtYXBwaW5nLCBTU0UgcGFyc2luZywgYmFja29mZiB0aGF0IHJlc3BlY3RzIFJldHJ5LUFmdGVyLCB0ZWxsaW5nIGEgcmF0ZSBsaW1pdCBhcGFydCBmcm9tIGEgZGVhZCBBUEkga2V5LCB0b2tlbiBhY2NvdW50aW5nLCBjYW5jZWxsYXRpb24gdGhhdCBkb2VzIG5vdCBsZWFrIGEgZ29yb3V0aW5lLiBJIGhhZCB3cml0dGVuIGl0IG1vcmUgdGhhbiBvbmNlLCBhbmQgZWFjaCByZXdyaXRlIHJlaW50cm9kdWNlZCB0aGUgc2FtZSBidWdzLiBza3lsIGlzIHRoYXQgd29yayBkb25lIG9uY2UsIHByb3Blcmx5LCB3aXRoIHRlc3RzIOKAlCBzbyBjaGFuZ2luZyBtb2RlbCBpcyBjaGFuZ2luZyBhIHN0cmluZy4=',
  website: 'aHR0cHM6Ly9iYWdvbWJla2Fqb2IuY29t',
  github: 'aHR0cHM6Ly9naXRodWIuY29tL0JBR09NQkVLQS1KT0ItREVW',
  linkedin: 'aHR0cHM6Ly93d3cubGlua2VkaW4uY29tL2luL2JhZ29tYmVrYS1qb2Iv',
  email: 'YmFnb21iZWtham9iMTZAZ21haWwuY29t',
  phone: 'KzI1Njc3ODQ4MDk4MQ==',
} as const;

type Details = Record<keyof typeof ENCODED, string>;

function decode(): Details {
  const out = {} as Details;
  for (const [k, v] of Object.entries(ENCODED)) {
    out[k as keyof Details] = v ? atob(v) : '';
  }
  return out;
}

async function digest(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

/** True when the keystroke belongs to something the reader is typing into. */
function isTypingTarget(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export function Credits() {
  const [open, setOpen] = useState(false);
  const [details, setDetails] = useState<Details | null>(null);
  const buffer = useRef('');
  const panelRef = useRef<HTMLDivElement>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);

  const close = useCallback(() => {
    setOpen(false);
    restoreFocus.current?.focus();
    restoreFocus.current = null;
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        close();
        return;
      }
      // Ignore anything typed into a field — otherwise searching for the word
      // in the Ctrl-K dialog would fire this, which is both a bug and a
      // giveaway.
      if (isTypingTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1) return;

      buffer.current = (buffer.current + e.key.toLowerCase()).slice(-BUFFER);

      void digest(buffer.current.slice(-9)).then((hex) => {
        if (hex !== TRIGGER_DIGEST) return;
        buffer.current = '';
        restoreFocus.current = document.activeElement as HTMLElement | null;
        setDetails(decode());
        setOpen(true);
      });
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  // A panel over the page must not leave it scrollable behind.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  if (!open || !details) return null;

  const links = [
    { label: 'Website', href: details.website, text: details.website.replace(/^https?:\/\//, '') },
    { label: 'GitHub', href: details.github, text: details.github.replace(/^https?:\/\//, '') },
    { label: 'LinkedIn', href: details.linkedin, text: details.linkedin.replace(/^https?:\/\//, '') },
    { label: 'Email', href: `mailto:${details.email}`, text: details.email },
    { label: 'Phone', href: `tel:${details.phone.replace(/\s/g, '')}`, text: details.phone },
  ].filter((l) => l.text);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
      onClick={close}
      role="presentation"
      data-testid="credits-backdrop"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="credits-name"
        data-testid="credits"
        onClick={(e) => e.stopPropagation()}
        className="my-auto w-full max-w-2xl rounded-2xl border p-8 shadow-2xl outline-none sm:p-10"
        style={{ background: 'var(--bg-elevated)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--accent)]">
          {details.role}
        </p>
        <h2 id="credits-name" className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
          {details.name}
        </h2>

        <h3 className="mt-8 text-sm font-bold uppercase tracking-wider text-[var(--fg-subtle)]">
          Why I started this
        </h3>
        <p className="mt-3 text-[1.05rem] leading-8 text-[var(--fg-muted)]">{details.why}</p>

        <h3 className="mt-8 text-sm font-bold uppercase tracking-wider text-[var(--fg-subtle)]">
          Get in touch
        </h3>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2">
          {links.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                target={l.href.startsWith('http') ? '_blank' : undefined}
                rel={l.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="flex flex-col rounded-lg border px-4 py-3 no-underline transition-colors hover:border-[var(--accent)]"
              >
                <span className="text-xs uppercase tracking-wider text-[var(--fg-subtle)]">
                  {l.label}
                </span>
                <span className="mt-0.5 break-all text-sm font-medium text-[var(--accent)]">
                  {l.text}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={close}
          className="mt-8 rounded-full border px-5 py-2 text-sm font-semibold transition-colors hover:border-[var(--accent)]"
        >
          Close
        </button>
      </div>
    </div>
  );
}
