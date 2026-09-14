import React from 'react';
import { useInView } from '../hooks/useInView';

/**
 * Scroll-in reveal with a stagger.
 *
 * `.rv` in the stylesheet owns the actual motion; this only decides when the class flips
 * and what the four knobs are set to. Splitting it that way means the reduced-motion
 * escape hatch lives in one place — the media query in the stylesheet — instead of being
 * re-checked in every component that animates.
 *
 * Variants exist so a page-wide vocabulary stays short: `up` for prose and headings,
 * `scale` for cards and images, `left`/`right` for the halves of a split layout.
 */
const VARIANTS = {
  up: { '--rv-y': '28px' },
  'up-sm': { '--rv-y': '14px' },
  scale: { '--rv-y': '24px', '--rv-s': '0.965' },
  left: { '--rv-x': '-36px', '--rv-y': '0px' },
  right: { '--rv-x': '36px', '--rv-y': '0px' },
  fade: { '--rv-y': '0px' },
};

export default function Reveal({
  as: Tag = 'div',
  variant = 'up',
  delay = 0,
  threshold = 0.15,
  className = '',
  style,
  children,
  ...rest
}) {
  const [ref, isInView] = useInView({ threshold, rootMargin: '0px 0px -8% 0px' });

  return (
    <Tag
      ref={ref}
      className={`rv ${isInView ? 'is-in' : ''} ${className}`}
      style={{ ...VARIANTS[variant], '--rv-delay': `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
