import React, { useMemo } from 'react';

/**
 * A blue-ink field sketch, drawn procedurally, straight onto the page.
 *
 * The reference book is full of hand-drawn plates, and the whole illusion depends on the
 * pages carrying *drawings* rather than UI. Real screenshots of our own work will go here
 * eventually; until then these stand in — and they stand in honestly, because a generated
 * system sketch is what an engineer's notebook would actually contain, where a stock photo
 * of a laptop would not.
 *
 * The thing that separates a sketch from a diagram is density. An early version drew six
 * clean rectangles on a baseline and read as an empty bar chart; what fixes it is the
 * stuff around the subject — a receding ground plane, figures at the base for scale,
 * hatching in the shadows, annotation with leader lines. The subject is maybe a third of
 * the marks on the page.
 *
 * Everything is seeded from the project id, so a given project always draws the same plate
 * across reloads. An unseeded `Math.random()` here would redraw the page mid-turn.
 *
 * Nothing is traced from the reference — the subject is our own: structures, buses and
 * annotation, not somebody else's travel journal.
 */

/** mulberry32 — small, fast, and good enough that adjacent seeds do not correlate. */
function makeRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(value) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const W = 560;
const H = 720;

export default function InkPlate({ seed = 'eka', label = '', className = '' }) {
  const plate = useMemo(() => {
    const rand = makeRandom(hashString(seed));
    const between = (lo, hi) => lo + rand() * (hi - lo);

    const horizon = H * 0.585;
    // The vanishing point sits a little off centre and above the horizon, which is what
    // stops the ground plane reading as a symmetrical technical drawing.
    const vp = { x: W * between(0.4, 0.6), y: horizon - between(6, 22) };

    // The subject: a run of structures along the horizon, overlapping. Drawn back to
    // front so nearer ones occlude further ones — the single cheapest way to get depth.
    const blocks = [];
    let x = 18;
    while (x < W - 54) {
      const w = between(46, 96);
      const h = between(96, 300);
      blocks.push({
        x,
        y: horizon - h,
        w,
        h,
        cols: Math.round(between(2, 4)),
        rows: Math.round(between(3, 8)),
        roof: rand() > 0.35,
        tier: rand() > 0.55 ? between(0.24, 0.44) : 0,
        skew: between(-1.1, 1.1),
      });
      // Deliberately tighter than the widths, so the run overlaps rather than lining up
      // as separate bars.
      x += w * between(0.52, 0.86);
    }

    // Receding ground lines, all aimed at the vanishing point.
    const ground = Array.from({ length: 13 }, (_, i) => {
      const t = i / 12;
      return { x: -W * 0.35 + t * (W * 1.7), y: H * between(0.94, 0.99) };
    });

    // Cross-ties on the ground, spaced on a perspective falloff so they crowd toward the
    // horizon the way real receding lines do.
    const ties = Array.from({ length: 9 }, (_, i) => {
      const t = (i + 1) / 10;
      const e = Math.pow(t, 2.1);
      return { y: horizon + e * (H * 0.95 - horizon), wobble: between(-4, 4) };
    });

    // Figures at the base. Nothing gives a drawn structure scale like a person in front
    // of it, and at this size a figure is two strokes.
    const figures = Array.from({ length: Math.round(between(7, 12)) }, () => {
      const fy = horizon + between(10, 118);
      const scale = 0.5 + (fy - horizon) / 150;
      return { x: between(38, W - 38), y: fy, h: between(20, 30) * scale };
    });

    // Shadow hatching under the run of structures.
    const hatch = Array.from({ length: 70 }, () => {
      const hx = between(14, W - 14);
      const hy = between(horizon + 4, H - 26);
      const len = between(12, 46) * (0.5 + (hy - horizon) / 220);
      return { x: hx, y: hy, dx: len * 0.78, dy: len * 0.3 };
    });

    // Annotation: a short rule with a leader line back to the subject, the way a working
    // sketch is marked up.
    const notes = Array.from({ length: 4 }, (_, i) => {
      const ny = between(58, horizon - 190) + i * 12;
      const left = rand() > 0.5;
      const nx = left ? between(20, 80) : between(W - 190, W - 120);
      return {
        x: nx,
        y: ny,
        w: between(58, 116),
        leadTo: { x: between(W * 0.32, W * 0.68), y: between(horizon - 170, horizon - 40) },
      };
    });

    // Sky: a few loose horizontal strokes, no more than a suggestion of cloud.
    const sky = Array.from({ length: 9 }, () => ({
      x: between(20, W - 120),
      y: between(30, horizon - 250),
      w: between(40, 120),
    }));

    return {
      horizon,
      vp,
      blocks,
      ground,
      ties,
      figures,
      hatch,
      notes,
      sky,
      stampRotate: between(-10, 10),
      stampX: between(W - 132, W - 92),
      stampY: between(44, 76),
    };
  }, [seed]);

  const filterId = `ink-wobble-${seed}`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={label ? `Ink sketch of the ${label} system` : 'Ink sketch'}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {/* The wobble. A perfectly straight machine-drawn line is the single thing that
            gives a "hand-drawn" illustration away, so every stroke goes through a
            low-frequency displacement — the same trick the paper texture uses, coarser. */}
        <filter id={filterId} x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="3.6" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* The plate fades at its outer edges rather than stopping on a hard rectangle —
            a drawing on a page has no frame. */}
        <linearGradient id={`fade-${seed}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff" stopOpacity="0" />
          <stop offset="9%" stopColor="#fff" stopOpacity="1" />
          <stop offset="93%" stopColor="#fff" stopOpacity="1" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id={`mask-${seed}`}>
          <rect width={W} height={H} fill={`url(#fade-${seed})`} />
        </mask>
      </defs>

      <g mask={`url(#mask-${seed})`}>
        <g
          filter={`url(#${filterId})`}
          fill="none"
          stroke="var(--blue)"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Sky marks */}
          {plate.sky.map((s, i) => (
            <path
              key={`s${i}`}
              d={`M${s.x} ${s.y} q ${s.w / 2} ${-5} ${s.w} 1`}
              strokeWidth="1.1"
              opacity="0.22"
            />
          ))}

          {/* Ground plane, receding to the vanishing point */}
          {plate.ground.map((g, i) => (
            <line
              key={`g${i}`}
              x1={g.x}
              y1={g.y}
              x2={plate.vp.x}
              y2={plate.vp.y}
              strokeWidth="0.9"
              opacity="0.3"
            />
          ))}
          {plate.ties.map((t, i) => (
            <line
              key={`t${i}`}
              x1={10 + t.wobble}
              y1={t.y}
              x2={W - 10 + t.wobble}
              y2={t.y + 2}
              strokeWidth="0.9"
              opacity="0.26"
            />
          ))}

          {/* Horizon */}
          <line
            x1="10"
            y1={plate.horizon}
            x2={W - 10}
            y2={plate.horizon}
            strokeWidth="1.5"
            opacity="0.55"
          />

          {/* The structures. Filled with the paper colour so a nearer one genuinely
              occludes the one behind rather than showing its lines through. */}
          {plate.blocks.map((b, i) => (
            <g key={`b${i}`} transform={`rotate(${b.skew} ${b.x + b.w / 2} ${b.y + b.h})`}>
              <rect
                x={b.x}
                y={b.y}
                width={b.w}
                height={b.h}
                fill="var(--paper)"
                strokeWidth="1.9"
                opacity="0.98"
              />
              {b.roof && (
                <path
                  d={`M${b.x - 9} ${b.y + 6} L${b.x + b.w / 2} ${b.y - 14} L${b.x + b.w + 9} ${b.y + 6} Z`}
                  fill="var(--paper)"
                  strokeWidth="1.7"
                />
              )}
              {b.tier > 0 && (
                <line
                  x1={b.x}
                  y1={b.y + b.h * b.tier}
                  x2={b.x + b.w}
                  y2={b.y + b.h * b.tier}
                  strokeWidth="1.5"
                  opacity="0.7"
                />
              )}
              {/* Window grid — the texture that reads as a façade rather than as fill */}
              {Array.from({ length: b.rows }).map((_, r) =>
                Array.from({ length: b.cols }).map((__, c) => {
                  const cw = (b.w - 12) / b.cols;
                  const ch = (b.h - 14) / b.rows;
                  return (
                    <rect
                      key={`${r}-${c}`}
                      x={b.x + 6 + c * cw + cw * 0.18}
                      y={b.y + 8 + r * ch + ch * 0.18}
                      width={cw * 0.64}
                      height={ch * 0.5}
                      strokeWidth="0.85"
                      opacity="0.4"
                    />
                  );
                }),
              )}
            </g>
          ))}

          {/* Figures for scale */}
          {plate.figures.map((f, i) => (
            <g key={`f${i}`} opacity="0.62">
              <line x1={f.x} y1={f.y} x2={f.x} y2={f.y - f.h * 0.55} strokeWidth="1.5" />
              <circle cx={f.x} cy={f.y - f.h * 0.72} r={f.h * 0.16} strokeWidth="1.3" />
              <line x1={f.x} y1={f.y - f.h * 0.3} x2={f.x - f.h * 0.16} y2={f.y} strokeWidth="1.2" />
              <line x1={f.x} y1={f.y - f.h * 0.3} x2={f.x + f.h * 0.16} y2={f.y} strokeWidth="1.2" />
            </g>
          ))}

          {/* Shadow hatching */}
          {plate.hatch.map((h, i) => (
            <line
              key={`h${i}`}
              x1={h.x}
              y1={h.y}
              x2={h.x + h.dx}
              y2={h.y + h.dy}
              strokeWidth="0.95"
              opacity="0.28"
            />
          ))}

          {/* Annotation with leader lines */}
          {plate.notes.map((n, i) => (
            <g key={`n${i}`} opacity="0.34">
              <line x1={n.x} y1={n.y} x2={n.x + n.w} y2={n.y} strokeWidth="1.1" />
              <line x1={n.x} y1={n.y + 7} x2={n.x + n.w * 0.62} y2={n.y + 7} strokeWidth="1.1" />
              <path
                d={`M${n.x + n.w * 0.5} ${n.y + 10} L${n.leadTo.x} ${n.leadTo.y}`}
                strokeWidth="0.8"
                strokeDasharray="3 4"
              />
              <circle cx={n.leadTo.x} cy={n.leadTo.y} r="2.4" strokeWidth="1.1" />
            </g>
          ))}
        </g>
      </g>

      {/* The chop. Every page in the reference carries a red seal; ours is the one warm
          mark on an otherwise entirely blue plate, which is what keeps it from reading as
          a printout. */}
      <g
        transform={`translate(${plate.stampX} ${plate.stampY}) rotate(${plate.stampRotate})`}
        opacity="0.6"
      >
        <rect x="0" y="0" width="52" height="52" rx="5" fill="none" stroke="#B4483C" strokeWidth="2.8" />
        <image href="/brand/eka-symbol.webp" x="13" y="6" width="26" height="22" aria-hidden="true" />
        <line x1="10" y1="31" x2="42" y2="31" stroke="#B4483C" strokeWidth="1.5" />
        <text
          x="26"
          y="44"
          textAnchor="middle"
          fill="#B4483C"
          fontSize="10.5"
          fontFamily="'JetBrains Mono', monospace"
        >
          {String(hashString(seed) % 100).padStart(2, '0')}
        </text>
      </g>
    </svg>
  );
}
