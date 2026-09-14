import React from 'react';
import Reveal from './Reveal';

/**
 * The eyebrow / headline / standfirst block every body section opens with.
 *
 * It exists because the same three-part header was hand-written a dozen times with the
 * tracking, the size ramp and the stagger delays drifting a little in each copy. Pulling
 * it into one component is what makes the sections read as chapters of one document
 * rather than as a dozen separately-designed pages stacked up.
 *
 * The eyebrow keeps the `+` prefix the site already used — it is a small thing, but it is
 * the one piece of ornament that ties the body back to the instrumentation fragments
 * floating in the hero.
 */
export default function SectionHeading({
  eyebrow,
  title,
  lead,
  align = 'left',
  size = 'lg',
  className = '',
  titleClassName = '',
  leadClassName = '',
  children,
}) {
  const sizes = {
    lg: 'text-4xl sm:text-5xl lg:text-6xl',
    md: 'text-3xl sm:text-4xl lg:text-5xl',
  };

  return (
    <div
      className={`${align === 'center' ? 'mx-auto text-center' : ''} ${className}`}
    >
      {eyebrow && (
        <Reveal variant="up-sm" className="mb-5">
          <span className="inline-flex items-center gap-2 font-mono text-[var(--fs-2xs)] font-semibold uppercase tracking-[0.28em] text-[var(--ink-faint)]">
            <span aria-hidden="true" className="text-[var(--blue)]">
              +
            </span>
            {eyebrow}
          </span>
        </Reveal>
      )}

      <Reveal variant="up" delay={70} as="h2"
        className={`text-hero ${sizes[size]} leading-[0.98] text-[var(--ink)] ${titleClassName}`}
      >
        {title}
      </Reveal>

      {lead && (
        <Reveal
          variant="up"
          delay={150}
          as="p"
          className={`mt-6 max-w-2xl text-base leading-relaxed text-[var(--ink-soft)] sm:text-lg ${
            align === 'center' ? 'mx-auto' : ''
          } ${leadClassName}`}
        >
          {lead}
        </Reveal>
      )}

      {children}
    </div>
  );
}
