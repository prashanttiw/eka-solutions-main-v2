import { useEffect, useRef, useState } from 'react';

// Reveal, image and count-up components use only a few distinct observer configurations.
// Pool those configurations instead of asking the browser to maintain an observer object per
// element. Each target keeps its own callback and once/repeat behavior, so intersection timing
// and the resulting animations stay exactly the same.
const observerPools = new Map();

function poolKey(threshold, rootMargin) {
  return `${threshold}|${rootMargin}`;
}

function getObserverPool(threshold, rootMargin) {
  const key = poolKey(threshold, rootMargin);
  const existing = observerPools.get(key);
  if (existing) return existing;

  const pool = { key, targets: new Map(), observer: null };
  pool.observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      const target = pool.targets.get(entry.target);
      if (!target) continue;
      if (entry.isIntersecting) {
        target.callback(true);
        if (target.once) {
          pool.observer.unobserve(entry.target);
          pool.targets.delete(entry.target);
        }
      } else if (!target.once) {
        target.callback(false);
      }
    }

    if (pool.targets.size === 0) {
      pool.observer.disconnect();
      if (observerPools.get(key) === pool) observerPools.delete(key);
    }
  }, { threshold, rootMargin });
  observerPools.set(key, pool);
  return pool;
}

export function useInView({ threshold = 0.2, rootMargin = '0px 0px -10% 0px', once = true } = {}) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  useEffect(() => {
    const node = ref.current;
    if (!node || isInView) return;

    const pool = getObserverPool(threshold, rootMargin);
    pool.targets.set(node, { callback: setIsInView, once });
    pool.observer.observe(node);

    return () => {
      pool.observer.unobserve(node);
      pool.targets.delete(node);
      if (pool.targets.size === 0) {
        pool.observer.disconnect();
        if (observerPools.get(pool.key) === pool) observerPools.delete(pool.key);
      }
    };
  }, [threshold, rootMargin, once, isInView]);

  return [ref, isInView];
}
