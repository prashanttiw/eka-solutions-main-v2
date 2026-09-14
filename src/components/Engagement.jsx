import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import Check from 'lucide-react/dist/esm/icons/check';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { useContent } from '../lib/content';

/**
 * How to actually buy from us.
 *
 * This is the section most engineering sites leave out, and its absence is the reason a
 * warm visitor stalls: they have decided you are competent and have no idea what the next
 * step costs, how long it lasts, or what they are committing to. Four shapes, each with a
 * duration, a pricing model and a start date, answers that without publishing a rate card.
 *
 * Built as a tab set rather than four columns because the detail that matters — what is
 * in it, who it suits, what it is not — is too long to compare side by side at any width
 * that keeps it readable. On narrow screens the tabs become a scrollable row rather than
 * collapsing into an accordion, so the comparison is still one gesture away.
 */

const MODELS = [
  {
    id: 'sprint-zero',
    name: 'Discovery & planning',
    tagline: 'Find the right starting point.',
    duration: 'Short engagement',
    pricing: 'Scoped proposal',
    start: 'Agreed together',
    summary:
      'For an idea that needs definition or a system that needs a fresh look. Explore the problem, review the options, and leave with a practical plan.',
    includes: [
      'Goals, constraints, and priorities',
      'User journeys and technical options',
      'Risks and open questions',
      'Recommended scope and next steps',
    ],
    notFor:
      'A fully defined task that is ready to build; a focused implementation may be a better fit.',
  },
  {
    id: 'squad',
    name: 'Team collaboration',
    tagline: 'Add focused help to your existing team.',
    duration: 'Ongoing collaboration',
    pricing: 'Scope and capacity based',
    start: 'Subject to availability',
    summary:
      'For teams that need support on a product, a specialist problem, or a larger roadmap. Agree on responsibilities and a working rhythm that fits your team.',
    includes: [
      'A defined area of responsibility',
      'Shared planning and review',
      'Work within agreed tools and processes',
      'Regular progress and priority discussions',
    ],
    notFor:
      'A standalone deliverable that is easier to agree and review as a fixed project.',
  },
  {
    id: 'build',
    name: 'Project delivery',
    tagline: 'Take a defined idea through to launch.',
    duration: 'Milestone based',
    pricing: 'Project proposal',
    start: 'After scope agreement',
    summary:
      'For a website, application, or business tool with a clear goal. Define the deliverables, review the work at agreed milestones, and prepare the product for release.',
    includes: [
      'Scope and acceptance criteria',
      'Design and development milestones',
      'Testing and release preparation',
      'Documentation and handover',
    ],
    notFor:
      'An idea still changing fundamentally; discovery can help establish the right first version.',
  },
  {
    id: 'run',
    name: 'Ongoing improvement',
    tagline: 'Keep your software useful as your business changes.',
    duration: 'Agreed review cycle',
    pricing: 'Support proposal',
    start: 'After a system review',
    summary:
      'For an existing product that needs attention after launch. Prioritize maintenance, improvements, and performance work around the needs of your business.',
    includes: [
      'A review of the existing system',
      'A prioritized improvement plan',
      'Agreed maintenance responsibilities',
      'Defined support hours and escalation',
    ],
    notFor:
      'Unspecified round-the-clock coverage; support scope and response expectations must be agreed first.',
  },
];

const mapModel = (entry) => {
  const fallback = MODELS.find((model) => model.id === entry.id) || MODELS[0];
  return {
    ...fallback,
    ...entry,
    pricing: entry.price || fallback.pricing,
    summary: entry.description || fallback.summary,
    includes: Array.isArray(entry.includes) && entry.includes.length > 0
      ? entry.includes
      : fallback.includes,
  };
};

export default function Engagement() {
  const models = useContent('engagement-models', MODELS, mapModel);
  const [activeId, setActiveId] = useState(MODELS[0].id);
  const active = models.find((model) => model.id === activeId) ?? models[0];
  const tabRefs = useRef([]);

  /**
   * Arrow-key movement between the tabs.
   *
   * Announcing `role="tablist"` promises a screen-reader user that the arrow keys move
   * between tabs and that Tab leaves the group — a promise the roles alone do not keep.
   * With the roving tabindex below (only the selected tab is tabbable), a keyboard user
   * gets one stop for the whole group and then arrows through it, rather than four stops
   * they have to page past to reach the panel.
   */
  const handleKeyDown = (event) => {
    const index = models.findIndex((model) => model.id === activeId);
    const last = models.length - 1;
    let next = null;

    if (event.key === 'ArrowRight' || event.key === 'ArrowDown')
      next = index === last ? 0 : index + 1;
    else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp')
      next = index === 0 ? last : index - 1;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = last;
    if (next === null) return;

    event.preventDefault();
    setActiveId(models[next].id);
    tabRefs.current[next]?.focus();
  };

  return (
    <section
      id="engagement"
      className="section-dark relative overflow-hidden border-t border-[var(--border-hairline)] py-24 lg:py-32"
    >
      <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-10">
        <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_1fr]">
          <SectionHeading
            eyebrow="Ways to work together"
            title={
              <>
                The right support.
                <br />
                <span className="text-[var(--blue)]">For your stage.</span>
              </>
            }
            size="md"
          />
          <Reveal variant="up" delay={140}>
            <p className="max-w-md text-base leading-relaxed text-[var(--ink-soft)] lg:justify-self-end">
              Start with the shape of support you need. We agree on scope,
              timing, fees, and handover before the engagement begins.
            </p>
          </Reveal>
        </div>

        {/* `min-w-0` on both children is load-bearing. A grid item defaults to
            `min-width: auto`, which means it refuses to shrink below its content's
            intrinsic width — and the tab strip's four nowrap buttons are about 800px of
            intrinsic width. Without this the single-column mobile grid is 800px wide
            inside a 375px viewport, and `overflow-x: clip` on the page root hides the
            damage by cutting the panel off rather than by letting it scroll. */}
        <div className="mt-14 grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-10">
          {/* Selector. A horizontal scroller under lg — a vertical stack of four tall
              buttons on a phone pushes the panel below the fold before it is read. */}
          <Reveal variant="left" className="min-w-0">
            <div
              role="tablist"
              aria-label="Engagement models"
              onKeyDown={handleKeyDown}
              className="-mx-6 flex gap-2 overflow-x-auto px-6 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0"
            >
              {models.map((model, index) => {
                const isActive = model.id === active.id;
                return (
                  <button
                    key={model.id}
                    ref={(node) => {
                      tabRefs.current[index] = node;
                    }}
                    type="button"
                    role="tab"
                    id={`engagement-tab-${model.id}`}
                    aria-selected={isActive}
                    aria-controls={`engagement-panel-${model.id}`}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => setActiveId(model.id)}
                    className={`group shrink-0 rounded-2xl border px-5 py-4 text-left transition-all duration-300 lg:w-full ${
                      isActive
                        ? 'border-transparent bg-[var(--ink)] text-[#F7F6F1] shadow-quiet-card'
                        : 'border-[var(--border-hairline)] bg-[var(--bg-raised)] text-[var(--ink)] hover:border-[var(--border-hairline-hover)] hover:shadow-quiet-chip'
                    }`}
                  >
                    <span
                      className={`block font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.22em] ${
                        isActive
                          ? 'text-[#F7F6F1]/60'
                          : 'text-[var(--ink-faint)]'
                      }`}
                    >
                      {model.duration}
                    </span>
                    <span className="mt-1.5 block whitespace-nowrap font-display text-lg leading-tight lg:whitespace-normal">
                      {model.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal variant="right" delay={90} className="min-w-0">
            <div
              role="tabpanel"
              id={`engagement-panel-${active.id}`}
              aria-labelledby={`engagement-tab-${active.id}`}
              tabIndex={0}
              /* Keyed so React remounts on change — that is what re-runs the entry
                 animation, rather than swapping text inside a static box. */
              key={active.id}
              className="card-elevated animate-fade-in relative overflow-hidden p-8 lg:p-10"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--blue)]/[0.07] blur-3xl"
              />

              <div className="relative">
                <h3 className="text-hero text-3xl leading-none text-[var(--ink)] lg:text-4xl">
                  {active.name}
                </h3>
                <p className="mt-3 font-display text-lg leading-snug text-[var(--blue)]">
                  {active.tagline}
                </p>
                <p className="mt-5 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)]">
                  {active.summary}
                </p>

                <dl className="mt-8 grid gap-3 sm:grid-cols-3">
                  {[
                    ['Duration', active.duration],
                    ['Pricing', active.pricing],
                    ['Starting point', active.start],
                  ].map(([term, value]) => (
                    <div
                      key={term}
                      className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-sunken)] px-4 py-3.5"
                    >
                      <dt className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.2em] text-[var(--ink-faint)]">
                        {term}
                      </dt>
                      <dd className="mt-1.5 text-sm font-semibold text-[var(--ink)]">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {active.includes.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--blue)]/12 text-[var(--blue)]">
                        <Check
                          className="h-3 w-3 stroke-[3]"
                          aria-hidden="true"
                        />
                      </span>
                      <span className="text-sm leading-relaxed text-[var(--ink-soft)]">
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* Saying who it is wrong for is the single most persuasive line in the
                    section — it is the one claim a vendor has no incentive to make up. */}
                <div className="mt-8 border-t border-dashed border-[var(--divider-dashed)] pt-6">
                  <span className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.24em] text-[var(--ink-faint)]">
                    Not the right fit for
                  </span>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-soft)]">
                    {active.notFor}
                  </p>
                </div>

                <Link to="/contact" className="btn-ink mt-8">
                  <span>Discuss this approach</span>
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
