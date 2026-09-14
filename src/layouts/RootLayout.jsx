import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Preloader from '../components/Preloader';
import CustomCursor from '../components/CustomCursor';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { pageByPath, SITE_URL } from '../site';
import { startAnalytics, trackPageview } from '../lib/analytics';
import { API_ENABLED, api } from '../lib/api';

const SITE = 'EKA Solution';

/**
 * The shell every route renders inside.
 *
 * The chrome — cursor, capsule header, footer, the persistent WhatsApp button — is mounted
 * once here rather than per page, which is the whole reason the split to routes is cheap:
 * navigating between pages never unmounts the footer's particle mountain or restarts the
 * cursor, so the site keeps the continuity a single scroll used to give it for free.
 *
 * The preloader is deliberately first-visit only. It is a curtain over the initial paint,
 * and running it again on every internal navigation would turn a 200ms route change into a
 * two-second ceremony.
 */
export default function RootLayout() {
  /* The curtain belongs to the home page, and only to a cold visit of it.
     It exists to cover the moment the WebGL globe is compiling its shaders and the night
     field would otherwise flash in half-built. Nothing else on the site has that problem —
     so someone who arrives on /careers from a job board, or on /work from a link, gets the
     page rather than three seconds of somebody else's brand animation. */
  const [loadingComplete, setLoadingComplete] = useState(
    () => typeof window === 'undefined' || window.location.pathname !== '/',
  );
  const { pathname, hash, key } = useLocation();
  const firstRender = useRef(true);

  useEffect(() => startAnalytics(), []);

  useEffect(() => {
    trackPageview(pathname);
  }, [pathname]);

  /* Scroll handling on navigation.

     A router leaves the scroll position where it was, which on a long page means arriving
     at a new route somewhere in its middle.

     `instant` rather than `auto` throughout, and the distinction matters here: `auto` means
     "use the CSS value", and this stylesheet sets `scroll-behavior: smooth` on the root —
     so `auto` would smooth-scroll six thousand pixels back to the top of a route change.
     A page change is a cut, not a pan. In-page anchor clicks still glide, because those go
     through the browser rather than through here.

     The hash case needs the retry. Every page but the home page is a lazy chunk, so at the
     moment this effect first runs the element for a deep link is pointing at does not
     exist yet — the page it lives on is still being fetched. Looking once and giving up
     silently drops the visitor at the top of a page they deep-linked into the middle of.
     So it looks again until the element appears or the attempts run out, and stands down
     the moment the visitor scrolls for themselves.

     The budget is counted in attempts rather than in elapsed milliseconds, and the poll is
     a timer rather than a frame. Both are for the background tab: a link opened in one is
     hidden, where `requestAnimationFrame` stops and a wall-clock deadline expires while
     nothing has been tried — so the visitor switches to the tab and is dropped at the top
     of the page for a reason that has nothing to do with the page. */
  useEffect(() => {
    const wasFirst = firstRender.current;
    firstRender.current = false;

    // A cold load with no hash is already at the top; scrolling it again would fight the
    // browser's own restoration on a refresh.
    if (wasFirst && !hash) return undefined;

    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' });
      return undefined;
    }

    let timer = 0;
    let attempts = 0;
    let cancelled = false;

    const stop = () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchstart', stop);
      window.removeEventListener('keydown', stop);
    };

    const look = () => {
      if (cancelled) return;
      attempts += 1;

      let target = null;
      try {
        target = document.querySelector(hash);
      } catch {
        // A hash that is not a valid selector is not an anchor. Treat it as no hash.
        target = null;
      }

      if (target) {
        // `scroll-margin-top` on the section reserves the floating header's height, so
        // `scrollIntoView` lands the heading below it rather than under it.
        target.scrollIntoView({ behavior: 'instant', block: 'start' });
        stop();
        return;
      }

      // Roughly three seconds of a visible tab. A chunk that has not arrived by then is
      // not arriving, and the top of the page is a better place to be left than mid-air.
      if (attempts > 60) {
        window.scrollTo({ top: 0, behavior: 'instant' });
        stop();
        return;
      }

      timer = window.setTimeout(look, 50);
    };

    window.addEventListener('wheel', stop, { passive: true, once: true });
    window.addEventListener('touchstart', stop, { passive: true, once: true });
    window.addEventListener('keydown', stop, { once: true });
    look();

    return stop;
  }, [pathname, hash, key]);

  /* Per-route metadata. Without this every page in the browser's history, every bookmark
     and every shared link carries the home page's title. */
  useEffect(() => {
    const page = pageByPath(pathname);
    const fallbackTitle = page
      ? pathname === '/'
        ? page.title
        : `${page.label} — ${SITE}`
      : `Not found — ${SITE}`;

    const meta = document.querySelector('meta[name="description"]');
    const fallbackDescription = page?.description ?? 'This page could not be found. Return to the EKA Solution homepage or contact EKA.';
    document.title = fallbackTitle;
    if (meta) meta.setAttribute('content', fallbackDescription);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', fallbackTitle);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', fallbackDescription);
    const canonicalUrl = `${SITE_URL}${pathname === '/' ? '' : pathname}`;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', canonicalUrl);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', canonicalUrl);

    if (!API_ENABLED) return undefined;

    let active = true;
    api(`/content/page-meta?path=${encodeURIComponent(pathname)}`, { timeoutMs: 5000 })
      .then((payload) => {
        const remote = payload?.data;
        if (!active || !remote?.title) return;
        const title = remote.title;
        const description = remote.description || fallbackDescription;
        document.title = title;
        if (meta) meta.setAttribute('content', description);
        document.querySelector('meta[property="og:title"]')?.setAttribute('content', remote.og_title || title);
        document.querySelector('meta[property="og:description"]')?.setAttribute('content', remote.og_description || description);
      })
      .catch(() => {
        // The route metadata in the bundle is the reliable fallback.
      });

    return () => {
      active = false;
    };
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-[#F7F6F1] text-[var(--ink)]">
      {/* The sheet. One page-tall layer of paper fibre behind every route, so anything that
          does not paint its own ivory is still standing on paper. It sits under the night
          field, which paints over it, and under every section, which carries the same
          texture itself where it needs to cover this up. */}
      <div aria-hidden="true" className="paper-base" />

      {!loadingComplete && <Preloader onComplete={() => setLoadingComplete(true)} />}

      <CustomCursor />

      {/* Skip link. With the header floating free of the document flow and the first
          landmark half a viewport down, a keyboard user otherwise tabs through seven nav
          icons on every single page before reaching a word of content. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-1/2 focus:top-4 focus:z-[70] focus:-translate-x-1/2 focus:rounded-full focus:bg-[var(--ink)] focus:px-5 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-[#F7F6F1]"
      >
        Skip to content
      </a>

      <Navbar />

      {/* Keyed on the path so the entrance replays on every navigation. */}
      <main id="main" key={pathname} className="page-enter flex-1">
        <Outlet context={{ loadingComplete }} />
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
