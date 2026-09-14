/**
 * One scroll listener for the whole body of the page.
 *
 * The hero, reading indicator and every parallax layer go through this one schedule. A
 * dozen moving layers each attaching their own
 * `scroll` handler is a dozen handlers the browser has to run before it can paint, on the
 * one event that most needs to stay cheap; a single rAF-batched pass measures once and
 * hands the same numbers to every subscriber.
 *
 * Subscribers are called with `{ scrollY, viewportH }` and are expected to write styles
 * directly to a DOM node. Nothing here ever calls setState — a parallax layer that
 * re-rendered React on every frame would cost more than the effect is worth.
 */

const subscribers = new Set();

let frame = 0;
let listening = false;
let state = { scrollY: 0, viewportH: 0 };

const reducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function flush() {
  frame = 0;
  state = { scrollY: window.scrollY, viewportH: window.innerHeight };
  for (const fn of subscribers) {
    try {
      fn(state);
    } catch {
      // One misbehaving layer must not take the rest of the page's motion with it.
    }
  }
}

function schedule() {
  if (frame) return;
  frame = requestAnimationFrame(flush);
}

function start() {
  if (listening) return;
  listening = true;
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
}

function stop() {
  if (!listening) return;
  listening = false;
  window.removeEventListener('scroll', schedule);
  window.removeEventListener('resize', schedule);
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
}

/**
 * Register a per-frame callback. Returns an unsubscribe function.
 *
 * Under `prefers-reduced-motion` the callback is invoked exactly once, so a layer can
 * settle into its resting position, and then never again.
 */
export function onScroll(fn) {
  if (typeof window === 'undefined') return () => {};

  if (reducedMotion()) {
    fn({ scrollY: window.scrollY, viewportH: window.innerHeight });
    return () => {};
  }

  subscribers.add(fn);
  start();
  // Seed the new subscriber immediately rather than leaving it at its authored
  // position until the visitor happens to scroll.
  fn({ scrollY: window.scrollY, viewportH: window.innerHeight });

  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0) stop();
  };
}

/**
 * How far an element has travelled through the viewport, as -1 → 0 → 1.
 *
 * -1 is "the element's centre is a full viewport below the fold", 0 is "its centre is on
 * the centre line", 1 is "a full viewport above". Parallax offsets multiply this, so the
 * offset is zero exactly when the element is centred — which is what stops a layer from
 * being visibly displaced at the moment the visitor is actually looking at it.
 */
export function viewportProgress(rect, viewportH) {
  const elementCentre = rect.top + rect.height / 2;
  const viewportCentre = viewportH / 2;
  const span = (viewportH + rect.height) / 2 || 1;
  return Math.max(-1, Math.min(1, (viewportCentre - elementCentre) / span));
}
