import React from 'react';
import { useParallax } from '../hooks/useParallax';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { CHROME_OBJECTS } from '../lib/chromeObjects';

/**
 * One of the two silver renders, placed as decoration and moved on scroll.
 *
 * The renders are the only illustration on the site, so they are used sparingly and
 * always at the edge of a section — never behind body copy, where a specular highlight
 * lands under a line of text and makes it unreadable at exactly one scroll position.
 *
 * Motion comes from three independent sources that are deliberately *not* synchronised:
 * the scroll parallax on the outer layer, the idle float on the object, and each
 * placement's own float duration. Two objects on the same screen therefore never appear
 * to be driven by the same clock, which is what stops them reading as a UI element.
 *
 * Below `lg` the parallax is switched off. The travel is sized for a wide column; on a
 * phone the same offset walks the object over the text.
 */

export default function ChromeObject({
  variant = 'cluster',
  /** Tailwind placement + size classes for the outer layer, e.g. "-right-16 top-24 w-[300px]". */
  className = '',
  speed = 90,
  rotate = 0,
  scale = 0,
  /** 0 → silver as rendered, 1 → fully in the site blue. */
  tint = 0.5,
  opacity = 1,
  floatDuration = 16,
  floatDelay = 0,
  floatX = 0,
  floatY = -20,
  rotateFrom = 0,
  rotateTo = 5,
  bloom = 0.16,
  /** Parallax is disabled under lg by default; pass false to keep it everywhere. */
  desktopOnly = true,
}) {
  const object = CHROME_OBJECTS[variant] ?? CHROME_OBJECTS.cluster;
  // Subscribed rather than read once, so dragging a window across the breakpoint turns
  // the parallax on and off instead of keeping whatever was true at mount.
  const isNarrow = useMediaQuery('(max-width: 1023px)');
  const ref = useParallax(speed, {
    rotate,
    scale,
    disabled: desktopOnly && isNarrow,
  });

  return (
    <div ref={ref} aria-hidden="true" className={`chrome-layer ${className}`}>
      <span
        className="chrome-object"
        style={{
          '--float-dur': `${floatDuration}s`,
          '--float-delay': `${floatDelay}s`,
          '--float-x': `${floatX}px`,
          '--float-y': `${floatY}px`,
          '--rot-from': `${rotateFrom}deg`,
          '--rot-to': `${rotateTo}deg`,
          '--chrome-sepia': tint,
          '--chrome-opacity': opacity,
          '--bloom-a': bloom,
        }}
      >
        <img
          src={object.src}
          alt=""
          loading="lazy"
          decoding="async"
          draggable="false"
          width={object.width}
          height={object.height}
        />
      </span>
    </div>
  );
}
