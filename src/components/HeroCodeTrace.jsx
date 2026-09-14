import React from 'react';

// Decorative engineering fragments, not live telemetry or company performance claims.
// Anchors stay inside the viewport while the globe expands past them.
const TRACES = [
  ['import { vision }', 'from "@eka/core";', 'await build(vision);'],
  ['// distributed by design', 'edge → cloud → core', 'system.connect();'],
  ['const release = await', 'pipeline.validate();', 'release.deploy();'],
  ['interface Platform {', '  scale: "with you";', '}'],
  ['// ideas into systems', 'git checkout -b next', 'build · test · ship'],
  ['request → service', '        ↳ event', '        ↳ response'],
];

export default function HeroCodeTrace() {
  return (
    <div aria-hidden="true" className="hero-traces pointer-events-none absolute z-[2]">
      {TRACES.map((lines, index) => (
        <div className={`hero-trace hero-trace-${index + 1}`} key={index}>
          <div
            className="hero-trace-cycle"
            style={{
              '--trace-delay': `${-index * 2.15}s`,
              '--trace-duration': `${12 + (index % 3) * 0.7}s`,
            }}
          >
            {lines.map((line, row) => (
              <div key={row} style={{ opacity: 1 - row * 0.18 }}>{line}</div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
