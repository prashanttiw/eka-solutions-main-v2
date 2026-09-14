import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import Boxes from 'lucide-react/dist/esm/icons/boxes';
import BrainCircuit from 'lucide-react/dist/esm/icons/brain-circuit';
import Cloud from 'lucide-react/dist/esm/icons/cloud';
import PenTool from 'lucide-react/dist/esm/icons/pen-tool';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { WhatsAppGlyph } from './WhatsAppFloat';
import { whatsappHref } from '../lib/whatsapp';
import { useContent } from '../lib/content';

/**
 * Track 01 in detail: the four service practices.
 *
 * The cards keep the flip they always had — it is the one interaction on the page that
 * lets a capability list stay available without a capability list being the first thing
 * anyone reads. What changed is which side each thing sits on. The face now carries the
 * outcome and the shape of a typical engagement, because "what do I get and what does it
 * look like" is the question; the technology list, which is the answer to a question
 * nobody asked first, moved to the back.
 *
 * The flip is driven by an explicit button rather than by hover: a card that flips when
 * the pointer crosses it hides its own content from anyone reading with a mouse in hand,
 * and cannot be operated from a keyboard at all.
 */

const PRACTICES = [
  {
    id: 'product',
    Icon: Boxes,
    title: 'Product & Platform Engineering',
    outcome: 'The product itself — and the platform it has to keep running on.',
    engagement: 'Typically a squad or a fixed-scope build, 8–24 weeks',
    blurb:
      'Multi-tenant systems, real-time surfaces and the boring load-bearing parts nobody demos: migrations, backfills, feature flags and the release path.',
    deliverables: [
      'Multi-tenant SaaS architecture with tenant isolation',
      'React 19 and Next.js front ends held to a performance budget',
      'Real-time transport — WebSocket, SSE, CRDT sync',
      'Edge routing and caching with a p95 latency target',
      'Billing, entitlements and metering wired to Stripe',
      'Migration paths off the system you are trying to leave',
    ],
  },
  {
    id: 'ai',
    Icon: BrainCircuit,
    title: 'AI & Autonomous Systems',
    outcome: 'AI features that survive contact with real users and a real budget.',
    engagement: 'Usually starts with a two-week Sprint Zero',
    blurb:
      'The demo is the easy part. We build the evaluation, the guardrails, the fallbacks and the cost controls that decide whether it can be switched on for everyone.',
    deliverables: [
      'Retrieval pipelines over your own data, with citations',
      'Agent workflows with typed tools, retries and replay',
      'Evaluation suites gating every prompt and model change',
      'Guardrails, fallbacks and human review paths',
      'Fine-tuning and distillation where it beats prompting on cost',
      'Per-tenant spend ceilings and full call-level tracing',
    ],
  },
  {
    id: 'cloud',
    Icon: Cloud,
    title: 'Cloud, DevOps & Reliability',
    outcome: 'Infrastructure your team can change on a Friday without flinching.',
    engagement: 'Audit and reset, then a managed run if you want it',
    blurb:
      'Environments defined in code, pipelines that catch things before customers do, and an on-call rotation that is not one person with a phone under their pillow.',
    deliverables: [
      'Kubernetes or serverless, chosen against your team, not our habits',
      'Terraform infrastructure as code across every environment',
      'CI/CD with progressive delivery and automated rollback',
      'Zero-trust access, secret management and SOC 2 evidence',
      'OpenTelemetry instrumentation, SLOs and burn-rate alerting',
      'Cost engineering — most estates we review shrink by a fifth',
    ],
  },
  {
    id: 'design',
    Icon: PenTool,
    title: 'Product Design & Interface',
    outcome: 'Interfaces designed by people who then have to build them.',
    engagement: 'Runs alongside the build, never ahead of it in a silo',
    blurb:
      'Design and engineering in one team, so the handoff is a branch rather than a PDF and nothing gets specified that cannot be built at the frame rate it was drawn at.',
    deliverables: [
      'Product and interaction design, from flows to final screens',
      'Design systems shipped as typed, tested components',
      'Motion and 3D interface work — WebGL, Canvas, GPU-aware',
      'WCAG 2.2 AA accessibility built in, then verified',
      'Prototypes real enough to test with actual users',
      'Brand expression that holds up inside a product, not just a deck',
    ],
  },
];

const PRACTICE_ICONS = { Boxes, BrainCircuit, Cloud, PenTool };
const mapPractice = (entry) => ({
  ...entry,
  Icon: PRACTICE_ICONS[entry.Icon] || Boxes,
  deliverables: Array.isArray(entry.deliverables) ? entry.deliverables : [],
});

export default function ServicesGrid() {
  const [flipped, setFlipped] = useState({});
  const practices = useContent('services', PRACTICES, mapPractice);

  const toggleFlip = (id) => setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <section
      id="services"
      className="section-dark relative overflow-hidden border-t border-[var(--border-hairline)] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
        <div className="mb-14 grid items-end gap-10 lg:grid-cols-[1.1fr_1fr]">
          <SectionHeading
            eyebrow="Track 01 · Services"
            title={
              <>
                Four practices.
                <br />
                <span className="text-[var(--blue)]">One team behind them.</span>
              </>
            }
          />
          <Reveal variant="up" delay={140}>
            <p className="max-w-md text-base leading-relaxed text-[var(--ink-soft)] lg:justify-self-end">
              Most engagements use two or three of these at once, which is the point of
              having them under one roof — nobody has to be the integration layer between
              three vendors. Turn a card over for the detail.
            </p>
          </Reveal>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {practices.map((practice, index) => {
            const isFlipped = !!flipped[practice.id];

            return (
              <Reveal
                key={practice.id}
                variant="scale"
                delay={index * 110}
                className="group relative min-h-[440px] [perspective:1400px] sm:min-h-[420px]"
              >
                <div
                  className={`relative h-full w-full rounded-[2rem] transition-transform duration-700 [transform-style:preserve-3d] ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}
                >
                  {/* FRONT */}
                  <div className="card-elevated absolute inset-0 flex flex-col overflow-hidden rounded-[2rem] p-8 [backface-visibility:hidden] lg:p-10">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[var(--blue)]/[0.07] opacity-70 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                    />

                    <div className="relative flex items-start justify-between gap-4">
                      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-[var(--ink)] text-[#F7F6F1] transition-transform duration-400 group-hover:-translate-y-1">
                        <practice.Icon className="h-7 w-7" strokeWidth={1.4} aria-hidden="true" />
                      </span>
                      <span className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.24em] text-[var(--ink-faint)]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <h3 className="relative mt-8 font-display text-2xl leading-tight text-[var(--ink)]">
                      {practice.title}
                    </h3>

                    <p className="relative mt-4 text-base font-medium leading-snug text-[var(--blue)]">
                      {practice.outcome}
                    </p>

                    <p className="relative mt-4 text-sm leading-relaxed text-[var(--ink-soft)]">
                      {practice.blurb}
                    </p>

                    <div className="relative mt-auto pt-8">
                      <p className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.2em] text-[var(--ink-faint)]">
                        {practice.engagement}
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleFlip(practice.id)}
                        aria-pressed={isFlipped}
                        className="mt-4 inline-flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.24em] text-[var(--ink)] transition-colors hover:text-[var(--blue)]"
                      >
                        <span className="link-draw">What&rsquo;s inside</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* BACK */}
                  <div className="absolute inset-0 flex flex-col overflow-hidden rounded-[2rem] border border-white/[0.10] bg-[var(--ink-deep)] p-8 [backface-visibility:hidden] [transform:rotateY(180deg)] lg:p-10">
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-[var(--blue-bright)]/20 blur-3xl"
                    />

                    <div className="relative font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.28em] text-[#F7F6F1]/55">
                      What we deliver
                    </div>
                    <h3 className="relative mt-3 font-display text-xl leading-tight text-[#F7F6F1]">
                      {practice.title}
                    </h3>

                    <ul className="relative mt-6 flex-1 space-y-3">
                      {practice.deliverables.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-3 text-[var(--fs-sm)] leading-relaxed text-[#F7F6F1]/85"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-[0.42rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[rgb(var(--spark-ice))]"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="relative mt-6 flex items-center gap-4">
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 rounded-full bg-[#F7F6F1] px-4 py-2 text-xs font-semibold text-[var(--ink)] transition-colors hover:bg-white"
                      >
                        <span>Scope this</span>
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => toggleFlip(practice.id)}
                        className="font-mono text-xs font-semibold uppercase tracking-[0.24em] text-[#F7F6F1]/60 transition-colors hover:text-[#F7F6F1]"
                      >
                        &larr; Back
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal variant="up" delay={140} className="mt-14">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <p className="w-full text-center text-sm text-[var(--ink-faint)] sm:w-auto">
              Not sure which of these you actually need? Neither are most people on the
              first call.
            </p>
            <a
              href={whatsappHref('Hi EKA Solution, which practice fits what I want to build?')}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-raised)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-quiet-chip transition-all hover:-translate-y-px hover:bg-[var(--ink)] hover:text-[#F7F6F1]"
            >
              <WhatsAppGlyph className="h-4 w-4" />
              <span>Ask us on WhatsApp</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
