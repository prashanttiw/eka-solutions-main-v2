import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import Volume2 from 'lucide-react/dist/esm/icons/volume-2';
import VolumeX from 'lucide-react/dist/esm/icons/volume-x';
import BrandLogo from './BrandLogo';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import InkPlate from './InkPlate';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { isSoundOn, playPageTurn, setSoundOn } from '../lib/pageAudio';
import { useContent } from '../lib/content';

/**
 * The work, as a bound sketchbook you leaf through.
 *
 * Modelled on a real book rather than on a carousel, because the two behave differently
 * and only one of them is convincing. A carousel slides a new panel in from the side; a
 * book has a *leaf* — one sheet, printed on both sides, hinged at the spine — and turning
 * it reveals the next left page and the next right page at the same time from a single
 * piece of paper. Getting that right is most of the effect:
 *
 *   forward   the current RIGHT page lifts and swings left about the spine. Its front is
 *             the page you were reading; its back is the NEXT spread's left page. The
 *             right well underneath has already been repainted with the next right page,
 *             so the sheet uncovers it as it goes.
 *   backward  the mirror image: the current LEFT page swings right, its back carrying the
 *             PREVIOUS spread's right page.
 *
 * The three things that sell it as paper rather than as a rotating card, in order of how
 * much they matter: the shadow the leaf drags across the page underneath, the gutter
 * darkening at the spine, and the block of page edges visible along the outer edges. The
 * 3D rotation on its own reads as a flipping tile.
 *
 * Below `md` the spread collapses to a single page — two facing pages on a phone leaves
 * each one about 160px wide, which is not a book, it is a stamp — and the turn becomes a
 * cross-dissolve with a slight lift.
 *
 * The book has a closed state, held at index -1. Closed it is a case-bound box — front
 * board, back board, spine, fore-edge — which is the only reason dragging it round is
 * worth offering: spinning a single plane gives you a card with nothing behind it. Opening
 * is not a special animation, it is an ordinary forward turn where the leaf's front face
 * happens to be the cover, plus a quarter-width slide so the object stays centred as it
 * goes from one page wide to two.
 *
 * Input is split by device rather than shared, because the two natural gestures collide.
 * A mouse drags to orbit and clicks a page to turn it; a finger swipes to turn and never
 * orbits. Trying to serve both from one gesture means guessing at intent on every
 * pointermove, and guessing wrong is worse than not offering the feature.
 */

const TURN_MS = 1000;

const PROJECTS = [
  {
    id: 'apex',
    name: 'ApexCloud',
    caption: 'Multi-tenant platform',
    sector: 'SaaS · Cloud infrastructure',
    year: '2025',
    note: 'Forty-one bespoke deployments folded onto one release train. The hard part was never the tenancy model — it was migrating eleven live customers without a maintenance window.',
    stack: ['Go', 'PostgreSQL', 'Kubernetes', 'Terraform'],
    stat: { value: '11 wks → 4 days', label: 'Enterprise onboarding' },
    image: '/assets/case-apex.jpg',
  },
  {
    id: 'neural',
    name: 'NeuralFlow',
    caption: 'Agent orchestration',
    sector: 'AI · Enterprise automation',
    year: '2025',
    note: 'Four thousand documents a day, reviewed by hand. The pilot worked in the demo and could not be trusted with a real queue, so we built the evaluation harness before we touched the prompts.',
    stack: ['Python', 'pgvector', 'LangGraph', 'LLM APIs'],
    stat: { value: '82%', label: 'Fully automated' },
    image: '/assets/case-neural.jpg',
  },
  {
    id: 'vault',
    name: 'VaultPay',
    caption: 'Neo-bank ledger',
    sector: 'FinTech · High-throughput core',
    year: '2024',
    note: 'Reconciliation ran overnight in batch, so support could not answer "where is my money" until the morning. Event-sourced double entry, and the read model support sees is the one the customer sees.',
    stack: ['Rust', 'Kafka', 'PostgreSQL', 'ClickHouse'],
    stat: { value: '<15ms', label: 'p95 ledger write' },
    image: '/assets/case-vault.jpg',
  },
  {
    id: 'orbit',
    name: 'Orbit',
    caption: 'SaaS foundation',
    sector: 'EKA product · Generally available',
    year: '2026',
    note: 'The nine months every SaaS spends rebuilding the same plumbing, extracted once and run properly: tenancy, identity, roles, billing, audit, admin.',
    stack: ['TypeScript', 'Next.js', 'PostgreSQL', 'Stripe'],
    stat: { value: '6 weeks', label: 'To first paying tenant' },
  },
  {
    id: 'relay',
    name: 'Relay',
    caption: 'Agent runtime',
    sector: 'EKA product · Beta',
    year: '2026',
    note: 'Tool routing, retries, evaluation gates, spend ceilings, and a trace of every decision the model made. Built because we had written it three times for clients already.',
    stack: ['TypeScript', 'Go', 'OpenTelemetry', 'Redis'],
    stat: { value: '38%', label: 'Inference spend removed' },
  },
  {
    id: 'atlas',
    name: 'Atlas',
    caption: 'Cloud control plane',
    sector: 'EKA product · Private preview',
    year: '2026',
    note: 'Environments, policy, drift and cost in one view, so an infrastructure decision shows its bill before it is merged rather than at the end of the month.',
    stack: ['Go', 'Terraform', 'ClickHouse', 'Grafana'],
    stat: { value: '99.98%', label: 'Managed availability' },
  },
];

const mapProject = (entry) => ({
  id: entry.id,
  name: entry.name || entry.id,
  caption: entry.caption || '',
  sector: entry.sector || '',
  year: entry.year || '',
  note: entry.note || '',
  stack: Array.isArray(entry.stack) ? entry.stack : [],
  stat: entry.stat || null,
  image: entry.image || null,
});

/* -------------------------------------------------------------------------- */

function LeftPage({ project, index, total }) {
  return (
    <div className="book-face book-face--left">
      <div className="book-face-ink">
        <div className="flex items-baseline justify-between">
          <span className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.24em] text-[var(--ink-faint)]">
            Plate {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          <span className="font-mono text-[var(--fs-2xs)] tracking-[0.2em] text-[var(--ink-faint)]">
            {project.year}
          </span>
        </div>

        <h3 className="mt-5 text-hero text-[clamp(1.75rem,3.4vw,2.6rem)] leading-[0.95] text-[var(--ink)]">
          {project.name}
        </h3>
        <p className="mt-2 font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.18em] text-[var(--blue)]">
          {project.sector}
        </p>

        <div className="book-rule" aria-hidden="true" />

        <p className="book-note">{project.note}</p>

        {/* The snapshot, taped in. This is where the reference puts its photographs and
            ticket stubs — on the left page, among the writing, rather than as the plate.
            It is also why the screenshots are toned blue in CSS: a full-colour photograph
            of a dark dashboard dropped onto cream paper reads as a hole cut in the page,
            where a blue print reads as something that was developed and stuck in. */}
        {project.image && (
          <div className="book-snap">
            <img
              src={project.image}
              alt={`${project.name} interface`}
              loading="lazy"
              decoding="async"
            />
            <span aria-hidden="true" className="book-tape book-tape--tl" />
            <span aria-hidden="true" className="book-tape book-tape--br" />
          </div>
        )}

        <div className="mt-auto">
          <div className="flex flex-wrap gap-1.5">
            {project.stack.map((tech) => (
              <span key={tech} className="book-chip">
                {tech}
              </span>
            ))}
          </div>

          <div className="mt-5 flex items-end justify-between gap-4">
            <span>
              <span className="block text-hero text-2xl leading-none text-[var(--ink)]">
                {project.stat.value}
              </span>
              <span className="mt-1 block font-mono text-[var(--fs-2xs)] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                {project.stat.label}
              </span>
            </span>
            <span
              aria-hidden="true"
              className="font-mono text-[var(--fs-2xs)] uppercase tracking-[0.2em] text-[var(--ink-faint)]"
            >
              {String(index * 2 + 1).padStart(3, '0')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RightPage({ project, index }) {
  return (
    <div className="book-face book-face--right">
      <div className="book-face-ink">
        {/* The plate: a drawing, always. Every spread in the reference has one big
            hand-made image facing the writing, and it is what makes the object read as a
            sketchbook rather than as a slide. Screenshots live on the facing page. */}
        <div className="book-plate">
          <InkPlate seed={project.id} label={project.name} className="h-full w-full" />
        </div>

        <div className="mt-4 flex items-baseline justify-between gap-4">
          <span className="font-mono text-[var(--fs-2xs)] uppercase tracking-[0.2em] text-[var(--ink-faint)]">
            {project.caption}
          </span>
          <span
            aria-hidden="true"
            className="font-mono text-[var(--fs-2xs)] uppercase tracking-[0.2em] text-[var(--ink-faint)]"
          >
            {String(index * 2 + 2).padStart(3, '0')}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * The front board, printed. Also used as the leaf's front face while the book opens, which
 * is why it is a page component like any other rather than something the closed state owns.
 */
function CoverPage() {
  return (
    <div className="book-cover-ink">
      <span aria-hidden="true" className="book-cover-frame" />

      <div className="relative flex flex-1 flex-col items-center justify-between py-[6%]">
        <BrandLogo layout="wordmark" inverse className="brand-book-wordmark" />

        <span>
          <span className="book-cover-foil block text-hero text-[clamp(1.6rem,3.6vw,2.9rem)] leading-[0.92]">
            The Work
            <br />
            Book
          </span>
          <span className="mt-[7%] block font-mono text-[var(--fs-2xs)] uppercase tracking-[0.3em] text-[#C6D2FF]/55">
            Selected projects
          </span>
          <span className="mt-1 block font-mono text-[var(--fs-2xs)] uppercase tracking-[0.3em] text-[#C6D2FF]/55">
            2024 &ndash; 2026
          </span>
        </span>

        <BrandLogo layout="symbol" className="brand-book-symbol" decorative />
      </div>
    </div>
  );
}

/** The back board. Deliberately almost empty — a back cover that competes with the front
 *  reads as a poster printed on both sides. */
function CoverBack() {
  return (
    <div className="book-cover-ink">
      <span aria-hidden="true" className="book-cover-frame" />
      <div className="relative flex flex-1 flex-col items-center justify-center gap-[8%]">
        <BrandLogo layout="symbol" className="brand-book-symbol" />
        <span className="font-mono text-[var(--fs-2xs)] uppercase tracking-[0.3em] text-[#C6D2FF]/40">
          Bound in Bengaluru
        </span>
      </div>
    </div>
  );
}

/** The closed book as an object: two boards, a spine and the block of pages between. */
function ClosedBook() {
  return (
    <div className="book-cover" aria-hidden="true">
      {/* Back board first, front board last. `backface-visibility` plus a negative
          `translateZ` should be enough to order these, and in Chrome it is — but WebKit
          stops depth-sorting sibling faces once one of them clips and falls back to DOM
          order, which showed the closed book mirror-written. Making the DOM order agree
          with the depth order costs nothing and removes the whole class of bug. */}
      <div className="book-cover-face book-cover-face--back">
        <CoverBack />
      </div>
      <span className="book-cover-spine" />
      <span className="book-cover-edge" />
      <div className="book-cover-face book-cover-face--front">
        <CoverPage />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

/** How far the book may be turned by hand, in degrees. Open it is clamped hard: past
 *  about thirty-five degrees the type on the far page keystones into illegibility. Closed
 *  there is nothing to read, so it spins all the way round to the back board. */
const ORBIT = {
  open: { y: 34, xUp: 13, xDown: 11 },
  closed: { y: 180, xUp: 20, xDown: 18 },
};

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

export default function ProjectBook() {
  // -1 is the book shut, showing the front board. 0..total-1 are the spreads.
  const [index, setIndex] = useState(-1);
  const [turn, setTurn] = useState(null); // { dir: 'next' | 'prev', from: number }
  // Lazy initialiser rather than an effect: this app has no server pass, so reading the
  // preference during the first render is safe and avoids mounting with the wrong icon
  // and correcting it a frame later.
  const [soundOn, setSoundOnState] = useState(isSoundOn);
  const projects = useContent('projects', PROJECTS, mapProject);
  const timer = useRef(0);
  const stageRef = useRef(null);
  const bookRef = useRef(null);
  const pointer = useRef(null);
  const orbit = useRef(null);
  const dragged = useRef(false);

  const total = projects.length;
  const isSinglePage = useMediaQuery('(max-width: 767px)');
  const reduced = useMediaQuery('(prefers-reduced-motion: reduce)');
  // Drives the instruction line only. Orbiting and click-to-turn are mouse-only —
  // promising them to a thumb is worse than saying nothing.
  const isTouch = useMediaQuery('(pointer: coarse)');

  const go = useCallback(
    (dir) => {
      // A second turn started mid-flight would leave the leaf's two faces showing pages
      // from three different spreads at once, so the book simply refuses until it lands.
      if (turn) return;
      const next = dir === 'next' ? index + 1 : index - 1;
      if (next < -1 || next >= total) return;

      // A board is heavier than a sheet, and the ear knows it.
      const closing = next === -1 || index === -1;
      playPageTurn(dir, closing ? 1.45 : 1);

      if (reduced) {
        setIndex(next);
        return;
      }

      setTurn({ dir, from: index });
      clearTimeout(timer.current);
      timer.current = setTimeout(() => {
        setIndex(next);
        setTurn(null);
      }, TURN_MS);
    },
    [index, total, turn, reduced],
  );

  useEffect(() => () => clearTimeout(timer.current), []);

  const toggleSound = useCallback(() => {
    setSoundOnState((was) => {
      const next = !was;
      setSoundOn(next);
      // Confirm the choice with the thing being chosen. Turning sound on and hearing
      // nothing until the next page is a toggle you cannot tell worked.
      if (next) playPageTurn('next', 0.8);
      return next;
    });
  }, []);

  const onKeyDown = useCallback(
    (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        go('next');
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        go('prev');
      }
    },
    [go],
  );

  const setOrbit = useCallback((y, x) => {
    const node = bookRef.current;
    if (!node) return;
    node.style.setProperty('--orbit-y', `${y.toFixed(2)}deg`);
    node.style.setProperty('--orbit-x', `${x.toFixed(2)}deg`);
    // Which board faces the camera is decided here rather than by
    // `backface-visibility`, which WebKit stops honouring once a face has
    // descendants with their own stacking contexts — and a printed cover has
    // several. Past a quarter turn, the back board is the one you are looking at.
    const away = Math.abs(((y % 360) + 540) % 360 - 180) < 90;
    node.classList.toggle('is-reversed', away);
  }, []);

  /**
   * Mouse: drag to orbit. Touch: swipe to turn.
   *
   * The same gesture cannot mean both. Sharing it would require deciding, on every
   * pointermove, whether a horizontal drag is someone inspecting the object or someone
   * turning a page — and getting that wrong feels broken in a way that not having the
   * feature does not.
   */
  const onPointerDown = useCallback(
    (event) => {
      if (event.pointerType === 'mouse') {
        if (event.button !== 0 || reduced) return;
        dragged.current = false;
        orbit.current = { x: event.clientX, y: event.clientY };
        bookRef.current?.classList.add('is-orbiting');
        event.currentTarget.setPointerCapture?.(event.pointerId);
        return;
      }
      pointer.current = { x: event.clientX, y: event.clientY };
    },
    [reduced],
  );

  const onPointerMove = useCallback(
    (event) => {
      const start = orbit.current;
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      // Six pixels of slop before a click becomes a drag, so a slightly unsteady hand
      // can still click a page to turn it.
      if (!dragged.current && Math.hypot(dx, dy) < 6) return;
      dragged.current = true;

      const limit = index === -1 ? ORBIT.closed : ORBIT.open;
      setOrbit(
        clamp(dx * 0.34, -limit.y, limit.y),
        clamp(-dy * 0.16, -limit.xDown, limit.xUp),
      );
    },
    [index, setOrbit],
  );

  const endOrbit = useCallback(() => {
    if (!orbit.current) return;
    orbit.current = null;
    // Dropping `is-orbiting` puts the transition back, and the reset springs the book
    // home rather than snapping it.
    bookRef.current?.classList.remove('is-orbiting');
    setOrbit(0, 0);
  }, [setOrbit]);

  // Swipe. A full turn per gesture rather than a scrub: a half-finished drag would have to
  // be able to spring back, and a book that can be left ajar is worse than one that cannot
  // be dragged at all.
  const onPointerUp = useCallback(
    (event) => {
      if (event.pointerType === 'mouse') {
        endOrbit();
        return;
      }
      const start = pointer.current;
      pointer.current = null;
      if (!start) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) < 46 || Math.abs(dx) < Math.abs(dy)) return;
      go(dx < 0 ? 'next' : 'prev');
    },
    [go, endOrbit],
  );

  // A click that arrived at the end of a drag is not a click.
  const turnFromPage = useCallback(
    (dir) => {
      if (dragged.current) {
        dragged.current = false;
        return;
      }
      go(dir);
    },
    [go],
  );

  const closed = index === -1;
  const current = closed ? null : projects[index];
  const forward = turn?.dir === 'next';
  const backward = turn?.dir === 'prev';

  // Whether the book should *look* shut this frame. It cannot simply be `closed`: `index`
  // only commits when the turn lands, so during the opening turn the book is still at -1
  // while the boards need to already be sliding apart, and during the closing turn it is
  // still at 0 while they need to be coming together.
  const closedVisual = turn ? backward && turn.from === 0 : closed;

  // What the two static wells show. During a turn they are already painted with the
  // destination on the side the leaf is uncovering. `null` on the left means the book is
  // shut and there is nothing under the cover but the table.
  const leftWellIndex = forward ? index : backward ? index - 1 : index;
  const rightWellIndex = backward ? index : forward ? index + 1 : index;
  const leftWell = leftWellIndex >= 0 ? projects[leftWellIndex] : null;
  const rightWell = rightWellIndex >= 0 ? projects[rightWellIndex] : null;

  // The leaf's two faces. Front is the page being lifted, back is what is printed on the
  // other side of that same sheet. At the ends of the book one of them is a board.
  const leafFrontIndex = turn ? turn.from : 0;
  const leafBackIndex = turn ? (forward ? turn.from + 1 : turn.from - 1) : 0;

  return (
    <section
      id="journal"
      className="book-section section-dark relative overflow-hidden border-t border-[var(--border-hairline)] py-24 lg:py-32"
    >
      <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-10">
        <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_1fr]">
          <SectionHeading
            eyebrow="The Work Book"
            title={
              <>
                Leaf through
                <br />
                <span className="text-[var(--blue)]">what we have built.</span>
              </>
            }
            size="md"
          />
          <Reveal variant="up" delay={140}>
            <p className="max-w-md text-base leading-relaxed text-[var(--ink-soft)] lg:justify-self-end">
              One spread per project — the problem on the left, the thing itself on the
              right. Client work and our own products in the same book, because they are
              made by the same people to the same standard.
            </p>
          </Reveal>
        </div>

        <Reveal variant="scale" delay={120} className="mt-14">
          <div
            ref={stageRef}
            className="book-stage"
            role="group"
            aria-roledescription="carousel"
            aria-label="Project book"
            tabIndex={0}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={() => {
              pointer.current = null;
              endOrbit();
            }}
          >
            {/* Previous. Placed outside the book so it never covers a page. */}
            <button
              type="button"
              onClick={() => go('prev')}
              disabled={index === -1 || !!turn}
              aria-label={index === 0 ? 'Close the book' : 'Previous project'}
              className="book-arrow book-arrow--prev"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>

            <div
              className={`book-shift ${closedVisual ? 'is-closed' : ''}`}
              style={{ '--turn-ms': `${TURN_MS}ms` }}
            >
            <div
              ref={bookRef}
              className={`book ${turn ? 'is-turning' : ''} ${
                forward ? 'is-forward' : ''
              } ${backward ? 'is-backward' : ''} ${isSinglePage ? 'is-single' : ''} ${
                closedVisual ? 'is-closed' : ''
              }`}
            >
              <span aria-hidden="true" className="book-shadow" />
              {/* The block of page edges the sheets are bound into. Purely drawn — but it
                  is the one element that gives the book thickness, and without it the
                  spread reads as two sheets of paper lying on a table. */}
              <span aria-hidden="true" className="book-block book-block--left" />
              <span aria-hidden="true" className="book-block book-block--right" />

              {/* Keyed only on narrow screens. There the turn is a cross-dissolve, and
                  remounting is what replays it; on a wide screen the turn is the leaf, and
                  remounting the spread mid-flight would tear the animation apart. */}
              <div className="book-spread" key={isSinglePage ? `s${index}` : 'spread'}>
                {/* Left well. Empty at index -1: with the book shut there is nothing on
                    this side but the table the cover is lying on. */}
                <div className="book-well book-well--left">
                  {!isSinglePage && leftWell && (
                    <LeftPage project={leftWell} index={leftWellIndex} total={total} />
                  )}
                  {isSinglePage && current && (
                    <LeftPage project={current} index={index} total={total} />
                  )}
                </div>

                {/* Right well. At index -1 this is the closed book itself — the whole box,
                    boards and spine, so there is something real to turn round. */}
                <div className="book-well book-well--right">
                  {rightWellIndex === -1 && <ClosedBook />}
                  {!isSinglePage && rightWell && (
                    <RightPage project={rightWell} index={rightWellIndex} />
                  )}
                  {isSinglePage && current && <RightPage project={current} index={index} />}
                </div>

                {/* Clicking a page turns it. Mounted after the wells so they sit above the
                    paper, and before the leaf so a sheet in flight is never clickable. */}
                <button
                  type="button"
                  aria-hidden="true"
                  tabIndex={-1}
                  disabled={!!turn || index === -1}
                  onClick={() => turnFromPage('prev')}
                  className="book-turn-zone book-turn-zone--prev"
                />
                <button
                  type="button"
                  aria-hidden="true"
                  tabIndex={-1}
                  disabled={!!turn || index === total - 1}
                  onClick={() => turnFromPage('next')}
                  className="book-turn-zone book-turn-zone--next"
                />

                {/* The gutter. A book is two pages that meet; a slide deck is two panels
                    side by side. This shadow is the difference. */}
                <span aria-hidden="true" className="book-gutter" />

                {/* The leaf. Only mounted while a turn is in flight — a permanently
                    present 3D layer over the spread costs a compositor layer for the
                    entire time the section is on screen. */}
                {turn && !isSinglePage && (
                  <div className="book-leaf" aria-hidden="true">
                                        {/* Back: what is printed on the other side of that same sheet. */}
                    <div
                      className={`book-leaf-face book-leaf-face--back ${
                        leafBackIndex === -1 ? 'book-cover-face' : ''
                      }`}
                    >
                      {leafBackIndex === -1 ? (
                        <CoverPage />
                      ) : forward ? (
                        <LeftPage
                          project={projects[leafBackIndex]}
                          index={leafBackIndex}
                          total={total}
                        />
                      ) : (
                        <RightPage project={projects[leafBackIndex]} index={leafBackIndex} />
                      )}
                      <span className="book-leaf-shade" />
                    </div>

{/* Front: the surface you were looking at. A board at the ends of the
                        book, a page everywhere else — which is the whole trick behind the
                        cover opening. It is not a special animation, it is an ordinary
                        turn whose front face happens to be bound in cloth. */}
                    <div
                      className={`book-leaf-face book-leaf-face--front ${
                        leafFrontIndex === -1 ? 'book-cover-face' : ''
                      }`}
                    >
                      {leafFrontIndex === -1 ? (
                        <CoverPage />
                      ) : forward ? (
                        <RightPage project={projects[leafFrontIndex]} index={leafFrontIndex} />
                      ) : (
                        <LeftPage
                          project={projects[leafFrontIndex]}
                          index={leafFrontIndex}
                          total={total}
                        />
                      )}
                      <span className="book-leaf-shade" />
                    </div>
                  </div>
                )}

                {/* The shadow the turning sheet drags across the page it is uncovering. */}
                {turn && !isSinglePage && (
                  <span aria-hidden="true" className="book-cast" />
                )}
              </div>
            </div>
            </div>

            <button
              type="button"
              onClick={() => go('next')}
              disabled={index === total - 1 || !!turn}
              aria-label="Next project"
              className="book-arrow book-arrow--next"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </Reveal>

        {/* Caption. Sits under the book exactly as it does in a printed plate list. */}
        <div className="mt-8 flex flex-col items-center gap-5">
          <p
            aria-live="polite"
            className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.4em] text-[var(--ink-soft)]"
          >
            {closed ? 'The Work Book' : current.name}
          </p>

          <div className="flex items-center gap-2" role="tablist" aria-label="Choose a project">
            {projects.map((project, i) => (
              <button
                key={project.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={project.name}
                disabled={!!turn}
                onClick={() => {
                  if (turn || i === index) return;
                  // Adjacent spreads get the real turn. Anything further would need the
                  // leaf to carry pages from two non-neighbouring spreads, which is not a
                  // thing paper does, so those jump.
                  if (Math.abs(i - index) === 1) go(i > index ? 'next' : 'prev');
                  else {
                    playPageTurn(i > index ? 'next' : 'prev', 1);
                    setIndex(i);
                  }
                }}
                className={`book-dot ${i === index ? 'is-current' : ''}`}
              />
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-3">
            <p className="text-center text-xs text-[var(--ink-faint)]">
              {isTouch
                ? closed
                  ? 'Tap the arrow to open it, then swipe to leaf through.'
                  : 'Swipe to turn the page, or use the arrows.'
                : closed
                  ? 'Click the cover to open it. Drag to turn it over.'
                  : 'Click a page to turn it, drag the book to look at it, or use the arrow keys.'}
            </p>

            <button
              type="button"
              onClick={toggleSound}
              aria-pressed={soundOn}
              className="book-sound"
            >
              {soundOn ? (
                <Volume2 className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
              ) : (
                <VolumeX className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden="true" />
              )}
              <span>{soundOn ? 'Sound on' : 'Sound off'}</span>
            </button>
          </div>

          <p className="text-center text-xs text-[var(--ink-faint)]">
            Six of about forty &mdash; ask for the ones under NDA.
          </p>

          <Link
            to="/contact"
            className="group/cta inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink)] transition-colors hover:text-[var(--blue)]"
          >
            <span className="link-draw">Ask about a project</span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
