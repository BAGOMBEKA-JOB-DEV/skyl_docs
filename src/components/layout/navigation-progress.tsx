'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';

/**
 * A top progress bar for client-side navigation.
 *
 * Navigating fetches the target route's RSC payload, and on this site those run
 * to 214 KB — roughly four seconds on a slow connection. Without feedback the
 * old page just sits there and the link reads as broken.
 *
 * # Why not loading.tsx
 *
 * Next's Suspense fallback swaps out the whole segment, and the sidebar lives
 * inside the page rather than a layout — so a `loading.tsx` would blank the
 * entire shell on every hop, including 200ms ones. A bar leaves the current
 * page on screen until the next is ready.
 *
 * # Why the delay is CSS
 *
 * The bar is always mounted and animates from `opacity: 0` with a delay (see
 * `.nav-progress` in globals.css). A navigation that finishes inside that
 * window never paints it, so there is no timer to schedule, cancel or leak —
 * and no risk of a flash on a fast click, which is worse than no bar at all.
 */

/** Fires when navigation starts by a route other than a link click. */
const START_EVENT = 'skyl:navigation-start';

/**
 * Signals that a navigation has begun.
 *
 * Exported for `router.push` callers — a programmatic push dispatches no click,
 * so the listener below cannot see it.
 */
export function startNavigation(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(START_EVENT));
  }
}

/** A navigation that never resolves must not leave the bar running forever. */
const SAFETY_TIMEOUT_MS = 10_000;

export function NavigationProgress() {
  const [pending, setPending] = useState(false);
  const pathname = usePathname();

  // The popstate handler needs the current route, but must not be re-registered
  // on every navigation, so it reads through a ref.
  const pathnameRef = useRef(pathname);

  const start = useCallback(() => setPending(true), []);

  // Arrival at a new route is the completion signal: `usePathname` changes only
  // once the new page has rendered.
  useEffect(() => {
    pathnameRef.current = pathname;
    setPending(false);
  }, [pathname]);

  useEffect(() => {
    if (!pending) return;
    const id = window.setTimeout(() => setPending(false), SAFETY_TIMEOUT_MS);
    return () => window.clearTimeout(id);
  }, [pending]);

  useEffect(() => {
    /**
     * One capture-phase listener rather than wrapping every `<Link>`: body
     * links come from MDX prose across 165 pages, and this catches those, the
     * sidebar, the nav, prev/next and the cards alike.
     */
    const onClick = (e: MouseEvent) => {
      // A modified click opens a new tab; this page never navigates, so
      // starting the bar would leave it stuck on.
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const anchor = (e.target as Element | null)?.closest?.('a');
      if (!anchor) return;

      const href = anchor.getAttribute('href');
      if (!href) return;
      if (anchor.hasAttribute('download')) return;
      if (anchor.getAttribute('target') === '_blank') return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }

      // External origins leave the app entirely.
      if (url.origin !== window.location.origin) return;
      // A same-page anchor scrolls; it does not navigate.
      if (url.pathname === window.location.pathname && url.hash) return;
      // Clicking the page you are already on does nothing.
      if (url.pathname === window.location.pathname && url.search === window.location.search) {
        return;
      }

      start();
    };

    /**
     * Back and forward also fire for a hash-only history entry — going back
     * from a table-of-contents anchor, say. There the pathname is unchanged, so
     * `usePathname` never fires and nothing would clear the bar: it would run
     * until the safety timeout. Only start for an actual route change.
     */
    const onPopState = () => {
      if (window.location.pathname !== pathnameRef.current) start();
    };

    document.addEventListener('click', onClick, true);
    window.addEventListener('popstate', onPopState);
    window.addEventListener(START_EVENT, start);
    return () => {
      document.removeEventListener('click', onClick, true);
      window.removeEventListener('popstate', onPopState);
      window.removeEventListener(START_EVENT, start);
    };
  }, [start]);

  return (
    <>
      {/*
        Decorative: a shimmer announced on every click is noise. The live
        region below carries the same information for assistive tech, on the
        same delay.
      */}
      <div
        className={`nav-progress${pending ? ' nav-progress--active' : ''}`}
        data-testid="nav-progress"
        data-pending={pending ? 'true' : 'false'}
        aria-hidden="true"
      >
        <span className="nav-progress__bar" />
      </div>

      <div role="status" aria-live="polite" className="sr-only">
        {pending ? 'Loading page' : ''}
      </div>
    </>
  );
}
