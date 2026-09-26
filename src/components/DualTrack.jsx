import React from 'react';
import { Link } from 'react-router-dom';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import Handshake from 'lucide-react/dist/esm/icons/handshake';
import Package from 'lucide-react/dist/esm/icons/package';
import Reveal from './Reveal';
import TiltCard from './TiltCard';
import SectionHeading from './SectionHeading';

/**
 * The positioning section — the one that answers the question a visitor actually arrives
 * with, which is "what kind of company is this?"
 *
 * A firm that does both consulting and products usually reads as a firm that has not
 * decided, so the argument here is made explicitly rather than left implied: the two
 * tracks are the same engineering sold twice, and each one is the other's quality gate.
 * That claim is the differentiator; burying it under a services grid would waste it.
 *
 * Two cards, deliberately equal in weight. Making one visually dominant would answer the
 * question the section exists to leave open — which track a given visitor belongs in.
 */

const TRACKS = [
  {
    id: 'services',
    kicker: 'Track 01',
    Icon: Handshake,
    label: 'Build with us',
    title: 'Services',
    pitch:
      'We become the engineering team you would have spent nine months hiring — architects, product engineers and SREs who have already shipped this shape of system.',
    forWho: 'Teams carrying a roadmap bigger than their bench.',
    points: [
      'Embedded squads inside your sprints and your repo',
      'Fixed-scope product builds, delivered end to end',
      'Architecture resets and security audits on retainer',
    ],
    cta: { label: 'See the practices', href: '#services' },
  },
  {
    id: 'products',
    kicker: 'Track 02',
    Icon: Package,
    label: 'Build on us',
    title: 'Products',
    pitch:
      'The parts of every build that were the same every time, extracted into products we run ourselves — so you adopt a system that is already in production instead of commissioning one.',
    forWho: 'Teams who would rather buy the plumbing than rebuild it.',
    points: [
      'Licensed platform cores, deployed into your cloud',
      'Managed hosting with an SLA, or self-hosted with the source',
      'Same engineers on support as on the roadmap',
    ],
    cta: { label: 'See the products', href: '#products' },
  },
];

export default function DualTrack() {
  return (
    <section
      id="model"
      className="section-dark relative overflow-hidden border-t border-[var(--border-hairline)] py-24 lg:py-32"
    >
      <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-10">
        <div className="grid items-end gap-10 lg:grid-cols-[1.15fr_1fr]">
          <SectionHeading
            eyebrow="The Model"
            title={
              <>
                One engineering team,
                <br />
                <span className="text-[var(--blue)]">sold two ways.</span>
              </>
            }
          />
          <Reveal variant="up" delay={140}>
            <p className="max-w-md text-base leading-relaxed text-[var(--ink-soft)] lg:justify-self-end">
              Every product we license started as a client problem. Every client system is
              held to the standard of something we have to operate ourselves. Neither track
              gets to be the side project — that is what keeps both of them honest.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          {TRACKS.map((track, index) => (
            <Reveal key={track.id} variant="scale" delay={index * 130}>
              <TiltCard className="h-full" innerClassName="rounded-[1.75rem]" max={5}>
                <article className="card-elevated relative flex h-full flex-col p-8 [transform-style:preserve-3d] lg:p-10">
                  {/* The wash is clipped by its own layer rather than by the article.
                      `overflow: hidden` on an element inside a 3D context flattens that
                      context — which would silently cancel every `translateZ` below and
                      leave the tilt as a flat skew with no depth in it. */}
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 overflow-hidden rounded-[1.75rem]"
                  >
                    {/* The corner wash. Gives the card face something for the specular to
                        travel across, so the tilt has a surface rather than a flat fill. */}
                    <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--blue)]/[0.07] blur-3xl" />
                  </div>

                  <div className="tilt-z relative flex items-center justify-between" style={{ '--tz': '34px' }}>
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.28em] text-[var(--ink-faint)]">
                      {track.kicker}
                    </span>
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--ink)] text-[#F7F6F1]">
                      <track.Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                  </div>

                  <div className="tilt-z relative mt-8" style={{ '--tz': '22px' }}>
                    <span className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-[var(--blue)]">
                      {track.label}
                    </span>
                    <h3 className="mt-3 text-hero text-5xl leading-none text-[var(--ink)] lg:text-6xl">
                      {track.title}
                    </h3>
                    <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--ink-soft)]">
                      {track.pitch}
                    </p>
                  </div>

                  <div className="relative mt-8 border-t border-dashed border-[var(--divider-dashed)] pt-6">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--ink-faint)]">
                      Who it is for
                    </span>
                    <p className="mt-2 font-display text-lg leading-snug text-[var(--ink)]">
                      {track.forWho}
                    </p>

                    <ul className="mt-6 space-y-3">
                      {track.points.map((point) => (
                        <li
                          key={point}
                          className="flex items-start gap-3 text-sm leading-relaxed text-[var(--ink-soft)]"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--blue)]"
                          />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <a
                    href={track.cta.href}
                    className="group/cta relative mt-auto inline-flex items-center gap-2 pt-8 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink)] transition-colors hover:text-[var(--blue)]"
                  >
                    <span className="link-draw">{track.cta.label}</span>
                    <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5" />
                  </a>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        {/* The join. Says out loud what the two cards only imply, because the compounding
            between the tracks is the actual pitch and it deserves one flat sentence. */}
        <Reveal variant="up" delay={200} className="mt-6">
          <div className="flex flex-col items-start gap-5 rounded-3xl bg-[var(--ink)] px-7 py-6 text-[#F7F6F1] sm:flex-row sm:items-center sm:justify-between sm:px-10">
            <p className="max-w-2xl text-base leading-relaxed sm:text-lg">
              Not sure which track you are in? Most engagements start in one and end up
              using both — a build that adopts one of our cores, or a licence that needs a
              squad around it for a quarter.
            </p>
            <Link
              to="/contact"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#F7F6F1] px-6 py-3 text-sm font-semibold text-[var(--ink)] transition-all duration-200 hover:-translate-y-px hover:bg-white"
            >
              <span>Talk it through</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
