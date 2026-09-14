import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';

export default function CustomCursor() {
  const [isHovered, setIsHovered] = useState(false);
  const [hoverType, setHoverType] = useState('default');
  const [isClicked, setIsClicked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Position and its trailing ring move every mousemove and every animation frame — far
  // too often to route through React state. Doing that used to re-render this whole tree
  // (and re-run its class-name template strings) 60+ times a second on any desktop, which
  // a Windows laptop or a lower-power machine feels as steady jank even without a scroll
  // in progress. The pointer and the ring stage are only ever moved by writing straight to
  // their own `style.transform`, the same way `TiltCard` and `useParallax` already do
  // elsewhere on the site — nothing here schedules a re-render for a pixel of movement.
  const posRef = useRef({ x: -100, y: -100 });
  const trailRef = useRef({ x: -100, y: -100 });
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const visibleRef = useRef(false);

  // The dot and ring only mount once `isVisible` flips true, by which point `posRef` (and
  // usually `trailRef`) already hold the real pointer position. Seed their transform here,
  // before the browser paints, rather than reading `.current` during render — so the first
  // frame lands at the pointer instead of at the -100/-100 rest position and then jumping.
  useLayoutEffect(() => {
    if (!isVisible) return;
    if (dotRef.current) {
      const { x, y } = posRef.current;
      dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
    if (ringRef.current) {
      const { x, y } = trailRef.current;
      ringRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }
  }, [isVisible]);

  useEffect(() => {
    // Only run on devices with fine pointer (mouse)
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    let animId = null;
    let lastTarget = null;

    const updateTrail = () => {
      animId = null;
      if (!visibleRef.current) return;
      const trail = trailRef.current;
      const dx = posRef.current.x - trail.x;
      const dy = posRef.current.y - trail.y;
      trail.x += dx * 0.22;
      trail.y += dy * 0.22;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0)`;
      }
      // The ring only needs frames while it is actually catching the pointer. Once it has
      // converged, sleep until the next mouse event instead of waking React's main thread
      // sixty times a second for a transform that no longer changes.
      if (Math.abs(dx) + Math.abs(dy) > 0.08) {
        animId = requestAnimationFrame(updateTrail);
      }
    };

    const wakeTrail = () => {
      if (animId === null) animId = requestAnimationFrame(updateTrail);
    };

    const onMouseMove = (e) => {
      if (!visibleRef.current) {
        visibleRef.current = true;
        setIsVisible(true);
      }
      posRef.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }

      // Check hovered element
      const target = e.target.closest('button, a, input, textarea, [data-cursor], .perspective-card, select, summary');
      if (target !== lastTarget) {
        lastTarget = target;
        setIsHovered(Boolean(target));
        setHoverType(target?.getAttribute('data-cursor') || (target ? 'pointer' : 'default'));
      }
      wakeTrail();
    };

    const onMouseDown = () => setIsClicked(true);
    const onMouseUp = () => setIsClicked(false);
    const onMouseLeave = () => {
      visibleRef.current = false;
      setIsVisible(false);
      if (animId !== null) cancelAnimationFrame(animId);
      animId = null;
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    document.addEventListener('mouseleave', onMouseLeave);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('mouseleave', onMouseLeave);
      if (animId !== null) cancelAnimationFrame(animId);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden" aria-hidden="true">
      {/* 1. Main Center Sharp Pointer Arrow (Exact match to screenshot with Electric Cyan Accent) */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 transition-transform duration-75 ease-out ${
          isClicked ? 'scale-90 -rotate-6' : 'scale-100 rotate-0'
        }`}
        style={{
          transform: 'translate3d(-100px, -100px, 0)',
          willChange: 'transform',
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_4px_12px_rgba(27,34,82,0.35)] select-none"
        >
          {/* Outer stroke for crisp contrast across all backgrounds */}
          <path
            d="M 1.5 1.5 L 1.5 19.5 L 5.8 15.2 L 10.2 23.5 L 13.5 21.8 L 9.2 13.5 L 16.5 13.5 Z"
            fill="#1B2252"
            stroke="#F7F6F1"
            strokeWidth="1.4"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Inner accent dot */}
          <circle cx="5" cy="5" r="1.2" fill="#F7F6F1" />
        </svg>
      </div>

      {/* 2. Trailing Smooth Round Ring (Magnetic Follower) — uses mix-blend-mode:difference so it stays visible against both the ivory canvas and any deliberate dark section */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 -translate-x-1/2 -translate-y-1/2 rounded-full border transition-all duration-300 ease-out flex items-center justify-center ${
          isHovered
            ? 'h-14 w-14 bg-white/15 border-white scale-110'
            : 'h-9 w-9 bg-white/[0.04] border-white/60 scale-100'
        } ${isClicked ? 'scale-75 border-white bg-white/25' : ''}`}
        style={{
          transform: 'translate3d(-100px, -100px, 0)',
          willChange: 'transform',
          mixBlendMode: 'difference',
        }}
      >
        {isHovered && hoverType === 'flip' && (
          <span className="text-[9px] font-bold font-mono tracking-widest uppercase text-white">
            FLIP
          </span>
        )}
        {isHovered && hoverType === 'view' && (
          <span className="text-[9px] font-bold font-mono tracking-widest uppercase text-white">
            VIEW
          </span>
        )}
        {isHovered && hoverType === 'chat' && (
          <span className="text-[9px] font-bold font-mono tracking-widest uppercase text-white">
            CHAT
          </span>
        )}
      </div>
    </div>
  );
}
