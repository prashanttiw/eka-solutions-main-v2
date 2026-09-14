import React from 'react';
import ShieldCheck from 'lucide-react/dist/esm/icons/shield-check';
import Reveal from './Reveal';
import ChromeObject from './ChromeObject';
import SectionHeading from './SectionHeading';

/**
 * The depth section — what a technical buyer scrolls looking for and rarely finds.
 *
 * Two halves, in a deliberate order. The standards come first because they are the part
 * that is actually hard to copy: any agency can list the same frameworks, and almost none
 * of them will commit in writing to a merge gate. The stack comes second, as a ticker,
 * because a logo wall is reference material rather than argument and should not be given
 * the weight of a headline.
 *
 * Each standard is written as a rule with a consequence attached. "We care about quality"
 * is not a standard; "no merge below 80% on changed lines, enforced by the pipeline" is
 * something a client can hold us to.
 */

const STANDARDS = [
  {
    num: '01',
    rule: 'Nothing reaches production without a review and a test',
    detail:
      'Coverage gates on changed lines, enforced by the pipeline rather than by good intentions. A red build cannot be merged by anyone, including us.',
  },
  {
    num: '02',
    rule: 'Every environment is defined in code',
    detail:
      'Terraform for infrastructure, containers for runtime. No console-clicked resources, so staging genuinely resembles production and a rebuild is an afternoon.',
  },
  {
    num: '03',
    rule: 'Performance budgets are acceptance criteria',
    detail:
      'p95 latency and bundle weight are written into the ticket alongside the behaviour. A feature that ships and slows the product down has not shipped.',
  },
  {
    num: '04',
    rule: 'No standing human access to production data',
    detail:
      'Access is brokered, time-boxed and logged. Least privilege by default — which is also most of what a SOC 2 auditor will ask you to demonstrate.',
  },
  {
    num: '05',
    rule: 'Decisions are written down where the code is',
    detail:
      'Architecture decision records in the repo, with the alternatives and the trade-off. Six months later the reason is still there, whoever is reading it.',
  },
  {
    num: '06',
    rule: 'You can end the engagement on a Friday',
    detail:
      'Documentation, runbooks and credentials stay current as a working practice. A handover is a normal week for us, not a project of its own.',
  },
];

const STACK_ROWS = [
  [
    'TypeScript', 'React 19', 'Next.js', 'Node', 'Go', 'Rust', 'Python',
    'PostgreSQL', 'Redis', 'ClickHouse', 'Kafka', 'GraphQL', 'tRPC', 'WebGL',
  ],
  [
    'AWS', 'GCP', 'Cloudflare', 'Kubernetes', 'Terraform', 'Pulumi', 'Docker',
    'GitHub Actions', 'OpenTelemetry', 'Grafana', 'Datadog', 'pgvector',
    'LangGraph', 'Claude', 'Playwright',
  ],
];

export default function EngineeringStandards() {
  return (
    <section
      id="standards"
      className="section-dark relative overflow-hidden border-t border-[var(--border-hairline)] py-24 lg:py-32"
    >
      <ChromeObject
        variant="spiral"
        className="-right-14 top-20 hidden w-[220px] lg:block xl:w-[260px]"
        speed={-95}
        rotate={-14}
        tint={0.52}
        opacity={0.8}
        floatDuration={23}
        floatY={-24}
        rotateFrom={6}
        rotateTo={-6}
        bloom={0.15}
      />

      <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-10">
        <SectionHeading
          eyebrow="Engineering Standards"
          title={
            <>
              The standards,
              <br />
              <span className="text-[var(--blue)]">not the logos.</span>
            </>
          }
          lead="Anyone can list the same frameworks we do. These are the six rules that survive a deadline — they are in every statement of work, and you are entitled to hold us to them."
          className="max-w-3xl"
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-[var(--border-hairline)] bg-[var(--border-hairline)] md:grid-cols-2">
          {STANDARDS.map((standard, index) => (
            <Reveal
              key={standard.num}
              variant="fade"
              delay={index * 65}
              className="group relative bg-[var(--bg-raised)] p-7 transition-colors duration-300 hover:bg-[#FBFBFE] lg:p-9"
            >
              <div className="flex items-start gap-5">
                <span className="mt-0.5 font-mono text-xs font-bold tracking-[0.2em] text-[var(--blue)]">
                  {standard.num}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg leading-snug text-[var(--ink)]">
                    {standard.rule}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-[var(--ink-soft)]">
                    {standard.detail}
                  </p>
                </div>
              </div>

              <span
                aria-hidden="true"
                className="absolute bottom-0 left-0 h-0.5 w-0 bg-[var(--blue)] transition-all duration-500 group-hover:w-full"
              />
            </Reveal>
          ))}
        </div>

        {/* Compliance note. One line, placed where a security reviewer is already looking. */}
        <Reveal variant="up" delay={120} className="mt-6">
          <div className="flex items-start gap-3.5 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-sunken)] px-6 py-5">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--blue)]" strokeWidth={1.6} aria-hidden="true" />
            <p className="text-sm leading-relaxed text-[var(--ink-soft)]">
              <span className="font-semibold text-[var(--ink)]">On compliance:</span>{' '}
              we build to SOC 2, HIPAA and GDPR control requirements and produce the
              evidence trail as part of delivery. We are engineers, not your auditor — we
              will tell you plainly which controls we cover and which stay yours.
            </p>
          </div>
        </Reveal>

        {/* The stack. Two rows running opposite ways, so the eye reads it as reference
            material scrolling past rather than as a claim being made. */}
        <div className="mt-16">
          <Reveal variant="up-sm">
            <div className="mb-6 flex items-center gap-4">
              <span className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.28em] text-[var(--ink-faint)]">
                <span aria-hidden="true" className="text-[var(--blue)]">+</span> Working Stack
              </span>
              <span aria-hidden="true" className="h-px flex-1 bg-[var(--border-hairline)]" />
            </div>
          </Reveal>

          <div className="ticker-mask ticker-hold space-y-3 overflow-hidden">
            {STACK_ROWS.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="ticker"
                data-dir={rowIndex % 2 === 1 ? 'reverse' : undefined}
                style={{ '--ticker-dur': `${52 + rowIndex * 12}s` }}
              >
                {/* Duplicated once: the keyframe translates by exactly -50%, so the second
                    copy is what the first one is replaced by seamlessly. */}
                {[...row, ...row].map((item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className="mr-3 shrink-0 rounded-full border border-[var(--border-hairline)] bg-[var(--bg-raised)] px-5 py-2.5 font-mono text-xs font-medium text-[var(--ink-soft)] shadow-quiet-chip"
                  >
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>

          <Reveal variant="up-sm" delay={100}>
            <p className="mt-6 text-center text-xs text-[var(--ink-faint)]">
              Chosen per project against your team&rsquo;s existing skills — we would rather
              hand over something your engineers can maintain than something we enjoyed
              writing.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
