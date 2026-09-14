import React from 'react';

/**
 * The pictures.
 *
 * A newspaper cannot print a photograph. It prints a *screen* — the image is
 * broken into dots whose size varies with how dark that patch of the picture is,
 * and the eye reassembles them into tone. That is the single thing that makes a
 * printed picture look printed, and it is why a photograph with a sepia filter
 * over it never reads as newsprint.
 *
 * So these are real halftones. Each subject is drawn as flat SVG with gradient
 * fills, and the filter below converts that drawing into a dot screen at print
 * time. Nothing here is an image file: there are no photographs this company is
 * entitled to publish, and a drawn engraving is the honest form for a page whose
 * whole argument is that we do not overstate what we have.
 *
 * How the filter works, in order:
 *   1  luminanceToAlpha   — reduce the drawing to a single tonal channel
 *   2  invert             — so alpha now means "ink wanted here", not "light"
 *   3  move it into RGB   — arithmetic compositing works on colour, not alpha
 *   4  feImage + feTile   — lay down an infinite screen of soft round dots
 *   5  density + screen−1 — the classic halftone threshold: ink appears where
 *                           the wanted density overtakes the dot's falloff, so
 *                           a dark patch grows fat dots and a pale one leaves
 *                           pinpricks
 *   6  amplify to binary  — a press is either inked or it is not
 *   7  flood with ink     — dots come out in the newsprint indigo, on nothing,
 *                           so the paper and its fibre show through between them
 */

const DOT = (size) =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'%3E%3Cdefs%3E%3CradialGradient id='g'%3E%3Cstop offset='0' stop-color='%23fff'/%3E%3Cstop offset='1' stop-color='%23000'/%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='${size}' height='${size}' fill='%23000'/%3E%3Ccircle cx='${size / 2}' cy='${size / 2}' r='${size / 2}' fill='url(%23g)'/%3E%3C/svg%3E`;

function Screen({ id, pitch }) {
  return (
    <filter id={id} x="0%" y="0%" width="100%" height="100%" colorInterpolationFilters="sRGB">
      <feColorMatrix type="luminanceToAlpha" in="SourceGraphic" result="lum" />
      <feComponentTransfer in="lum" result="dens">
        <feFuncA type="table" tableValues="1 0" />
      </feComponentTransfer>
      <feColorMatrix
        in="dens"
        type="matrix"
        result="densRGB"
        values="0 0 0 1 0  0 0 0 1 0  0 0 0 1 0  0 0 0 0 1"
      />
      <feImage x="0" y="0" width={pitch} height={pitch} result="tile" href={DOT(pitch)} />
      <feTile in="tile" result="screen" />
      <feComposite in="densRGB" in2="screen" operator="arithmetic" k1="0" k2="1" k3="1" k4="-1" result="sum" />
      <feColorMatrix
        in="sum"
        type="matrix"
        result="mask"
        values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0"
      />
      <feComponentTransfer in="mask" result="hard">
        <feFuncA type="linear" slope="60" intercept="0" />
      </feComponentTransfer>
      <feFlood floodColor="var(--np-ink, #14183A)" result="ink" />
      <feComposite in="ink" in2="hard" operator="in" />
    </filter>
  );
}

/**
 * Mounted once per page. Filters and patterns are referenced by id from every
 * plate, so defining them per-picture would put four identical copies of the
 * screen in the document and make the dot pitch impossible to change in one
 * place.
 */
export function PlateDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" focusable="false" style={{ position: 'absolute' }}>
      <defs>
        <Screen id="np-screen" pitch={5} />
        <Screen id="np-screen-fine" pitch={3.4} />

        {/* Engraver's hatch, three densities — the older way of printing tone,
            kept for the small marks where a dot screen would be too coarse. */}
        <pattern id="np-hatch-a" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="var(--np-ink, #14183A)" strokeWidth="0.7" />
        </pattern>
        <pattern id="np-hatch-b" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="4" stroke="var(--np-ink, #14183A)" strokeWidth="1.7" />
        </pattern>
        <pattern id="np-hatch-c" width="3.4" height="3.4" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
          <line x1="0" y1="0" x2="0" y2="3.4" stroke="var(--np-ink, #14183A)" strokeWidth="1.9" />
        </pattern>
      </defs>
    </svg>
  );
}

/* ---------------------------------------------------------------------------
   The four subjects.

   Each is drawn in greyscale — white is bare paper, black is solid ink — because
   the filter reads luminance and nothing else. Gradients rather than flat fills
   throughout: a flat fill screens to one uniform dot size, which looks like
   clip-art with a pattern over it, while a gradient screens to a tonal ramp,
   which is what a printed picture actually looks like.
   --------------------------------------------------------------------------- */

const SUBJECTS = {
  /* Orient — a surveyor's compass over contour lines. The instrument you use
     before you build anything: it tells you where you actually are. */
  orient: (
    <>
      <defs>
        <radialGradient id="np-o-sky" cx="34%" cy="26%" r="86%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#c9c9c9" />
          <stop offset="1" stopColor="#6f6f6f" />
        </radialGradient>
        <linearGradient id="np-o-dial" x1="0" y1="0" x2="0.7" y2="1">
          <stop offset="0" stopColor="#f4f4f4" />
          <stop offset="1" stopColor="#9a9a9a" />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill="url(#np-o-sky)" />
      {[64, 52, 40].map((r) => (
        <circle key={r} cx="100" cy="76" r={r} fill="none" stroke="#7d7d7d" strokeWidth="0.9" opacity="0.85" />
      ))}
      <circle cx="100" cy="76" r="46" fill="url(#np-o-dial)" stroke="#1c1c1c" strokeWidth="1.6" />
      {/* the graduated ring */}
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i * 10 * Math.PI) / 180;
        const long = i % 9 === 0;
        const r1 = long ? 34 : 39;
        return (
          <line
            key={i}
            x1={100 + Math.sin(a) * r1}
            y1={76 - Math.cos(a) * r1}
            x2={100 + Math.sin(a) * 44}
            y2={76 - Math.cos(a) * 44}
            stroke="#242424"
            strokeWidth={long ? 1.5 : 0.7}
          />
        );
      })}
      {/* needle: one half solid, one half open, as a compass needle is */}
      <path d="M100 34 L108 76 L100 118 L92 76 Z" fill="#efefef" stroke="#1a1a1a" strokeWidth="1.1" />
      <path d="M100 34 L108 76 L100 76 Z" fill="#141414" />
      <path d="M100 118 L92 76 L100 76 Z" fill="#141414" />
      <circle cx="100" cy="76" r="5.5" fill="#f6f6f6" stroke="#141414" strokeWidth="1.4" />
      <circle cx="100" cy="76" r="1.8" fill="#141414" />
    </>
  ),

  /* Design — the drawing board. A set square, a french curve and a plan, which
     is where the decisions get made while they are still cheap. */
  design: (
    <>
      <defs>
        <linearGradient id="np-d-board" x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#fdfdfd" />
          <stop offset="1" stopColor="#b4b4b4" />
        </linearGradient>
        <linearGradient id="np-d-square" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a8a8a" />
          <stop offset="1" stopColor="#2f2f2f" />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill="#dcdcdc" />
      {/* the sheet on the board, in perspective */}
      <path d="M26 132 L44 26 L182 34 L172 138 Z" fill="url(#np-d-board)" stroke="#1e1e1e" strokeWidth="1.4" />
      {/* the plan drawn on it */}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={`h${i}`} x1={30 + i * 1.6} y1={118 - i * 13} x2={178 - i * 1.2} y2={124 - i * 13} stroke="#9b9b9b" strokeWidth="0.6" />
      ))}
      <rect x="62" y="56" width="52" height="42" fill="none" stroke="#3a3a3a" strokeWidth="1.5" />
      <rect x="72" y="66" width="20" height="22" fill="#6e6e6e" />
      <path d="M62 56 L88 40 L114 56" fill="none" stroke="#3a3a3a" strokeWidth="1.5" />
      {/* the set square laid across it */}
      <path d="M104 128 L104 58 L172 128 Z" fill="url(#np-d-square)" opacity="0.92" stroke="#141414" strokeWidth="1.3" />
      <path d="M110 122 L110 74 L156 122 Z" fill="#e6e6e6" />
      {/* the french curve */}
      <path
        d="M34 108 Q40 62 84 52 Q112 46 120 30"
        fill="none"
        stroke="#141414"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path d="M34 108 Q40 62 84 52 Q112 46 120 30" fill="none" stroke="#dedede" strokeWidth="2.2" strokeLinecap="round" />
    </>
  ),

  /* Build — the press itself, and the case of type beside it. Two-week
     increments, each ending in something actually pulled off the machine. */
  build: (
    <>
      <defs>
        <linearGradient id="np-b-frame" x1="0" y1="0" x2="0.2" y2="1">
          <stop offset="0" stopColor="#e8e8e8" />
          <stop offset="1" stopColor="#4a4a4a" />
        </linearGradient>
        <linearGradient id="np-b-bed" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c6c6c6" />
          <stop offset="1" stopColor="#2b2b2b" />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill="#e4e4e4" />
      {/* uprights and the head */}
      <rect x="34" y="16" width="14" height="104" fill="url(#np-b-frame)" stroke="#141414" strokeWidth="1.2" />
      <rect x="152" y="16" width="14" height="104" fill="url(#np-b-frame)" stroke="#141414" strokeWidth="1.2" />
      <rect x="28" y="14" width="144" height="13" fill="#232323" />
      {/* the screw and the bar */}
      <rect x="94" y="27" width="12" height="30" fill="#3d3d3d" />
      <rect x="66" y="34" width="68" height="5" fill="#151515" />
      {/* the platen */}
      <rect x="62" y="57" width="76" height="15" fill="url(#np-b-frame)" stroke="#141414" strokeWidth="1.2" />
      {/* the bed, with a forme of type locked up in it */}
      <rect x="46" y="86" width="108" height="34" fill="url(#np-b-bed)" stroke="#141414" strokeWidth="1.3" />
      {Array.from({ length: 5 }, (_, c) =>
        Array.from({ length: 2 }, (_, r) => (
          <rect
            key={`${c}-${r}`}
            x={54 + c * 19}
            y={92 + r * 13}
            width={14}
            height={9}
            fill={(c + r) % 3 === 0 ? '#f2f2f2' : (c + r) % 3 === 1 ? '#8f8f8f' : '#1a1a1a'}
          />
        )),
      )}
      <rect x="22" y="120" width="156" height="12" fill="#1d1d1d" />
      <rect x="14" y="132" width="172" height="8" fill="#0f0f0f" />
    </>
  ),

  /* Run — the light kept on. Operating something after it ships is the part
     that decides whether any of the rest of it mattered. */
  run: (
    <>
      <defs>
        <linearGradient id="np-r-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3c3c3c" />
          <stop offset="0.62" stopColor="#b8b8b8" />
          <stop offset="1" stopColor="#efefef" />
        </linearGradient>
        <linearGradient id="np-r-tower" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fafafa" />
          <stop offset="0.55" stopColor="#d0d0d0" />
          <stop offset="1" stopColor="#5c5c5c" />
        </linearGradient>
        <linearGradient id="np-r-beam" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="np-r-sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8e8e8e" />
          <stop offset="1" stopColor="#1c1c1c" />
        </linearGradient>
      </defs>
      <rect width="200" height="150" fill="url(#np-r-sky)" />
      {/* the sweep, both sides */}
      <path d="M100 40 L200 8 L200 66 Z" fill="url(#np-r-beam)" />
      <path d="M100 40 L0 12 L0 68 Z" fill="url(#np-r-beam)" opacity="0.75" />
      {/* sea */}
      <rect y="108" width="200" height="42" fill="url(#np-r-sea)" />
      {Array.from({ length: 5 }, (_, i) => (
        <rect key={i} x={(i % 2) * 14} y={114 + i * 7} width={200} height={1.6} fill="#e2e2e2" opacity={0.5 - i * 0.07} />
      ))}
      {/* the rock */}
      <path d="M58 118 Q100 100 142 118 L142 128 L58 128 Z" fill="#161616" />
      {/* the tower */}
      <path d="M86 118 L91 50 L109 50 L114 118 Z" fill="url(#np-r-tower)" stroke="#141414" strokeWidth="1.3" />
      {[62, 78, 96].map((y, i) => (
        <rect key={y} x={87.6 + i * 0.9} y={y} width={24.8 - i * 1.8} height={6} fill="#2a2a2a" opacity="0.9" />
      ))}
      {/* the lantern room */}
      <rect x="88" y="32" width="24" height="18" fill="#fbfbfb" stroke="#141414" strokeWidth="1.3" />
      <rect x="91" y="36" width="18" height="10" fill="#ffffff" />
      <path d="M86 32 L100 20 L114 32 Z" fill="#1e1e1e" />
      <rect x="84" y="49" width="32" height="4" fill="#141414" />
    </>
  ),
};

/**
 * One picture, screened and framed.
 *
 * `fine` switches to the tighter screen for small reproductions — a 5px dot on a
 * picture 160px wide is a poster, not a photograph.
 */
export default function NewsPlate({ subject, ratio = 'wide', fine = false, className = '' }) {
  const art = SUBJECTS[subject];
  if (!art) return null;

  const shape = ratio === 'tall' ? 'np-plate--tall' : ratio === 'square' ? '' : 'np-plate--wide';

  return (
    <div className={`np-plate ${shape} ${className}`.trim()}>
      <svg viewBox="0 0 200 150" preserveAspectRatio="xMidYMid slice" role="presentation">
        <g filter={`url(#${fine ? 'np-screen-fine' : 'np-screen'})`}>{art}</g>
      </svg>
    </div>
  );
}
