import React, { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useInView } from '../hooks/useInView';

/**
 * A number that counts up the first time it is scrolled into view.
 *
 * Written to `textContent` rather than through state: a 1.4-second count at 60fps is
 * eighty-odd renders of the surrounding card for a string that changes in one text node.
 *
 * The markup ships with the *final* value in it, so a crawler, a text-only reader or a
 * screenshot taken before the section scrolls in still reads the real figure. A layout
 * effect winds it back to the start before the first paint, which is the only way to have
 * both — resetting inside the normal effect would show the answer for one frame and then
 * visibly jump back to zero.
 *
 * The easing is a quintic ease-out, which spends most of its time near the final value. A
 * linear count reaches the number and stops dead, and reads like a loading spinner rather
 * than like a figure settling.
 */
export default function CountUp({
  to,
  from = 0,
  duration = 1500,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
}) {
  const [wrapRef, isInView] = useInView({ threshold: 0.5 });
  const outRef = useRef(null);
  const done = useRef(false);

  const format = useCallback(
    (value) =>
      `${prefix}${value.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}${suffix}`,
    [prefix, suffix, decimals],
  );

  useLayoutEffect(() => {
    const node = outRef.current;
    if (!node || done.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    node.textContent = format(from);
  }, [from, format]);

  useEffect(() => {
    const node = outRef.current;
    if (!node || !isInView || done.current) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      node.textContent = format(to);
      done.current = true;
      return;
    }

    let raf = 0;
    let start = 0;

    const step = (now) => {
      if (!start) start = now;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 5);
      node.textContent = format(from + (to - from) * eased);
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        done.current = true;
      }
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [isInView, to, from, duration, format]);

  return (
    <span ref={wrapRef} className={`tnum ${className}`}>
      <span ref={outRef}>{format(to)}</span>
    </span>
  );
}
