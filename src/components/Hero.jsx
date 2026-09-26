import React from 'react';
import { Link } from 'react-router-dom';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
/** A static, fast-loading hero for the lightweight V2 site. */
export default function Hero() {
  return (
    <section id="home" className="hero-simple relative flex min-h-[min(760px,100svh)] items-center overflow-hidden px-6 py-32 lg:px-10">
      <div
        className="relative z-10 mx-auto w-full max-w-[1120px] text-center"
      >
          <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.04] px-4 py-1.5">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--spark-ice))] animate-pulse"
            />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--hero-ink-muted)]">
              Software Engineering Studio
            </span>
          </div>

        <h1 className="text-hero text-[12.5vw] leading-[0.92] text-[var(--hero-ink-text)] sm:text-[9vw] lg:text-[5.6vw]">
          <span className="block">Built for you.</span>
          <span className="block text-[var(--hero-ink-text)]/60">Built to last.</span>
        </h1>

          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-[var(--hero-ink-muted)] sm:text-lg">
            Thoughtful design and engineering for the way your business works.
          </p>

        <div className="mt-10 flex justify-center">
          <Link to="/contact" className="btn-ivory">
            <span>Start a Project</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
