import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import HeroCodeTrace from './HeroCodeTrace';
import HeroStarField from './HeroStarField';
import { onScroll } from '../lib/scrollDriver';

// v2 (lightweight fork): the Three.js particle globe was the single heaviest thing on the
// page (~150KB gzip, the whole `three` dependency) and was removed here to keep this build
// fast to ship. The panel was already designed to read on its graded background alone if the
// globe never arrives, so nothing else changes. The full globe still lives in eka-solutions-main.

/**
 * The night field: the one dark panel on the site, and the one place it takes colour.
 *
 * Layers, bottom up:
 *
 *   0  night        the graded background — black overhead, indigo rising off the floor
 *   0  globe        the canvas, masked so nothing survives into the seam
 *   2  trace        floating instrumentation fragments
 *   5  hollow       a soft central darkening that puts the copy in the sphere's hollow
 *  10  copy         eyebrow, headline, supporting thought, and one clear action
 *  20  seam         night dissolving into paper
 *  30  cue          the scroll hint, which is the only thing allowed over the seam
 *
 * Scrolling scrubs a single 0..1 progress value that every moving part reads — the copy
 * rises and thins, the camera pushes into the globe and it dims, the cue retracts — so the
 * whole panel moves as one object rather than as several animations that happen to overlap.
 * Scroll back up and it runs in reverse, because nothing here is a triggered transition; it
 * is all a function of position.
 *
 * One listener drives it. It writes `--hero-p` for the CSS-transformed layers and the same
 * number into a ref the globe's own render loop reads, so there is no second scroll handler
 * and no React re-render per frame.
 *
 * `ready` arrives from the preloader. The entrance is held until the curtain is actually
 * off the screen, otherwise the whole stagger plays behind it and the visitor sees the
 * finished state appear from nowhere.
 */
export default function Hero({ ready = true }) {
  const sectionRef = useRef(null);
  const copyRef = useRef(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // The copy leaves on its own curve rather than on raw progress. Fading it linearly
    // leaves it sitting at half opacity right across the sphere for a third of the scroll,
    // which reads as a rendering fault rather than a transition; this holds it solid for the
    // first stretch and then takes it away quickly, well before the seam.
    const COPY_OUT = [0.025, 0.23];
    const smoothstep = (v, lo, hi) => {
      const t = Math.min(1, Math.max(0, (v - lo) / (hi - lo)));
      return t * t * (3 - 2 * t);
    };

    let sectionTop = 0;
    let timelineHeight = 1;
    const lastStyleValue = new Map();
    let copyIsInert = false;

    const writeProgress = (name, value) => {
      const next = value.toFixed(4);
      if (lastStyleValue.get(name) === next) return;
      lastStyleValue.set(name, next);
      section.style.setProperty(name, next);
    };

    const measure = ({ scrollY }) => {
      // Progress must finish while the stage is still pinned. Dividing by the whole
      // section left the last 40% of the old animation playing after it had scrolled away.
      const p = reducedMotion ? 0 : Math.min(
        1,
        Math.max(0, (scrollY - sectionTop) / timelineHeight),
      );
      progressRef.current = p;
      writeProgress('--hero-p', p);
      const copyOpacity = 1 - smoothstep(p, COPY_OUT[0], COPY_OUT[1]);
      writeProgress('--hero-copy', copyOpacity);
      const nextCopyIsInert = copyOpacity < 0.01;
      if (copyRef.current && copyIsInert !== nextCopyIsInert) {
        copyIsInert = nextCopyIsInert;
        copyRef.current.inert = copyIsInert;
      }
      // Wait until the camera has pushed far enough into the globe for the second thought to
      // sit fully inside it. Once revealed, the copy stays solid and leaves only when the
      // sticky hero itself scrolls away — opacity never removes it during the pinned scene.
      const secondIn = smoothstep(p, 0.53, 0.73);
      const secondBodyIn = smoothstep(p, 0.64, 0.82);
      writeProgress('--hero-second-in', secondIn);
      writeProgress('--hero-second-body', secondBodyIn);
      writeProgress('--hero-seam', smoothstep(p, 0.83, 1));
      // Drive the atmospheric glow intensity from scroll: peaks at ~25% then fades.
      // This makes the glow pulse as the user engages with the section.
      const glowIntensity = Math.max(0, 1 - Math.abs(p - 0.25) * 3.0) * 0.35 + (1 - p) * 0.65;
      writeProgress('--globe-glow', Math.max(0, Math.min(1, glowIntensity)));
    };

    // The section's geometry changes on resize and after a late font swap, not on scroll.
    // Cache it there so scrolling only does arithmetic and style writes, with no forced
    // layout reads competing with the WebGL frame.
    const remeasure = () => {
      const height = section.offsetHeight || 1;
      const stageHeight = section.firstElementChild.offsetHeight;
      sectionTop = section.offsetTop;
      timelineHeight = Math.max(1, height - stageHeight);
      measure({ scrollY: window.scrollY });
    };

    remeasure();
    const unsubscribe = onScroll(measure);
    const resizeObserver = new ResizeObserver(remeasure);
    resizeObserver.observe(section);
    resizeObserver.observe(section.firstElementChild);
    // CSS decoration sleeps when the stage is offscreen or the browser tab is hidden.
    const stage = section.firstElementChild;
    let inView = true;
    const updateActivity = () => {
      stage.dataset.active = String(inView && !document.hidden);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateActivity();
    });
    observer.observe(stage);
    updateActivity();
    document.addEventListener('visibilitychange', updateActivity);
    return () => {
      observer.disconnect();
      resizeObserver.disconnect();
      unsubscribe();
      document.removeEventListener('visibilitychange', updateActivity);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="home"
      data-ready={ready ? 'true' : 'false'}
      className="hero-scroll relative isolate"
      style={{
        '--hero-p': 0,
        '--hero-copy': 1,
        '--hero-second-in': 0,
        '--hero-second-body': 0,
        '--hero-seam': 0,
        '--globe-glow': 1,
      }}
    >
      <div className="hero-night hero-stage sticky top-0 flex h-[100svh] items-center overflow-hidden pt-24 pb-28">
      <HeroStarField />

      {/* Atmospheric globe glow — the large blue bloom behind the sphere */}
      <div aria-hidden="true" className="hero-globe-glow" />

      {/* Instrumentation bleeding through the dark */}
      <HeroCodeTrace />

      {/* The hollow. Just enough darkening under the supporting copy to hold
          them off the shell — the sphere's interior is genuinely dark now, so this no longer
          has to do the work a flat scrim used to. Heavier than this and it eats the far
          hemisphere's specks, which is what the interior of the reference is made of. */}
      <div aria-hidden="true" className="hero-hollow pointer-events-none absolute inset-0 z-[5]" />

      {/* Copy stack. Enters in a measured sequence, then rises and thins as the section is scrolled
          through. The two are kept on separate elements — the intro owns the inner
          transform, the scrub owns the outer one — so neither ever has to fight the other
          for the same property. */}
      <div
        ref={copyRef}
        className="hero-copy relative z-10 mx-auto w-full max-w-[1120px] px-6 text-center lg:px-10"
        style={{
          transform: 'translate3d(0, calc(var(--hero-p) * -32px), 0)',
          opacity: 'var(--hero-copy)',
        }}
      >
        <div className="hero-rise" style={{ '--d': '0ms' }}>
          <div className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/[0.14] bg-white/[0.04] px-4 py-1.5 backdrop-blur-sm">
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--spark-ice))] animate-pulse"
            />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--hero-ink-muted)]">
              Software Engineering Studio
            </span>
          </div>
        </div>

        {/* Each line rises out of its own clip, which is what makes a headline land rather
            than merely fade in. */}
        <h1 className="text-hero text-[12.5vw] leading-[0.92] text-[var(--hero-ink-text)] sm:text-[9vw] lg:text-[5.6vw]">
          <span className="hero-line">
            <span className="hero-line-inner" style={{ '--d': '90ms' }}>
              Built for you.
            </span>
          </span>
          <span className="hero-line">
            <span className="hero-line-inner text-[var(--hero-ink-text)]/60" style={{ '--d': '200ms' }}>
              Built to last.
            </span>
          </span>
        </h1>

        <div className="hero-rise" style={{ '--d': '330ms' }}>
          <p className="mx-auto mt-8 max-w-xl text-base leading-relaxed text-[var(--hero-ink-muted)] sm:text-lg">
            Thoughtful design and engineering for the way your business works.
          </p>
        </div>

        <div className="hero-rise mt-10 flex justify-center" style={{ '--d': '430ms' }}>
          <Link to="/contact" className="btn-ivory">
            <span>Start a Project</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div
        className="hero-second pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 text-center"
        style={{
          opacity: 'var(--hero-second-in)',
          transform: 'translate3d(0, calc((1 - var(--hero-second-in)) * 48px), 0)',
        }}
      >
        <div className="hero-second-copy relative isolate w-full max-w-5xl">
          <div
            aria-hidden="true"
            className="hero-second-marker mx-auto mb-7 flex items-center justify-center gap-3"
            style={{ opacity: 'var(--hero-second-body)' }}
          >
            <span className="h-px w-10 bg-white/25" />
            <span className="h-1.5 w-1.5 rounded-full bg-[rgb(var(--spark-ice))] shadow-[0_0_14px_rgba(200,214,255,0.85)]" />
            <span className="h-px w-10 bg-white/25" />
          </div>
          <h2 className="hero-second-title text-hero text-balance text-[clamp(2.65rem,4.6vw,5.6rem)] leading-[0.94] text-[var(--hero-ink-text)]">
            Make the next step <span className="sm:block">a better one.</span>
          </h2>
          <p
            className="hero-second-body mx-auto mt-8 max-w-2xl text-[clamp(1rem,1.25vw,1.2rem)] font-medium leading-[1.7] text-[#C5CDDF]"
            style={{
              opacity: 'var(--hero-second-body)',
              transform: 'translate3d(0, calc((1 - var(--hero-second-body)) * 22px), 0)',
            }}
          >
            Turn a business challenge into a clear plan, a useful product,
            and a stronger foundation for what comes next.
          </p>
        </div>
      </div>

      {/* The seam. See `.hero-seam` — it is a dissolve, not an edge, and most of its work
          happens in the last fifth of its height so it never reads as a band of fog. */}
      <div aria-hidden="true" className="hero-seam" />

      {/* Scroll cue. Sits over the seam, and retracts as soon as the visitor takes the hint. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 z-30 flex justify-center"
        style={{
          bottom: 'calc(var(--seam-h) * 0.62)',
          opacity: 'calc(var(--hero-copy) - 0.15)',
          transform: 'translate3d(0, calc(var(--hero-p) * 18px), 0)',
        }}
      >
        <span className="hero-cue" />
      </div>
      </div>
    </section>
  );
}
