import { useEffect, useRef } from 'react';
import { onScroll, viewportProgress } from '../lib/scrollDriver';

/**
 * Moves the element it is attached to against the scroll.
 *
 * Returns a ref. The transform is written straight to `element.style`, so nothing here
 * causes a React render — attach it to a wrapper whose only job is to be moved, and let
 * whatever is inside own its own transforms.
 *
 * @param {number} speed  Pixels of travel between the element entering and leaving the
 *                        viewport. Positive drifts up (slower than the page, the classic
 *                        "further away" read); negative drifts down.
 * @param {object} opts
 * @param {number} opts.rotate  Degrees of rotation across the same span.
 * @param {number} opts.scale   How much the element grows across the span, as a fraction.
 * @param {boolean} opts.disabled  Skip entirely — used to switch parallax off on narrow
 *                        screens, where the travel would push a layer off the edge.
 */
export function useParallax(speed = 60, { rotate = 0, scale = 0, disabled = false } = {}) {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || disabled) return;

    // getBoundingClientRect() per frame per layer is the one measurement that would make
    // this expensive, and it is also the one that forces layout. The element's height and
    // its position in the document only change on resize or on a reflow, so they are
    // cached and the per-frame maths is pure arithmetic on the cached numbers.
    let cache = null;
    const remeasure = () => {
      node.style.transform = '';
      const rect = node.getBoundingClientRect();
      cache = { height: rect.height, docTop: rect.top + window.scrollY };
    };

    remeasure();

    let lastViewportH = 0;
    const unsubscribe = onScroll(({ scrollY, viewportH }) => {
      if (!cache) return;
      if (viewportH !== lastViewportH) {
        lastViewportH = viewportH;
        remeasure();
      }

      const rect = { top: cache.docTop - scrollY, height: cache.height };

      // Nothing off-screen is worth a transform: skipping them keeps the per-frame cost
      // proportional to what is actually visible rather than to the length of the page.
      if (rect.top > viewportH + 120 || rect.top + rect.height < -120) return;

      const p = viewportProgress(rect, viewportH);
      const parts = [`translate3d(0, ${(p * speed).toFixed(2)}px, 0)`];
      if (rotate) parts.push(`rotate(${(p * rotate).toFixed(3)}deg)`);
      if (scale) parts.push(`scale(${(1 + p * scale).toFixed(4)})`);
      node.style.transform = parts.join(' ');
    });

    // A late-loading image or font can change the element's position after the initial
    // measurement, which would leave the layer parallaxing around the wrong origin.
    const observer = new ResizeObserver(remeasure);
    observer.observe(document.documentElement);

    return () => {
      unsubscribe();
      observer.disconnect();
      node.style.transform = '';
    };
  }, [speed, rotate, scale, disabled]);

  return ref;
}
