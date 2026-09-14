import React from 'react';
import { Link } from 'react-router-dom';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import RevealImage from './RevealImage';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { WhatsAppGlyph } from './WhatsAppFloat';
import { whatsappHref } from '../lib/whatsapp';
import { useContent } from '../lib/content';

/**
 * Proof, written as case studies rather than as portfolio tiles.
 *
 * The structure is deliberately problem → what we did → result, with a number attached to
 * each. A card that only says what was built is a screenshot with a caption; the shape
 * that persuades is the one where the reader can see their own situation in the first
 * line and then find out what happened.
 *
 * Each entry also carries what it took — duration, team, model — because a result with no
 * cost next to it is not information a buyer can use.
 */

const STUDIES = [
  {
    id: 'apex',
    number: '01',
    category: 'SaaS · Cloud Infrastructure',
    title: 'ApexCloud',
    problem:
      'A single-tenant platform sold to enterprises one bespoke deployment at a time. Onboarding took eleven weeks and every customer ran a slightly different build.',
    work: 'Re-architected onto a multi-tenant core with per-tenant isolation, moved forty-one bespoke deployments onto one release train, and put the whole estate behind infrastructure as code.',
    results: [
      { value: '11 wks → 4 days', label: 'Enterprise onboarding' },
      { value: '41 → 1', label: 'Builds to maintain' },
      { value: '−34%', label: 'Infrastructure cost' },
    ],
    meta: 'Embedded squad · 9 months · 5 engineers',
    image: '/assets/case-apex.jpg',
  },
  {
    id: 'neural',
    number: '02',
    category: 'AI · Enterprise Automation',
    title: 'NeuralFlow',
    problem:
      'An operations team reviewing 4,000 documents a day by hand, and an AI pilot that worked in the demo and could not be trusted with a real queue.',
    work: 'Built an agent pipeline with typed tools, an evaluation suite gating every prompt change, hard spend ceilings and a human review path for anything below a confidence threshold.',
    results: [
      { value: '82%', label: 'Documents fully automated' },
      { value: '0', label: 'Unreviewed low-confidence calls' },
      { value: '−38%', label: 'Inference spend after tuning' },
    ],
    meta: 'Sprint Zero, then fixed-scope build · 5 months',
    image: '/assets/case-neural.jpg',
  },
  {
    id: 'vault',
    number: '03',
    category: 'FinTech · High-Throughput Core',
    title: 'VaultPay',
    problem:
      'A neo-bank ledger that reconciled overnight in batch, which meant support could not answer "where is my money" until the next morning.',
    work: 'Replaced the batch reconciliation with an event-sourced double-entry core, idempotent settlement, and a read model that gives support the same view the customer has.',
    results: [
      { value: '<15ms', label: 'p95 ledger write' },
      { value: '$420M', label: 'Volume settled, first year' },
      { value: '100%', label: 'Same-day reconciliation' },
    ],
    meta: 'Fixed-scope build, then managed run · ongoing',
    image: '/assets/case-vault.jpg',
  },
];

const mapStudy = (entry) => ({
  id: entry.id,
  number: entry.number || '',
  category: entry.category || '',
  title: entry.title || entry.id,
  problem: entry.problem || '',
  work: entry.work || '',
  results: Array.isArray(entry.results) ? entry.results : [],
  meta: entry.meta || '',
  image: entry.image || '/assets/case-apex.jpg',
});

export default function CaseStudies() {
  const studies = useContent('case-studies', STUDIES, mapStudy);

  return (
    <section
      id="work"
      className="section-dark relative overflow-hidden border-t border-[var(--border-hairline)] py-24 lg:py-32"
    >
      <div className="mx-auto max-w-[1300px] px-6 lg:px-10">
        <SectionHeading
          eyebrow="Case Studies"
          title={
            <>
              Three problems,
              <br />
              <span className="text-[var(--blue)]">and what actually changed.</span>
            </>
          }
          lead="Client names are shortened at their request. The numbers are theirs, taken from their own dashboards, and every one of them will take a reference call."
          className="max-w-3xl"
        />

        <div className="mt-16 space-y-6">
          {studies.map((study, index) => (
            <Reveal key={study.id} variant="up" delay={index * 90}>
              <article className="group grid w-full items-center gap-8 rounded-3xl border border-[var(--border-hairline)] bg-[var(--bg-raised)] p-6 shadow-quiet-card transition-all duration-500 hover:-translate-y-1 hover:border-[var(--border-hairline-hover)] hover:shadow-quiet-hover md:grid-cols-[0.95fr_1fr] lg:p-8">
                <RevealImage
                  src={study.image}
                  alt={`${study.title} interface`}
                  className="relative aspect-[4/3] rounded-2xl border border-[var(--border-hairline)] shadow-quiet-card"
                  imgClassName="transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                />

                <div className="relative px-1 lg:px-4">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -top-10 right-0 select-none font-display text-6xl text-[var(--ink)]/[0.06] lg:text-8xl"
                  >
                    {study.number}
                  </span>

                  <div className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.24em] text-[var(--ink-faint)]">
                    {study.category}
                  </div>

                  <h3 className="mt-3 font-display text-3xl text-[var(--ink)] transition-transform duration-500 group-hover:translate-x-1 lg:text-4xl">
                    {study.title}
                  </h3>

                  <p className="mt-5 border-l-2 border-[var(--blue)]/35 pl-4 text-sm font-medium leading-relaxed text-[var(--ink)]">
                    {study.problem}
                  </p>

                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-[var(--ink-soft)]">
                    {study.work}
                  </p>

                  <dl className="mt-6 grid grid-cols-3 gap-2">
                    {study.results.map((result) => (
                      <div
                        key={result.label}
                        className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-sunken)] px-3 py-3"
                      >
                        <dt className="sr-only">{result.label}</dt>
                        <dd>
                          <span className="block whitespace-nowrap font-display text-lg leading-none text-[var(--ink)]">
                            {result.value}
                          </span>
                          <span className="mt-1.5 block text-[var(--fs-2xs)] leading-snug text-[var(--ink-faint)]">
                            {result.label}
                          </span>
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 rounded-full bg-[var(--ink)] px-5 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-[var(--blue)] hover:shadow-quiet-hover"
                    >
                      <span>Ask for the full write-up</span>
                      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:rotate-45" />
                    </Link>
                    <span className="font-mono text-[var(--fs-2xs)] uppercase tracking-[0.18em] text-[var(--ink-faint)]">
                      {study.meta}
                    </span>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal variant="up" delay={140} className="mt-14">
          <div className="flex flex-wrap items-center justify-center gap-4">
            <p className="w-full text-center text-sm text-[var(--ink-faint)] sm:w-auto">
              Recognise your own problem in one of these?
            </p>
            <a
              href={whatsappHref(
                'Hi EKA Solution, one of your case studies looks like our situation — can we talk?',
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] bg-[var(--bg-raised)] px-5 py-2.5 text-sm font-semibold text-[var(--ink)] shadow-quiet-chip transition-all hover:-translate-y-px hover:bg-[var(--ink)] hover:text-white"
            >
              <WhatsAppGlyph className="h-4 w-4" />
              <span>Start on WhatsApp</span>
              <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
