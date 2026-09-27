import { useEffect, useRef } from 'react';

/*
 * Illustrations animate only while they are on screen. One shared IntersectionObserver
 * toggles `is-playing`; CSS pauses every animation inside an element without it. Nothing
 * runs per frame in JavaScript — the loops themselves are CSS transforms and opacity.
 */
let observer = null;

function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver((entries) => {
      for (const entry of entries) entry.target.classList.toggle('is-playing', entry.isIntersecting);
    }, { rootMargin: '-8% 0px' });
  }
  return observer;
}

export function usePlayWhenVisible() {
  const ref = useRef(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      element.classList.add('is-playing');
      return undefined;
    }
    const shared = getObserver();
    shared.observe(element);
    return () => shared.unobserve(element);
  }, []);
  return ref;
}
