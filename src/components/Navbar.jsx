import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import Menu from 'lucide-react/dist/esm/icons/menu';
import X from 'lucide-react/dist/esm/icons/x';
import BrandLogo from './BrandLogo';
import { PAGES, CONTACT } from '../site';

/**
 * The floating capsule, now a router.
 *
 * It used to be a scroll spy: six hash links and a listener that measured section offsets
 * on every scroll event to work out which one was in view. With the sections split across
 * routes, the current page *is* the answer, so all of that measurement is gone and the
 * active mark comes from `NavLink` for free.
 *
 * What did not survive the split was the icon-only row on a phone. A growing row of
 * unlabelled glyphs is a guessing game, and at 375px it no longer fits beside the logo and
 * the button anyway. Small screens get a proper sheet with the names written out, which is
 * what the icons were standing in for all along.
 */
export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const toggleRef = useRef(null);

  /* The sheet's own links close it on click. This is the fallback for the ways a route can
     change without one being pressed — browser back and forward, mainly, which would
     otherwise leave the sheet sitting over a page the visitor did not open it on. */
  useEffect(() => {
    setMenuOpen((open) => (open ? false : open));
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKey = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    };

    // The sheet covers the page; the page behind it must not scroll under it.
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="fixed left-1/2 top-5 z-50 w-auto max-w-[94vw] -translate-x-1/2 sm:max-w-none">
        <nav
          aria-label="Primary"
          className="nav-capsule flex items-center gap-2 rounded-full px-3 py-2 transition-all duration-300 sm:gap-4 sm:px-4 sm:py-2.5"
        >
          <Link
            to="/"
            className="brand-link brand-nav-link rounded-full py-1 pl-1.5 pr-2"
            aria-label="EKA Solution — home"
          >
            <BrandLogo decorative priority />
          </Link>

          <span aria-hidden="true" className="hidden h-4 w-px bg-[var(--ink)]/10 lg:block" />

          {/* The active destination becomes its familiar icon, with a location dot. Every
              other destination stays written out, so the navigation is still scannable at a
              glance and the selected icon feels like a precise, quiet state marker. */}
          <div className="hidden items-center gap-1 xl:flex">
            {PAGES.map((page) => {
              const Icon = page.icon;
              return (
                <NavLink
                  key={page.path}
                  to={page.path}
                  end={page.path === '/'}
                  aria-label={page.label}
                  data-analytics="nav_click"
                  data-analytics-label={page.label}
                  className={({ isActive }) =>
                    `group/nav relative rounded-full px-3 py-2 transition-all duration-200 ${
                      isActive
                        ? 'bg-[var(--ink)]/[0.06] text-[var(--ink)]'
                        : 'text-[var(--ink-soft)] hover:bg-[var(--ink)]/[0.04] hover:text-[var(--ink)]'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive ? (
                        <>
                          <Icon className="h-4 w-4" aria-hidden="true" />
                          <span
                            aria-hidden="true"
                            className="nav-tip pointer-events-none absolute left-1/2 top-full z-10 mt-2.5 whitespace-nowrap rounded-full bg-[var(--ink)] px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-[#F7F6F1] opacity-0 shadow-quiet-card transition-all duration-200 group-hover/nav:opacity-100 group-focus-visible/nav:opacity-100"
                          >
                            {page.label}
                          </span>
                        </>
                      ) : (
                        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em]">
                          {page.label}
                        </span>
                      )}
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-[var(--ink)]"
                        />
                      )}
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>

          <span aria-hidden="true" className="h-4 w-px bg-[var(--ink)]/10" />

          <Link
            to={CONTACT.path}
            data-analytics="cta_click"
            data-analytics-label="Lets talk"
            className="btn-ink !px-4 !py-1.5 !text-xs !font-semibold whitespace-nowrap"
          >
            <span>Let&rsquo;s Talk</span>
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>

          {/* Menu, below xl. */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="rounded-full p-2 text-[var(--ink)] transition-colors hover:bg-[var(--ink)]/[0.06] xl:hidden"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </nav>
      </header>

      {/* ---- The sheet ---- */}
      {menuOpen && (
        <div
          id="site-menu"
          className="fixed inset-0 z-[55] xl:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
        >
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 h-full w-full cursor-default bg-[rgba(27,34,82,0.28)] backdrop-blur-sm"
          />

          <div className="paper animate-fade-in absolute inset-x-3 top-3 overflow-hidden rounded-[26px] border border-[var(--border-hairline)] bg-[var(--bg-canvas)] shadow-quiet-lift">
            <div className="relative z-10 flex items-center justify-between px-5 pb-3 pt-5">
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--ink-faint)]">
                <span aria-hidden="true" className="text-[var(--blue)]">+</span> Contents
              </span>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  toggleRef.current?.focus();
                }}
                aria-label="Close menu"
                className="-mr-1 rounded-full p-2 text-[var(--ink-faint)] transition-colors hover:bg-[var(--ink)]/[0.06] hover:text-[var(--ink)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav
              aria-label="All pages"
              className="relative z-10 max-h-[calc(100svh-9rem)] overflow-y-auto px-5 pb-5"
            >
              <ul className="divide-y divide-[var(--border-hairline)] border-y border-[var(--border-hairline)]">
                {[...PAGES, CONTACT].map((page, index) => (
                  <li key={page.path}>
                    <NavLink
                      to={page.path}
                      end={page.path === '/'}
                      onClick={() => setMenuOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-4 py-4 ${isActive ? 'text-[var(--blue)]' : 'text-[var(--ink)]'}`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`font-mono text-[10px] font-semibold tracking-[0.2em] ${
                              isActive ? 'text-[var(--blue)]' : 'text-[var(--ink-faint)]'
                            }`}
                          >
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block font-display text-lg leading-snug">
                              {page.label}
                            </span>
                            <span className="mt-0.5 block text-[12.5px] leading-snug text-[var(--ink-soft)]">
                              {page.line}
                            </span>
                          </span>
                          <ArrowUpRight
                            className={`h-4 w-4 shrink-0 ${
                              isActive ? 'text-[var(--blue)]' : 'text-[var(--ink-faint)]'
                            }`}
                            aria-hidden="true"
                          />
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
