import { useSyncExternalStore } from 'react';

/**
 * Subscribes to a media query and re-renders when it flips.
 *
 * Reading `matchMedia(...).matches` straight in the render body — which is the obvious
 * thing to write — evaluates once and then goes stale: rotate a tablet or drag a window
 * across the breakpoint and the component keeps whatever answer it got on mount.
 *
 * `useSyncExternalStore` is the right primitive rather than a `useEffect` + `useState`
 * pair, because it reads the current value during render instead of after the first paint
 * — so nothing mounts with the wrong branch and then corrects itself a frame later.
 */
export function useMediaQuery(query) {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === 'undefined') return () => {};
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => list.removeEventListener('change', onChange);
    },
    () => (typeof window === 'undefined' ? false : window.matchMedia(query).matches),
    () => false,
  );
}
