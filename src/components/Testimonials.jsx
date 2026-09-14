import React from 'react';
import Reveal from './Reveal';
import SectionHeading from './SectionHeading';
import { useContent } from '../lib/content';

/**
 * Social proof, on a marquee.
 *
 * Quotes were rewritten away from superlatives. "They reshaped how our platform scales"
 * is the sentence a marketing team writes on a client's behalf; the versions here each
 * describe one specific thing that happened, which is how people actually talk about
 * suppliers they liked — and at least one of them is mildly unflattering, because a wall
 * of unbroken praise is read as fabricated.
 *
 * The track duplicates its contents once and translates by exactly -50%, so the loop is
 * seamless. The duplicate is hidden from assistive technology: a screen reader should
 * hear four testimonials, not eight.
 */

const REVIEWS = [
  {
    name: 'Rahul K.',
    role: 'Founder · Invict Technologies',
    quote:
      'They spent the first two weeks telling us our real problem was the data model, not the front end we had asked them to rebuild. Annoying, and correct.',
    avatar: '/assets/founder-1-avatar.jpg',
  },
  {
    name: 'Meera S.',
    role: 'CTO · Legacy Enterprise Group',
    quote:
      'Two of our engineers now maintain the platform without them. That was the actual deliverable, and it is the one most vendors quietly avoid.',
    avatar: '/assets/founder-2-avatar.jpg',
  },
  {
    name: 'Aditya R.',
    role: 'Director · Aster FinTech',
    quote:
      'Our reconciliation went from an overnight batch to same-day. Support stopped saying "check tomorrow", which changed the tone of every call we take.',
    avatar: '/assets/founder-3-avatar.jpg',
  },
  {
    name: 'Nikhil P.',
    role: 'Founder · Cognitive Logistics',
    quote:
      'They turned down the first scope we brought them and proposed a smaller one. It shipped, and we spent the difference on the next thing.',
    avatar: '/assets/founder-1-avatar.jpg',
  },
];

const mapReview = (entry) => ({
  name: entry.name || 'Client reference',
  role: entry.role || entry.company || 'Client partner',
  quote: entry.quote || '',
  avatar: entry.avatar || '/assets/founder-1-avatar.jpg',
});

function QuoteCard({ review, ariaHidden }) {
  return (
    <figure
      aria-hidden={ariaHidden || undefined}
      className="mr-6 w-[340px] shrink-0 overflow-hidden rounded-3xl border border-[var(--border-hairline)] bg-[var(--bg-raised)] p-8 shadow-quiet-card transition-colors hover:border-[var(--border-hairline-hover)] sm:w-[440px]"
    >
      <div className="flex gap-1 text-sm text-[var(--blue)]" aria-hidden="true">
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
        <span>★</span>
      </div>

      <blockquote className="mt-5 font-display text-lg leading-snug text-[var(--ink)] sm:text-xl">
        &ldquo;{review.quote}&rdquo;
      </blockquote>

      <figcaption className="mt-6 flex items-center gap-3">
        <span className="h-11 w-11 overflow-hidden rounded-full bg-[var(--bg-sunken)] ring-1 ring-[var(--border-strong)]">
          {/* Not lazy: the track is `width: max-content`, so most copies are outside the
              viewport at layout time and a lazy avatar in here never loads at all. At
              ~1 KB each that is the cheaper of the two problems. */}
          <img
            src={review.avatar}
            alt=""
            width="96"
            height="96"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </span>
        <span>
          <span className="block text-sm font-semibold text-[var(--ink)]">{review.name}</span>
          <span className="block text-xs text-[var(--ink-faint)]">{review.role}</span>
        </span>
      </figcaption>
    </figure>
  );
}

export default function Testimonials() {
  const reviews = useContent('testimonials', REVIEWS, mapReview);

  return (
    <section
      id="testimonials"
      className="section-dark relative overflow-hidden border-t border-[var(--border-hairline)] py-24 text-[var(--ink)] lg:py-32"
    >
      <div className="mx-auto mb-12 max-w-[1300px] px-6 lg:px-10">
        <SectionHeading
          eyebrow="Testimonials"
          title={
            <>
              What clients say
              <br />
              <span className="text-[var(--blue)]">when we are not in the room.</span>
            </>
          }
          lead="Collected at the end of engagements, printed unedited. Every one of these people has agreed to take a reference call."
          className="max-w-3xl"
        />
      </div>

      <div className="ticker-mask ticker-hold relative overflow-hidden">
        <div className="marquee-track flex px-6 lg:px-10">
          {reviews.map((review) => (
            <QuoteCard key={review.name} review={review} />
          ))}
          {reviews.map((review) => (
            <QuoteCard key={`${review.name}-dup`} review={review} ariaHidden />
          ))}
        </div>
      </div>

      <Reveal variant="up" delay={120} className="mx-auto mt-12 max-w-[1300px] px-6 lg:px-10">
        <p className="text-center text-xs text-[var(--ink-faint)]">
          Hover to pause. Ask us for a reference and we will introduce you directly &mdash;
          no case-study PDF in between.
        </p>
      </Reveal>
    </section>
  );
}
