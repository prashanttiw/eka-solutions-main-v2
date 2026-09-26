import React from 'react';
import { Link } from 'react-router-dom';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import Reveal from './Reveal';

/**
 * The one inverse band in the body, and the only place the page raises its voice.
 *
 * It sits at the midpoint on purpose. Everything above it is capability, everything below
 * is proof, and a long ivory page needs one moment where the surface changes or the
 * second half reads as more of the first. Making it dark also gives the chrome object
 * somewhere to actually shine — on ivory the render has no contrast to work against.
 *
 * The old version of this section asked a rhetorical question and answered it with
 * another one. This states a belief that has a cost attached, which is the only kind
 * worth printing at this size.
 */
export default function PointOfView() {
  return (
    <>
      <section
        id="point-of-view"
        className="relative overflow-hidden bg-[var(--ink-deep)] py-24 text-[#F7F6F1] shadow-quiet-lift lg:py-32"
      >
        {/* The same atmospheric grade as the hero, at a fraction of the intensity — enough
            that the two dark panels on the page read as the same material. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(58% 70% at 78% 30%, rgba(64, 101, 255, 0.16) 0%, transparent 68%), radial-gradient(46% 60% at 12% 88%, rgba(47, 66, 176, 0.14) 0%, transparent 64%)',
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-10">
          <Reveal variant="up-sm">
            <span className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.28em] text-[#F7F6F1]/55">
              <span aria-hidden="true" className="text-[rgb(var(--spark-ice))]">
                +
              </span>{' '}
              Our Point of View
            </span>
          </Reveal>

          <Reveal variant="up" delay={80} as="h2"
            className="mt-6 max-w-4xl text-hero text-4xl leading-[0.98] text-[#F7F6F1] sm:text-5xl lg:text-6xl"
          >
            Most software fails in year two,
            <br />
            <span className="text-[#F7F6F1]/45">and it is decided in month one.</span>
          </Reveal>

          <Reveal variant="up" delay={170}>
            <p className="mt-9 max-w-2xl text-lg leading-relaxed text-[#F7F6F1]/80 sm:text-xl">
              Nothing collapses because of the framework. It collapses because a boundary
              was drawn in the wrong place while everyone was busy being fast, and by the
              time that shows up the cost of moving it is a rewrite.
            </p>
          </Reveal>

          <Reveal variant="up" delay={250}>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-[#F7F6F1]/80 sm:text-xl">
              So we spend the first fortnight on decisions that will not need revisiting,
              and we say so when a project should be smaller, later, or not ours. That
              costs us work. It is still the correct trade.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Banner CTA */}
      <section className="relative overflow-hidden border-b border-t border-white/10 bg-[var(--ink)] py-14 text-[#F7F6F1]">
        <div className="mx-auto flex max-w-[1300px] flex-wrap items-center justify-between gap-6 px-6 lg:px-10">
          <Reveal variant="left" as="p" className="font-display text-2xl font-bold sm:text-3xl">
            Bring us the decision you have been putting off.
          </Reveal>
          <Reveal variant="right" delay={90}>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-[1.85rem] py-3.5 text-sm font-semibold text-[var(--ink)] shadow-quiet-card transition-all duration-200 hover:-translate-y-px hover:bg-[#F7F6F1] hover:shadow-quiet-hover"
            >
              <span>Request a Proposal</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
