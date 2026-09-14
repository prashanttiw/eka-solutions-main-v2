import React from 'react';
import { Link } from 'react-router-dom';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';

/**
 * The first-project path.
 *
 * A home page should help a prospective client take the next useful step, not repeat the
 * navigation already available in the header. This section makes the working relationship
 * tangible without inventing client logos, metrics, or case-study claims that have not been
 * confirmed for public use.
 */
const STEPS = [
  {
    label: 'Understand',
    title: 'Start with the real problem.',
    detail: 'What is changing, who it needs to work for, and where the current experience or system is getting in the way.',
  },
  {
    label: 'Decide',
    title: 'Find a useful first move.',
    detail: 'Turn the important questions into a focused scope, a practical sequence, and decisions your team can stand behind.',
  },
  {
    label: 'Make',
    title: 'Design and build together.',
    detail: 'Keep the experience and the engineering in the same conversation, so good ideas stay useful when they become real.',
  },
  {
    label: 'Carry forward',
    title: 'Launch with a stronger foundation.',
    detail: 'Prepare the handover, learn from the first release, and decide what deserves attention next.',
  },
];

export default function ProjectPath() {
  return (
    <section
      id="approach"
      className="section-dark relative overflow-hidden border-t border-[var(--border-hairline)] py-24 lg:py-32"
    >
      <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-10">
        <div className="grid items-end gap-10 lg:grid-cols-[1.1fr_1fr]">
          <SectionHeading
            eyebrow="How we work"
            title={
              <>
                A clear path,
                <br />
                <span className="text-[var(--blue)]">before a line of code.</span>
              </>
            }
            size="md"
          />
          <Reveal variant="up" delay={140}>
            <p className="max-w-md text-base leading-relaxed text-[var(--ink-soft)] lg:justify-self-end">
              Big projects rarely start with a finished brief. They start with a problem, a
              decision, or a chance to do something better. We turn that first conversation
              into a direction your team can use.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-[1.75rem] border border-[var(--border-hairline)] bg-[var(--border-hairline)] md:grid-cols-2">
          {STEPS.map((step, index) => (
            <Reveal
              key={step.label}
              variant="up-sm"
              delay={index * 80}
              className="group bg-[var(--bg-raised)] p-7 transition-colors duration-300 hover:bg-[#FBFBFE] lg:p-9"
            >
              <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.26em] text-[var(--blue)]">
                {step.label}
              </span>
              <h3 className="mt-6 font-display text-2xl leading-tight text-[var(--ink)] sm:text-[2rem]">
                {step.title}
              </h3>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-[var(--ink-soft)] sm:text-base">
                {step.detail}
              </p>
            </Reveal>
          ))}
        </div>

        <Reveal variant="up" delay={160} className="mt-6">
          <div className="flex flex-col gap-7 rounded-[1.75rem] bg-[var(--ink)] px-7 py-8 text-[#F7F6F1] sm:px-10 lg:flex-row lg:items-end lg:justify-between lg:py-10">
            <div className="max-w-2xl">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.26em] text-[#F7F6F1]/55">
                Your first conversation
              </p>
              <h3 className="mt-4 font-display text-2xl leading-tight sm:text-3xl">
                Bring us the messy beginning.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-[#F7F6F1]/72 sm:text-base">
                Tell us what needs to change, who it needs to work for, and where you are
                stuck. You do not need a perfect plan to start a useful conversation.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4 lg:shrink-0">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-[#F7F6F1] px-6 py-3 text-sm font-semibold text-[var(--ink)] transition-all duration-200 hover:-translate-y-px hover:bg-white"
              >
                <span>Start a Project</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
              <Link
                to="/playbook"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#F7F6F1]/78 transition-colors hover:text-[#F7F6F1]"
              >
                <span className="link-draw">See the full playbook</span>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
