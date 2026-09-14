import React from 'react';
import Reveal from './Reveal';
import CountUp from './CountUp';
import ChromeObject from './ChromeObject';
import SectionHeading from './SectionHeading';

/**
 * The first thing after the hero, and the section that has to earn the scroll.
 *
 * The hero makes a claim. This one has to make it credible before the visitor decides the
 * site is another agency page, so it leads with a position rather than a description —
 * "built to still be right in three years" is falsifiable and specific, where "we build
 * beautiful software" is neither — and puts the numbers immediately next to it.
 *
 * The figures count up rather than sitting still because a static number is scenery; a
 * number that moves when you arrive is the one thing on the page that acknowledges the
 * visitor is there.
 */

const PROOF = [
  { to: 150, suffix: '+', label: 'Systems in production', note: 'Across SaaS, fintech, health and logistics' },
  { to: 45, suffix: '+', label: 'Senior engineers', note: 'No juniors billed to client work' },
  { to: 80, prefix: '$', suffix: 'M+', label: 'Client ARR supported', note: 'Revenue running on systems we built' },
  { to: 99.98, decimals: 2, suffix: '%', label: 'Fleet uptime, 12mo', note: 'Measured, not aspirational' },
];

const PRINCIPLES = [
  {
    title: 'Architecture before velocity',
    body: 'Speed you buy by skipping the design is a loan. We price the interest in before you take it.',
  },
  {
    title: 'One team, not a hand-off chain',
    body: 'The engineers in the kickoff are the engineers in the repo. Nothing is quoted by one group and built by another.',
  },
  {
    title: 'You own everything',
    body: 'Source, infrastructure, pipelines and decisions. No proprietary runtime you have to keep paying us to operate.',
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="section-dark relative overflow-hidden py-24 lg:py-32"
    >
      <ChromeObject
        variant="cluster"
        className="-right-24 top-8 hidden w-[340px] lg:block xl:-right-10 xl:w-[400px]"
        speed={-120}
        rotate={-8}
        tint={0.46}
        opacity={0.9}
        floatDuration={18}
        floatY={-26}
        rotateTo={6}
        bloom={0.18}
      />

      <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-10">
        <div className="grid items-start gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
          <div>
            <SectionHeading
              eyebrow="About EKA"
              title={
                <>
                  Built to still be
                  <br />
                  <span className="text-[var(--blue)]">right in three years.</span>
                </>
              }
              lead="Most software is written for the demo. We write it for the second year — when traffic is real, the team has doubled, and the decisions made in week three are either holding the product up or holding it back."
            />

            <Reveal variant="up" delay={220} className="mt-8 max-w-xl">
              <p className="text-base leading-relaxed text-[var(--ink-soft)]">
                EKA Solution is a software engineering company. We build our own products, and
                we build other people&rsquo;s — with the same engineers, the same review bar
                and the same operational standard on both. That is the whole model, and it is
                the reason a client system is designed as though we will be the ones woken up
                at 3am by it.
              </p>
            </Reveal>

            <ul className="mt-10 space-y-5">
              {PRINCIPLES.map((principle, index) => (
                <Reveal
                  as="li"
                  key={principle.title}
                  variant="left"
                  delay={280 + index * 90}
                  className="flex gap-4"
                >
                  <span
                    aria-hidden="true"
                    className="mt-2 h-px w-8 shrink-0 bg-[var(--blue)]/60"
                  />
                  <span>
                    <span className="block font-display text-base font-bold text-[var(--ink)]">
                      {principle.title}
                    </span>
                    <span className="mt-1 block max-w-md text-sm leading-relaxed text-[var(--ink-soft)]">
                      {principle.body}
                    </span>
                  </span>
                </Reveal>
              ))}
            </ul>
          </div>

          {/* Proof panel. Deliberately a single slab rather than four loose cards — the
              figures argue together, and splitting them apart invites the eye to read
              only the biggest one. */}
          <Reveal variant="scale" delay={120}>
            <div className="card-elevated relative overflow-hidden p-2">
              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[1.45rem] bg-[var(--border-hairline)] sm:grid-cols-2">
                {PROOF.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="group relative bg-[var(--bg-raised)] p-6 transition-colors duration-300 hover:bg-[#FBFBFE] lg:p-7"
                  >
                    <span
                      aria-hidden="true"
                      className="font-mono text-[var(--fs-2xs)] font-semibold tracking-[0.28em] text-[var(--ink-faint)]"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    <div className="mt-4 text-hero text-4xl leading-none text-[var(--ink)] lg:text-5xl">
                      <CountUp
                        to={stat.to}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                        decimals={stat.decimals}
                        duration={1600 + index * 140}
                      />
                    </div>

                    <div className="mt-4 text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.16em] text-[var(--ink)]">
                      {stat.label}
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-[var(--ink-faint)]">
                      {stat.note}
                    </p>

                    <span
                      aria-hidden="true"
                      className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--blue)] transition-all duration-500 group-hover:w-full"
                    />
                  </div>
                ))}
              </div>

              <p className="px-6 py-5 text-xs leading-relaxed text-[var(--ink-faint)]">
                Figures cover the trailing twelve months to June 2026 and are restated each
                quarter. We will walk any of them through with you on a call.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
