import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WhatsAppFloat from '../components/WhatsAppFloat';
import { pageByPath, SITE_URL } from '../site';
import { startAnalytics, trackPageview } from '../lib/analytics';

const SITE = 'EKA Solution';

/** Lightweight shell shared by every route. */
export default function RootLayout() {
  const { pathname, hash, key } = useLocation();

  useEffect(() => startAnalytics(), []);

  useEffect(() => {
    trackPageview(pathname);
  }, [pathname]);

  // A route change starts at its top; a hash waits for its lazy-loaded target.
  useEffect(() => {
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

      // Stop after roughly three seconds if the target never arrives.
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

  }, [pathname]);

  return (
    <div className="app-shell" id="top">
      <a href="#main" className="skip-link">Skip to content</a>

      <Navbar />

      <main id="main" key={pathname} className="app-main">
        <Outlet />
      </main>

      <Footer />
      <WhatsAppFloat />
    </div>
  );
}
