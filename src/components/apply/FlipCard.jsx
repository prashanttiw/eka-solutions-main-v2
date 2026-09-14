import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Two faces of one card, turned on a shared Y axis.
 *
 * The interesting part is not the rotation, it is the height. Both faces are absolutely
 * positioned so they can occupy the same box, which means neither can size the stage — so
 * the stage's height is measured off whichever face is showing and written as an inline
 * style. The card therefore *grows into* the form: the hiring list is around 520px, the
 * application is nearer 900, and the box travels between the two on the same curve as the
 * turn. That growth is the effect; the flip is just what hides the seam.
 *
 * The height curve overshoots slightly (see `.flip-stage`), so the card swells a little
 * past its target and settles — a resize with no overshoot reads as a layout change, and
 * with overshoot it reads as an object with volume.
 *
 * A `ResizeObserver` stays attached rather than measuring once: the form's own height
 * changes as the applicant moves between its four steps, and the card has to follow it
 * without a second flip.
 */
export default function FlipCard({ face, front, back, className = '' }) {
  const stageRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);

  const [height, setHeight] = useState(null);
  const [ready, setReady] = useState(false);
  const mounted = useRef(false);

  const showingBack = face === 'back';

  useLayoutEffect(() => {
    const active = showingBack ? backRef.current : frontRef.current;
    if (!active) return undefined;

    const measure = () => setHeight(active.offsetHeight);
    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(active);
    // A late webfont or a lazily-decoded icon changes the height after the observer's
    // first pass; one more frame catches it without polling.
    const frame = window.requestAnimationFrame(measure);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [showingBack]);

  /* The very first height is set from nothing, and animating 0 → 520px on mount would
     make the card unfurl every time the section scrolls into view. The transition is only
     armed once a real height is on the box. */
  useEffect(() => {
    if (height !== null && !ready) {
      const frame = window.requestAnimationFrame(() => setReady(true));
      return () => window.cancelAnimationFrame(frame);
    }
    return undefined;
  }, [height, ready]);

  /* The swell + rim light, replayed on every turn. Removing and re-adding the class with a
     forced reflow between is the only reliable way to restart a CSS animation. */
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return undefined;
    }
    const stage = stageRef.current;
    if (!stage) return undefined;

    stage.classList.remove('is-swelling');
    void stage.offsetWidth;
    stage.classList.add('is-swelling');

    const timer = window.setTimeout(() => stage.classList.remove('is-swelling'), 900);
    return () => window.clearTimeout(timer);
  }, [showingBack]);

  return (
    <div
      ref={stageRef}
      className={`flip-stage ${className}`}
      data-face={showingBack ? 'back' : 'front'}
      style={{
        height: height ?? undefined,
        transition: ready ? undefined : 'none',
      }}
    >
      <div className="flip-inner">
        {/* `inert` takes the hidden face out of the tab order and the accessibility tree.
            `backface-visibility` only stops it being drawn — without this, tabbing through
            the visible card walks straight into the form behind it. */}
        <div className="flip-face flip-face--front" inert={showingBack || undefined}>
          <div ref={frontRef}>{front}</div>
        </div>

        <div className="flip-face flip-face--back" inert={!showingBack || undefined}>
          <div ref={backRef}>{back}</div>
        </div>
      </div>
    </div>
  );
}
