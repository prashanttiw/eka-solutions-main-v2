import React, { useCallback, useEffect, useRef, useState } from 'react';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import Banknote from 'lucide-react/dist/esm/icons/banknote';
import Globe2 from 'lucide-react/dist/esm/icons/globe-2';
import Laptop from 'lucide-react/dist/esm/icons/laptop';
import MapPin from 'lucide-react/dist/esm/icons/map-pin';
import Sprout from 'lucide-react/dist/esm/icons/sprout';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import ChromeObject from './ChromeObject';
import FlipCard from './apply/FlipCard';
import ApplicationForm from './apply/ApplicationForm';
import { api } from '../lib/api';
import { track } from '../lib/analytics';

const ROLES = [
  {
    title: 'Staff Engineer, Platform',
    level: 'Staff',
    mode: 'Remote · IST overlap',
    line: 'Own the multi-tenant core behind Orbit and the client systems built on it.',
  },
  {
    title: 'AI Systems Engineer',
    level: 'Senior',
    mode: 'Remote · Hybrid Bengaluru',
    line: 'Agent runtimes, evaluation harnesses and the guardrails that make them shippable.',
  },
  {
    title: 'Site Reliability Engineer',
    level: 'Senior',
    mode: 'Remote · On-call rotation',
    line: 'Run managed estates: SLOs, incident response and the cost curve underneath them.',
  },
  {
    title: 'Product Designer',
    level: 'Senior',
    mode: 'Remote · IST overlap',
    line: 'Design inside the build team, ship the design system as typed components.',
  },
  {
    title: '3D & Motion Engineer',
    level: 'Mid–Senior',
    mode: 'Remote',
    line: 'WebGL and Canvas interfaces that hold their frame rate on a mid-range laptop.',
  },
  {
    title: 'Engineering Manager',
    level: 'Lead',
    mode: 'Hybrid Bengaluru',
    line: 'Lead two squads, stay technical, protect the review bar under deadline pressure.',
  },
];

const HIRING = [
  { step: '01', label: 'Intro call', detail: '30 minutes, with an engineer, not a recruiter' },
  { step: '02', label: 'Technical conversation', detail: 'Your work, our problems, both ways' },
  { step: '03', label: 'Paid work session', detail: 'A real ticket, paid at your day rate' },
  { step: '04', label: 'Offer', detail: 'Inside ten working days of the first call' },
];

const TERMS = [
  {
    icon: Banknote,
    label: 'Paid interviews',
    detail: 'The work session is billed at your day rate, offer or no offer.',
  },
  {
    icon: Globe2,
    label: 'Remote by default',
    detail: 'Bengaluru if you want a desk. Four hours of IST overlap on most roles.',
  },
  {
    icon: Sprout,
    label: 'Learning budget',
    detail: 'Conferences, courses and books, approved by your lead and nobody above them.',
  },
  {
    icon: Laptop,
    label: 'Your own stack',
    detail: 'Machine, editor and OS are yours to pick. We buy it, you keep using it.',
  },
];

const normaliseOpening = (entry) => ({
  ...entry,
  title: entry.title,
  level: entry.level || 'Open role',
  mode: entry.location_label || ({ remote: 'Remote', hybrid: 'Hybrid', onsite: 'On-site' }[entry.location_mode] || entry.location_mode || 'Flexible'),
  line: entry.summary_line || 'Work with the team on a problem worth solving.',
});

export default function Careers({ standalone = false }) {
  const [applying, setApplying] = useState(false);
  const [role, setRole] = useState('');
  const [roles, setRoles] = useState(ROLES);
  const [rolesLoading, setRolesLoading] = useState(true);
  const applyRef = useRef(null);

  useEffect(() => {
    let active = true;
    api('/careers/openings', { timeoutMs: 10000 })
      .then((response) => {
        if (!active || !Array.isArray(response.data)) return;
        setRoles(response.data.map(normaliseOpening));
      })
      .catch(() => {
        // The editorial roles remain a safe fallback while the public API is unavailable.
      })
      .finally(() => {
        if (active) setRolesLoading(false);
      });
    return () => { active = false; };
  }, []);

  const openWith = useCallback((title) => {
    setRole(title);
    setApplying(true);
    track('role_open', { category: 'careers', label: title || 'Open application' });

    const node = applyRef.current;
    if (!node) return;
    window.requestAnimationFrame(() => {
      const top = node.getBoundingClientRect().top + window.scrollY - 110;
      window.scrollTo({
        top,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
  }, []);

  return (
    <section
      id="careers"
      className={`section-dark relative overflow-hidden border-t border-[var(--border-hairline)] pb-24 lg:pb-32 ${
        standalone ? 'pt-10 lg:pt-14' : 'pt-24 lg:pt-32'
      }`}
    >
      <ChromeObject
        variant="cluster"
        className="-left-32 bottom-4 hidden w-[210px] 2xl:block"
        speed={80}
        rotate={-10}
        tint={0.48}
        opacity={0.7}
        floatDuration={20}
        floatY={-18}
        rotateFrom={-3}
        rotateTo={6}
        bloom={0.12}
      />

      <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-10">
        {!standalone && (
          <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_1fr]">
            <SectionHeading
              eyebrow="Careers"
              title={
                <>
                  We hire slowly,
                  <br />
                  <span className="text-[var(--blue)]">and we pay for your time.</span>
                </>
              }
              size="md"
            />
            <Reveal variant="up" delay={140}>
              <p className="max-w-md text-base leading-relaxed text-[var(--ink-soft)] lg:justify-self-end">
                No unpaid take-homes, no whiteboard algorithms, no seven-round loops. Four
                conversations, one of them paid, and an answer inside ten working days.
              </p>
            </Reveal>
          </div>
        )}

        <div
          className={`careers-split grid gap-10 lg:gap-14 ${standalone ? '' : 'mt-14'}`}
          data-applying={applying}
        >
          <div className="careers-roles">
            <div className="mb-4 flex items-baseline justify-between gap-4">
                <span className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.26em] text-[var(--ink-faint)]">
                <span aria-hidden="true" className="text-[var(--blue)]">+</span> {rolesLoading ? 'Loading roles' : `${roles.length} open`}
              </span>
              {applying && (
                <span className="animate-fade-in font-mono text-[var(--fs-2xs)] uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                  Pick another to switch
                </span>
              )}
            </div>

            <ul className="divide-y divide-[var(--border-hairline)] border-y border-[var(--border-hairline)]">
              {roles.map((entry, index) => {
                const selected = applying && role === entry.title;
                return (
                  <Reveal as="li" key={entry.title} variant="up-sm" delay={index * 60}>
                    <button
                      type="button"
                      onClick={() => openWith(entry.title)}
                      aria-pressed={selected}
                      className={`group flex w-full items-center gap-5 py-5 text-left transition-colors ${
                        selected ? 'text-[var(--blue)]' : ''
                      }`}
                    >
                      <span
                        className={`font-mono text-[var(--fs-2xs)] font-semibold tracking-[0.2em] transition-colors ${
                          selected ? 'text-[var(--blue)]' : 'text-[var(--ink-faint)]'
                        }`}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <span
                            className={`font-display text-lg leading-snug transition-colors ${
                              selected
                                ? 'text-[var(--blue)]'
                                : 'text-[var(--ink)] group-hover:text-[var(--blue)]'
                            }`}
                          >
                            {entry.title}
                          </span>
                          <span className="rounded-full border border-[var(--border-hairline)] px-2.5 py-0.5 font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.16em] text-[var(--ink-faint)]">
                            {entry.level}
                          </span>
                        </span>

                        <span className="role-fold mt-1.5 block">
                          <span className="block">
                            <span className="block text-sm leading-relaxed text-[var(--ink-soft)]">
                              {entry.line}
                            </span>
                            <span className="mt-2 flex items-center gap-1.5 text-[var(--fs-2xs)] text-[var(--ink-faint)]">
                              <MapPin className="h-3 w-3" aria-hidden="true" />
                              {entry.mode}
                            </span>
                          </span>
                        </span>
                      </span>

                      <ArrowUpRight
                        className={`h-5 w-5 shrink-0 transition-all duration-300 ${
                          selected
                            ? 'translate-x-0.5 -translate-y-0.5 text-[var(--blue)]'
                            : 'text-[var(--ink-faint)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--blue)]'
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                  </Reveal>
                );
              })}
            </ul>

            <div className="role-fold mt-10">
              <div>
                <dl className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                  {TERMS.map((term, index) => {
                    const Icon = term.icon;
                    return (
                      <Reveal key={term.label} variant="up-sm" delay={index * 70} as="div" className="flex gap-3.5">
                        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[var(--bg-sunken)] text-[var(--ink)]">
                          <Icon className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <span className="min-w-0">
                          <dt className="font-display text-[var(--fs-lg)] leading-snug text-[var(--ink)]">
                            {term.label}
                          </dt>
                          <dd className="mt-1 text-[var(--fs-sm)] leading-relaxed text-[var(--ink-soft)]">
                            {term.detail}
                          </dd>
                        </span>
                      </Reveal>
                    );
                  })}
                </dl>
              </div>
            </div>
          </div>

          <div className="careers-apply scroll-mt-28" ref={applyRef} id="careers-apply">
            <FlipCard
              face={applying ? 'back' : 'front'}
              front={
                <div className="card-elevated p-8 lg:p-9">
                  <span className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.26em] text-[var(--ink-faint)]">
                    <span aria-hidden="true" className="text-[var(--blue)]">+</span> How hiring runs
                  </span>

                  <ol className="mt-7 space-y-6">
                    {HIRING.map((stage, index) => (
                      <li key={stage.step} className="relative flex gap-4">
                        {index < HIRING.length - 1 && (
                          <span
                            aria-hidden="true"
                            className="absolute left-[13px] top-8 h-[calc(100%+0.6rem)] w-px bg-[var(--border-hairline)]"
                          />
                        )}
                        <span className="relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--ink)] font-mono text-[var(--fs-2xs)] font-bold text-[#F7F6F1]">
                          {stage.step}
                        </span>
                        <span className="min-w-0">
                          <span className="block font-display text-base text-[var(--ink)]">
                            {stage.label}
                          </span>
                          <span className="mt-0.5 block text-[var(--fs-sm)] leading-relaxed text-[var(--ink-soft)]">
                            {stage.detail}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-8 rounded-2xl bg-[var(--bg-sunken)] px-5 py-4">
                    <p className="text-[var(--fs-sm)] leading-relaxed text-[var(--ink-soft)]">
                      Nothing here fits, but you think we should talk anyway? Send the thing you
                      are proudest of having built and one paragraph on why.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => openWith(role || '')}
                    className="btn-ink mt-7 w-full justify-center"
                  >
                    <span>Apply or introduce yourself</span>
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              }
              back={
                <ApplicationForm
                  roles={roles}
                  initialRole={role}
                  onClose={() => setApplying(false)}
                />
              }
            />
          </div>
        </div>
      </div>
    </section>
  );
}
