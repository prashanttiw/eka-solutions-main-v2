import React, { useEffect, useState } from 'react';
import BrandLogo from './BrandLogo';

export default function Preloader({ onComplete }) {
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // A short brand entrance, not a simulated download percentage. Both timers are
    // released on unmount/StrictMode replay; the animation adds no per-frame React work.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const reveal = setTimeout(() => setLeaving(true), reduced ? 180 : 720);
    const finish = setTimeout(() => onComplete?.(), reduced ? 300 : 1220);
    return () => {
      clearTimeout(reveal);
      clearTimeout(finish);
    };
  }, [onComplete]);

  return (
    <div className="brand-preloader" data-leaving={leaving} role="status" aria-live="polite" aria-label="Preparing EKA Solution">
      <div className="brand-preloader-content" aria-hidden="true">
        <div className="brand-preloader-stage">
          <span className="brand-preloader-orbit" />
          <span className="brand-preloader-orbit brand-preloader-orbit--inner" />
          <BrandLogo layout="symbol" className="brand-preloader-symbol" decorative priority />
        </div>
        <BrandLogo layout="wordmark" inverse className="brand-preloader-wordmark" decorative />
        <p className="brand-preloader-caption">Thoughtful design. Useful technology.</p>
        <span className="brand-preloader-track"><span /></span>
        <span className="brand-preloader-note">{leaving ? 'Ready to explore' : 'Welcome to EKA'}</span>
      </div>
    </div>
  );
}
