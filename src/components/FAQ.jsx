import React, { useState } from 'react';
import ArrowUpRight from 'lucide-react/dist/esm/icons/arrow-up-right';
import Plus from 'lucide-react/dist/esm/icons/plus';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { WhatsAppGlyph } from './WhatsAppFloat';
import { whatsappHref } from '../lib/whatsapp';
import { useContent } from '../lib/content';

/**
 * The objections, answered before they have to be asked on a call.
 *
 * Chosen by what actually stalls a deal rather than by what is easy to answer: price
 * shape, IP ownership, what happens when the relationship ends, whether the people in the
 * pitch are the people in the repo. An FAQ that only asks itself flattering questions is
 * read as marketing and skipped; one that names the uncomfortable ones is read as a
 * position, which is the entire point of putting it before the contact form.
 *
 * Built on a controlled disclosure rather than <details> so only one panel is open at a
 * time — a page of simultaneously-open answers is a wall of text, and the whole value of
 * the pattern is that a visitor can scan the questions and open only theirs.
 */

const QUESTIONS = [
  {
    q: 'What should I bring to the first conversation?',
    a: 'A short description of your business, the problem you want to solve, and any timeline or budget you have in mind. Existing websites, tools, or examples can help, but a finished brief is not necessary.',
  },
  {
    q: 'Can you improve an existing website or application?',
    a: 'Yes, an existing product can be the starting point. Share what is working and what is getting in the way so we can discuss whether a focused improvement or a larger rebuild makes sense.',
  },
  {
    q: 'How are cost and timing agreed?',
    a: 'They depend on scope, complexity, integrations, and the level of support needed. The next step is to define the work and discuss a proposal with deliverables, milestones, fees, and assumptions.',
  },
  {
    q: 'Can you work alongside our team?',
    a: 'We can explore a shared delivery approach. The conversation should establish who owns each part of the work, which tools we will use, and how planning and review will happen.',
  },
  {
    q: 'What happens after launch?',
    a: 'Handover, maintenance, and ongoing support should be agreed as part of the project. We can discuss documentation, training, updates, and the support coverage your business needs.',
  },
  {
    q: 'Who owns the finished work?',
    a: 'Ownership, access to source code, and any third-party licences should be made explicit in the project agreement. Raise any requirements early so they can be included in the scope.',
  },
  {
    q: 'How do I send a project enquiry?',
    a: 'Use the project brief on this page to prepare an email, then review and send it in your email app. You can also email us directly or start a conversation on WhatsApp.',
  },
];

const mapQuestion = (entry) => ({
  q: entry.q || entry.question || 'Question',
  a: entry.a || entry.answer || '',
});

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);
  const questions = useContent('faqs', QUESTIONS, mapQuestion);

  return (
    <section
      id="faq"
      className="section-dark relative overflow-hidden border-t border-[var(--border-hairline)] py-24 lg:py-32"
    >
      <div className="relative z-10 mx-auto max-w-[1300px] px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              eyebrow="Questions"
              title={
                <>
                  A few things
                  <br />
                  <span className="text-[var(--blue)]">
                    you may be wondering.
                  </span>
                </>
              }
              size="md"
              lead="Practical answers to help you take the next step. Project-specific terms are agreed in your proposal."
            />

            <Reveal variant="up" delay={220} className="mt-9">
              <a
                href={whatsappHref(
                  'Hi EKA Solution, I have a question that is not answered in your FAQ.',
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-raised)] py-3 pl-3 pr-5 shadow-quiet-chip transition-all duration-300 hover:-translate-y-px hover:border-[var(--border-hairline-hover)] hover:shadow-quiet-hover"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--ink)] text-[#F7F6F1]">
                  <WhatsAppGlyph className="h-5 w-5" />
                </span>
                <span className="flex flex-col text-left">
                  <span className="font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.22em] text-[var(--ink-faint)]">
                    Something else?
                  </span>
                  <span className="font-display text-sm font-bold text-[var(--ink)]">
                    Ask us directly
                  </span>
                </span>
                <ArrowUpRight className="ml-1 h-4 w-4 text-[var(--ink-faint)] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--ink)]" />
              </a>
            </Reveal>
          </div>

          <div className="divide-y divide-[var(--border-hairline)] border-y border-[var(--border-hairline)]">
            {questions.map((item, index) => {
              const isOpen = openIndex === index;
              return (
                <Reveal key={item.q} variant="up-sm" delay={index * 45}>
                  <h3>
                    <button
                      type="button"
                      data-analytics="faq_open"
                      data-analytics-label={item.q}
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${index}`}
                      className="group flex w-full items-start gap-5 py-6 text-left transition-colors"
                    >
                      <span className="mt-1 font-mono text-[var(--fs-2xs)] font-semibold tracking-[0.2em] text-[var(--ink-faint)]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="flex-1 font-display text-lg leading-snug text-[var(--ink)] transition-colors group-hover:text-[var(--blue)] sm:text-xl">
                        {item.q}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border transition-all duration-400 ${
                          isOpen
                            ? 'rotate-[135deg] border-transparent bg-[var(--ink)] text-[#F7F6F1]'
                            : 'border-[var(--border-strong)] text-[var(--ink)] group-hover:border-[var(--blue)] group-hover:text-[var(--blue)]'
                        }`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </span>
                    </button>
                  </h3>

                  {/* Height is animated with a grid track rather than max-height: a
                      max-height guess is either too small and clips a long answer or too
                      large and makes every close start with a pause. */}
                  <div
                    id={`faq-answer-${index}`}
                    aria-hidden={!isOpen}
                    className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${
                      isOpen
                        ? 'grid-rows-[1fr] opacity-100'
                        : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="pb-7 pl-10 pr-1 text-[var(--fs-base)] leading-relaxed text-[var(--ink-soft)] sm:pr-10">
                        {item.a}
                      </p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
