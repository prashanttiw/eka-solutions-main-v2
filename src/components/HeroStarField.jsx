import React from 'react';

// Fixed SVG points keep the night field inexpensive. A small, deterministic subset has
// its own CSS twinkle, so the sky feels alive without a timer or another render loop.
const LAYERS = Array.from({ length: 3 }, (_, layer) =>
  Array.from({ length: 30 }, (_, index) => {
    const seed = index * 3 + layer + 1;
    const random = (salt) => {
      const value = Math.sin(seed * 127.1 + salt * 311.7) * 43758.5453;
      return value - Math.floor(value);
    };
    return {
      x: 18 + random(1) * 1404,
      y: 25 + random(2) * 830,
      radius: 0.55 + random(3) * 0.8,
      opacity: 0.3 + random(4) * 0.6,
      twinkle: (index * 3 + layer) % 7 === 0,
      white: (index + layer * 2) % 4 === 0,
      duration: 2.2 + random(5) * 3.4,
      delay: -random(6) * 5.5,
    };
  }),
);

export default function HeroStarField() {
  return (
    <div className="hero-starfield" aria-hidden="true">
      {LAYERS.map((stars, layer) => (
        <svg
          key={layer}
          className="hero-star-layer"
          viewBox="0 0 1440 900"
          preserveAspectRatio="none"
        >
          {stars.map((star, index) => (
            <g key={index} transform={`translate(${star.x} ${star.y})`}>
              <g
                className={star.twinkle ? 'hero-star hero-star--twinkle' : 'hero-star'}
                style={{
                  '--star-opacity': star.opacity,
                  '--star-dim': (star.opacity * 0.38).toFixed(2),
                  '--star-bright': Math.min(1, star.opacity + 0.25).toFixed(2),
                  '--star-duration': `${star.duration.toFixed(2)}s`,
                  '--star-delay': `${star.delay.toFixed(2)}s`,
                }}
              >
                <circle r={star.radius} fill={star.white ? '#f5f8ff' : '#a7bce9'} />
                {index % 13 === 0 && (
                  <>
                    <circle r="4" fill="#dbe9ff" opacity="0.08" />
                    <path d="M-4 0H4M0-4V4" stroke="#f3f7ff" strokeWidth="0.5" opacity="0.72" />
                  </>
                )}
              </g>
            </g>
          ))}
        </svg>
      ))}
      <span className="hero-planet hero-planet-ice" />
      <span className="hero-planet hero-planet-ring" />
      <span className="hero-planet hero-planet-dusk" />
    </div>
  );
}
