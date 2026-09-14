import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import Compass from 'lucide-react/dist/esm/icons/compass';
import DraftingCompass from 'lucide-react/dist/esm/icons/drafting-compass';
import Hammer from 'lucide-react/dist/esm/icons/hammer';
import Radar from 'lucide-react/dist/esm/icons/radar';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

/**
 * How the work actually runs, stage by stage.
 *
 * This replaced a four-tier growth ladder — Spark, Ignite, Elevate, Dominate — that
 * described the client's ambition rather than our process. Aspiration tiers are
 * interchangeable between agencies and say nothing a buyer can check; a delivery process
 * with named artefacts, a duration and an exit condition on each stage is something they
 * can compare against the last firm that disappointed them, which is the comparison they
 * are actually running.
 *
 * Every stage carries a "what usually goes wrong here" line. Naming our own failure modes
 * is the most persuasive thing on the card: it is the one claim a vendor gains nothing by
 * inventing, and it is what someone who has run this process before would say.
 */

const STAGES = [
  {
    id: 'orient',
    num: '01',
    title: 'Orient',
    subtitle: 'Understand it before designing it.',
    duration: 'Week 1–2',
    summary: 'We learn the business, the constraints and what is already there.',
    detail:
      'Interviews with the people who will use it and the people who will maintain it, a read of the existing system, and the constraints that are real — regulatory, contractual, political — separated from the ones that are just habit.',
    output: 'Problem statement, constraint map, and the questions that decide the design',
    risk: 'The stated problem is rarely the real one. We keep asking past the first answer, which can feel slow in week one.',
    icon: Compass,
  },
  {
    id: 'design',
    num: '02',
    title: 'Design',
    subtitle: 'Decide on paper, where it is cheap.',
    duration: 'Week 2–4',
    summary: 'Architecture, data model and delivery plan, with the trade-offs written down.',
    detail:
      'The system design, the data model, the integration boundaries and the interface work, each with the alternatives we rejected and why. Estimates get attached here, when they are worth something rather than when they are a guess.',
    output: 'Architecture decision records, data model, delivery plan with estimates',
    risk: 'Design can expand to fill any time given to it. We time-box it and ship the first increment against an incomplete picture on purpose.',
    icon: DraftingCompass,
  },
  {
    id: 'build',
    num: '03',
    title: 'Build',
    subtitle: 'Working software every two weeks.',
    duration: 'Week 4 onward',
    summary: 'Shippable increments, reviewed in your process, against your definition of done.',
    detail:
      'Two-week increments, each ending in something deployed rather than demonstrated. You see the board, the repo and the standups. Scope changes are priced as they arrive rather than absorbed silently and paid for in quality.',
    output: 'Deployed increments, test suites, runbooks, decision records kept current',
    risk: 'Velocity dips in the third increment when the real integrations land. We plan for it rather than quietly rescheduling around it.',
    icon: Hammer,
  },
  {
    id: 'run',
    num: '04',
    title: 'Run',
    subtitle: 'Own it, or hand it over cleanly.',
    duration: 'Ongoing or exit',
    summary: 'Operate against an SLA, or transfer everything to your team and step back.',
    detail:
      'Monitoring, on-call, patching and cost management under a written SLA — or a handover, with pairing, documentation review and a period where your engineers lead and we answer questions. Both are normal endings here.',
    output: 'SLA reporting and quarterly architecture review, or a completed handover',
    risk: 'Handovers fail when they are one document at the end. Ours are a fortnight of your team driving while we watch.',
    icon: Radar,
  },
];

const TIMELINE = [
  { when: 'Day 0', what: 'First call', sub: 'Fit, scope, budget range' },
  { when: 'Week 1', what: 'Orient', sub: 'Constraints and problem' },
  { when: 'Week 2', what: 'Design', sub: 'Architecture and plan' },
  { when: 'Week 4', what: 'Build', sub: 'First increment deployed' },
  { when: 'Week 12+', what: 'Run', sub: 'Operate or hand over' },
];

export default function Playbook() {
  const [flipped, setFlipped] = useState({});

  const toggleFlip = (id) => setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <section
      id="playbook"
      className="relative overflow-hidden border-t border-[var(--border-hairline)]"
    >
      <div className="section-dark relative overflow-hidden py-24 lg:py-32">
        <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-10">
          <SectionHeading
            eyebrow="The Playbook"
            title={
              <>
                Four stages, and
                <br />
                <span className="text-[var(--blue)]">what goes wrong in each.</span>
              </>
            }
            lead="The same process on a two-week audit and a two-year platform — the stages compress, they do not get skipped. Turn a card over for what the stage produces and where it usually strains."
            className="max-w-3xl"
          />

          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {STAGES.map((stage, index) => {
              const Icon = stage.icon;
              const isFlipped = !!flipped[stage.id];

              return (
                <Reveal
                  key={stage.id}
                  variant="scale"
                  delay={index * 110}
                  className="relative min-h-[420px] [perspective:1400px] lg:min-h-[400px]"
                >
                  <div
                    className={`relative h-full w-full rounded-[2rem] transition-transform duration-700 [transform-style:preserve-3d] ${
                      isFlipped ? 'rotate-y-180' : ''
                    }`}
                  >
                    {/* FRONT */}
                    <article className="card-elevated absolute inset-0 flex flex-col overflow-hidden rounded-[2rem] p-8 [backface-visibility:hidden] lg:p-10">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.28em] text-[var(--ink-faint)]">
                          Stage {stage.num} · {stage.duration}
                        </span>
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--ink)] text-[#F7F6F1]">
                          <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                        </span>
                      </div>

                      <h3 className="mt-8 text-hero text-5xl leading-none text-[var(--ink)] lg:text-6xl">
                        {stage.title}
                      </h3>
                      <p className="mt-4 font-display text-lg leading-snug text-[var(--blue)]">
                        {stage.subtitle}
                      </p>
                      <p className="mt-4 text-sm leading-relaxed text-[var(--ink-soft)]">
                        {stage.summary}
                      </p>

                      <button
                        type="button"
                        onClick={() => toggleFlip(stage.id)}
                        aria-pressed={isFlipped}
                        className="mt-auto inline-flex items-center gap-2 self-start pt-8 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink)] transition-colors hover:text-[var(--blue)]"
                      >
                        <span className="link-draw">Inside this stage</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </article>

                    {/* BACK */}
                    <article className="absolute inset-0 flex flex-col overflow-hidden rounded-[2rem] border border-white/[0.10] bg-[var(--ink-deep)] p-8 [backface-visibility:hidden] [transform:rotateY(180deg)] lg:p-10">
                      <div
                        aria-hidden="true"
                        className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-[var(--blue-bright)]/20 blur-3xl"
                      />

                      <div className="relative flex items-center justify-between">
                        <span className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.28em] text-[#F7F6F1]/55">
                          Inside {stage.title}
                        </span>
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F7F6F1] text-[var(--ink)]">
                          <Icon className="h-5 w-5" strokeWidth={1.5} aria-hidden="true" />
                        </span>
                      </div>

                      <p className="relative mt-6 text-sm leading-relaxed text-[#F7F6F1]/85">
                        {stage.detail}
                      </p>

                      <div className="relative mt-6">
                        <span className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.22em] text-[rgb(var(--spark-ice))]">
                          You end up with
                        </span>
                        <p className="mt-1.5 text-sm leading-relaxed text-[#F7F6F1]">
                          {stage.output}
                        </p>
                      </div>

                      <div className="relative mt-5 border-t border-white/[0.12] pt-5">
                        <span className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.22em] text-[#F7F6F1]/60">
                          Where it strains
                        </span>
                        <p className="mt-1.5 text-[var(--fs-sm)] leading-relaxed text-[#F7F6F1]/70">
                          {stage.risk}
                        </p>
                      </div>

                      <div className="relative mt-auto flex items-center gap-4 pt-6">
                        <Link
                          to="/contact"
                          className="inline-flex items-center gap-2 rounded-full bg-[#F7F6F1] px-4 py-2 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-white"
                        >
                          <span>Start here</span>
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleFlip(stage.id)}
                          className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-[#F7F6F1]/60 transition-colors hover:text-[#F7F6F1]"
                        >
                          &larr; Back
                        </button>
                      </div>
                    </article>
                  </div>
                </Reveal>
              );
            })}
          </div>

          {/* The same four stages against a calendar, because "how long until we see
              something" is the question the cards do not answer directly. */}
          <div className="mt-16">
            <Reveal variant="up-sm">
              <div className="mb-5 flex items-center gap-4">
                <span className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.28em] text-[var(--ink-faint)]">
                  <span aria-hidden="true" className="text-[var(--blue)]">+</span> A typical
                  first quarter
                </span>
                <span aria-hidden="true" className="h-px flex-1 bg-[var(--border-hairline)]" />
              </div>
            </Reveal>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
              {TIMELINE.map((step, index) => (
                <Reveal
                  key={step.when}
                  variant="up-sm"
                  delay={index * 80}
                  className="group relative overflow-hidden rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-5 py-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-[var(--border-hairline-hover)] hover:shadow-quiet-chip"
                >
                  <span className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.2em] text-[var(--blue)]">
                    {step.when}
                  </span>
                  <span className="mt-1.5 block font-display text-base text-[var(--ink)]">
                    {step.what}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-[var(--ink-faint)]">
                    {step.sub}
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--blue)] transition-all duration-500 group-hover:w-full"
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
