import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left';
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right';
import Reveal from './Reveal';
import { CONTACT, STORY_PAGES } from '../site';

/**
 * Previous / next, at the foot of every page.
 *
 * This is the piece that keeps the split honest. The page used to be one scroll whose
 * *order* was the argument — who we are, what we sell, whether we can do it, how to start
 * — and a visitor got that order whether they wanted it or not. Cutting it into routes
 * hands them a menu instead, which is better for the person who came for one thing and
 * worse for the person who came to be convinced.
 *
 * So the sequence is still here, at the bottom of each page, as the next thing to read.
 * Nobody has to follow it. But it means someone who reads straight through still gets the
 * visitor journey in order: offer, point of view, capabilities, evidence, process, and
 * finally a useful conversation. Careers is intentionally outside this client journey — it
 * remains in global navigation for people considering EKA as a workplace.
 */
export default function PageNav() {
  const { pathname } = useLocation();
  const index = STORY_PAGES.findIndex((page) => page.path === pathname);
  const isCareers = pathname === '/careers';
  if (index === -1 && !isCareers) return null;

  const previous = isCareers ? null : index > 0 ? STORY_PAGES[index - 1] : null;
  const next = isCareers ? CONTACT : index < STORY_PAGES.length - 1 ? STORY_PAGES[index + 1] : null;
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Previous and next page"
      className="section-dark relative border-t border-[var(--border-hairline)]"
    >
      <div className="mx-auto grid max-w-[1300px] gap-px bg-[var(--border-hairline)] sm:grid-cols-2">
        {previous ? (
          <Reveal variant="up-sm">
            <Link
              to={previous.path}
              className="paper group relative flex h-full items-center gap-4 bg-[var(--bg-canvas)] px-6 py-9 transition-colors hover:bg-[var(--bg-raised)] lg:px-10 lg:py-11"
            >
              <ArrowLeft
                className="h-4 w-4 shrink-0 text-[var(--ink-faint)] transition-all duration-300 group-hover:-translate-x-1 group-hover:text-[var(--blue)]"
                aria-hidden="true"
              />
              <span className="min-w-0">
                <span className="block font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.24em] text-[var(--ink-faint)]">
                  Previous
                </span>
                <span className="mt-1.5 block font-display text-xl leading-tight text-[var(--ink)] transition-colors group-hover:text-[var(--blue)] lg:text-2xl">
                  {previous.label}
                </span>
                <span className="mt-1 block text-[var(--fs-sm)] leading-snug text-[var(--ink-soft)]">
                  {previous.line}
                </span>
              </span>
            </Link>
          </Reveal>
        ) : (
          <span aria-hidden="true" className="paper relative hidden bg-[var(--bg-canvas)] sm:block" />
        )}

        {next && (
          <Reveal variant="up-sm" delay={80}>
            <Link
              to={next.path}
              className="paper group relative flex h-full items-center justify-end gap-4 bg-[var(--bg-canvas)] px-6 py-9 text-right transition-colors hover:bg-[var(--bg-raised)] lg:px-10 lg:py-11"
            >
              <span className="min-w-0">
                <span className="block font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.24em] text-[var(--ink-faint)]">
                  Next
                </span>
                <span className="mt-1.5 block font-display text-xl leading-tight text-[var(--ink)] transition-colors group-hover:text-[var(--blue)] lg:text-2xl">
                  {next.label}
                </span>
                <span className="mt-1 block text-[var(--fs-sm)] leading-snug text-[var(--ink-soft)]">
                  {next.line}
                </span>
              </span>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-[var(--ink-faint)] transition-all duration-300 group-hover:translate-x-1 group-hover:text-[var(--blue)]"
                aria-hidden="true"
              />
            </Link>
          </Reveal>
        )}
      </div>
    </nav>
  );
}
