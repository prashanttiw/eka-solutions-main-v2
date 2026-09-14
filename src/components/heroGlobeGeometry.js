/**
 * Geometry for the hero globe. Pure maths — no Three.js, no DOM — so the renderer stays
 * readable and this stays testable in isolation.
 *
 * Everything is built once per breakpoint and handed to the GPU as buffers. Nothing here
 * runs per frame; the sweep, the ignition and the stretching all happen in the shaders off
 * a handful of uniforms.
 */

export const TAU = Math.PI * 2;

export const CONFIG = {
  specks: { desktop: 2800, tablet: 2300, mobile: 1500 },
  seed: 0x42f0e1,

  // The camera moves from the small opening globe through the surface-detail beat,
  // then pushes into the expanded mesh as the night field exits.
  // `camDist` mirrors `rest` so the speck sizes below are in CSS px at the opening frame.
  camera: { rest: 6.6, detail: 4.6, inside: 1.55 },
  camDist: 6.6,
  fov: 38,

  // Responsive scene offsets are in sphere radii. The desktop composition stays central;
  // narrow layouts move the first beat upward to keep the copy and sphere legible.
  offset: {
    wide: { x: 0, y: -0.04 },
    narrow: { x: 0, y: 0.04 },
  },

  yawSpeed: 0.000032,
  pitchWobble: 0.05,
  parallax: 0.075,
  scrollSpin: 0.28,
  scrollSensitivity: 1,
  damping: 7.5,
  velocityPush: 0.045,

  cage: {
    // Transparent geodesic net wrapping the earth. Hairline ice, not a cyan tube —
    // the surface specks stay as they are; this is only the faint grid and its stars.
    scale: 1.12,
    detail: 2,
    linePx: 0.65,
    alpha: [0.10, 0.28],
    warp: 0.0,
    nodeSize: [1.6, 5.5],
  },

  // The outer geodesic frame. `tick` is the faint charge on every strut; `flow` is the
  // light that runs each edge from one node to the other. Both run at rest, not only
  // once the camera is inside the shell.
  net: { tick: 0.0021, flow: 0.00046, bfs: 0.00042 },

  speck: {
    size: [4.8, 9.2],
    alpha: [1.25, 2.1],
    shell: [0.12, 0.82],
  },

  // Bloom runs on an HDR buffer, so the threshold is in accumulated energy rather than
  // display brightness: specks stack additively well above 1.0 where they cluster, and
  // only those cores are allowed to bleed. `spread` is in quarter-res texels per blur tap.
  bloom: {
    enabled: true,
    threshold: 0.32,
    knee: 0.3,
    strength: 1.0,
    spread: 0.7,
    passes: 2,
  },

  // Dust the globe is suspended in. Sits outside the shell in its own slowly counter-
  // rotating group, so it parallaxes against the sphere instead of travelling with it.
  //
  // The outer radius is kept close deliberately. A field spread over a large sphere puts
  // almost all of itself outside a 38-degree frustum — at radius 8 only about one mote in
  // thirty is ever on screen, which is why a field of several hundred reads as empty space.
  motes: {
    desktop: 130,
    tablet: 90,
    mobile: 50,
    shell: [2.6, 8.4],
    size: [1.15, 4.6],
    alpha: 0.38,
    spin: 0.0000075,
  },

  // Cursor ignition. `radius` is a chord length on the unit sphere, so 0.5 is roughly a
  // 30-degree cap around the point the cursor is over.
  pointerGlow: { radius: 0.52, gain: 0.85 },

  breathe: { amount: 0.006, speed: 0.00034 },

  // Noise warp that keeps the shell from sitting as a perfect sphere. `amount` is a fraction
  // of radius for the large lobes; `ripple` is the finer, faster crawl on top. `swirl` slides
  // points in the tangent plane so the silhouette sloshes instead of only breathing in/out.
  // The travelling current shares the same field as the specks so the line stays welded
  // to the dots it ignites, rather than peeling off into a second outline.
  morph: {
    amount: 0.075,
    freq: 1.45,
    speed: 0.22,
    ripple: 0.018,
    rippleFreq: 3.8,
    rippleSpeed: 0.52,
    swirl: 0.058,
  },

  // Slow cyan ↔ magenta drift across every lit layer. Strength is a mix factor against the
  // layer's own colour, so the ramp still reads as heat — only the temperature shifts.
  tint: { speed: 0.00018, strength: 0.12 },

  // One travelling current. A second path would draw another line, and the whole point
  // of the sweep is a single head the specks and the net can answer.
  currents: [
    { tilt: 0.52, spin: 0.0, speed: 0.00048, tail: 4.8, sparkTail: 1.85,
      wander: [0.13, 3, 0.07, 7, 0.035, 13, 0.018, 23] },
  ],
  currentSamples: 340,
  sparkRadius: 0.13, // rad — slightly wider so more particles catch the current glow

  // The line itself, as a ribbon whose half-width is in radians of arc.
  line: { widthBase: 0.002, widthGain: 0.012, taper: 1.55 },

  mesh: {
    radius: 0.19, // rad — how far from a current a speck can join a cluster
    clusters: 56,
    tris: [1, 3], // inclusive range of triangles per cluster — up to 3 for more variety
    tail: 1.4, // rad of the loop a cluster stays lit behind the head
    stretch: 0.42, // how far a cluster expands about its own centroid, in the surface
    edgeWidth: 0.006,
  },

  lattice: { jitter: 2.4 },
};

let random = Math.random;

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let n = state;
    n = Math.imul(n ^ (n >>> 15), n | 1);
    n ^= n + Math.imul(n ^ (n >>> 7), n | 61);
    return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
  };
}

const norm = (v) => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const cross = (a, b) => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** The part of `v` that lies in the tangent plane at `n` — `n` must be a unit vector. */
const tangential = (v, n) => {
  const k = dot(v, n);
  return [v[0] - n[0] * k, v[1] - n[1] * k, v[2] - n[2] * k];
};

/** Samples one current: a great circle pushed off its own plane by a stack of sine terms. */
function buildCurrentPath({ tilt, spin, wander }) {
  const n = norm([Math.sin(tilt) * Math.cos(spin), Math.cos(tilt), Math.sin(tilt) * Math.sin(spin)]);
  const seed = Math.abs(n[1]) > 0.9 ? [1, 0, 0] : [0, 1, 0];
  const u = norm(cross(seed, n));
  const v = cross(n, u);

  const count = CONFIG.currentSamples;
  const pts = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const th = (i / count) * TAU;
    let off = 0;
    for (let k = 0; k < wander.length; k += 2) off += wander[k] * Math.sin(wander[k + 1] * th + k * 1.7);
    const p = norm([
      Math.cos(th) * u[0] + Math.sin(th) * v[0] + off * n[0],
      Math.cos(th) * u[1] + Math.sin(th) * v[1] + off * n[1],
      Math.cos(th) * u[2] + Math.sin(th) * v[2] + off * n[2],
    ]);
    pts[i * 3] = p[0];
    pts[i * 3 + 1] = p[1];
    pts[i * 3 + 2] = p[2];
  }
  return pts;
}

/**
 * Specks on a jittered Fibonacci lattice, each carrying the sweep data it needs.
 *
 * The lattice is even, which is what we want, but it is also regular — the spiral arms show
 * as visible rows the moment a run of specks lights at once. Nudging each one by a fraction
 * of the mean spacing keeps the evenness and destroys the pattern.
 */
function buildSpecks(count, paths) {
  const golden = Math.PI * (3 - Math.sqrt(5));
  const jitter = CONFIG.lattice.jitter * (2 / Math.sqrt(count));
  const samples = CONFIG.currentSamples;
  const sparkCos = Math.cos(CONFIG.sparkRadius);
  const meshCos = Math.cos(CONFIG.mesh.radius);

  const position = new Float32Array(count * 3);
  const weight = new Float32Array(count);
  const twinkle = new Float32Array(count * 2);
  const spark = new Float32Array(count * 4); // ang, band, gain, whichCurrent
  const bands = paths.map(() => []);

  for (let i = 0; i < count; i++) {
    const yy = 1 - (i / (count - 1)) * 2;
    const rr = Math.sqrt(Math.max(0, 1 - yy * yy));
    const theta = golden * i;
    const p = norm([
      Math.cos(theta) * rr + (random() - 0.5) * jitter,
      yy + (random() - 0.5) * jitter,
      Math.sin(theta) * rr + (random() - 0.5) * jitter,
    ]);
    position[i * 3] = p[0];
    position[i * 3 + 1] = p[1];
    position[i * 3 + 2] = p[2];
    weight[i] = 0.62 + random() * 0.38;
    twinkle[i * 2] = random() * TAU;
    twinkle[i * 2 + 1] = 0.0008 + random() * 0.0021;

    // Nearest point on each current, keeping the closer of the two.
    let bestCos = -1;
    let bestIdx = 0;
    let bestF = 0;
    for (let f = 0; f < paths.length; f++) {
      const pts = paths[f];
      let c = -1;
      let ci = 0;
      for (let s = 0; s < samples; s++) {
        const d = p[0] * pts[s * 3] + p[1] * pts[s * 3 + 1] + p[2] * pts[s * 3 + 2];
        if (d > c) {
          c = d;
          ci = s;
        }
      }
      if (c >= meshCos) bands[f].push({ i, ang: (ci / samples) * TAU, p });
      if (c > bestCos) {
        bestCos = c;
        bestIdx = ci;
        bestF = f;
      }
    }

    if (bestCos >= sparkCos) {
      const dist = Math.acos(Math.min(1, bestCos)) / CONFIG.sparkRadius; // 0 on it, 1 at the edge
      spark[i * 4] = (bestIdx / samples) * TAU + (random() - 0.5) * 0.26;
      // Falls away gently rather than squared. A squared falloff lights only the specks
      // sitting exactly on the current and leaves their neighbours dark, which reads as a
      // thin red thread instead of a streak of bright beads.
      spark[i * 4 + 1] = 1 - dist * dist * 0.6;
      spark[i * 4 + 2] = random() < 0.18 ? 1.8 + random() : 0.7 + random() * 0.85;
      spark[i * 4 + 3] = bestF;
    }
  }

  return { position, weight, twinkle, spark, bands, count };
}

/**
 * Scattered clusters of one to three triangles over specks near each current.
 *
 * Cluster centres are placed at uneven intervals along the path, and each is a fan over a
 * random handful of a seed speck's nearest neighbours — so the count, the shape and the
 * spacing are all irregular. Returns both the filled triangles and the edge quads; edges
 * are quads rather than GL lines because `linewidth` is ignored on every desktop driver
 * worth naming, and these need to be visibly thick.
 */
function buildClusters(bands) {
  const tri = { pos: [], centroid: [], ang: [], which: [], seed: [] };
  const edge = { pos: [], perp: [], side: [], centroid: [], ang: [], which: [], seed: [], index: [] };
  const [minT, maxT] = CONFIG.mesh.tris;

  for (let f = 0; f < bands.length; f++) {
    const band = bands[f];
    if (band.length < 8) continue;

    for (let c = 0; c < CONFIG.mesh.clusters; c++) {
      // Uneven spacing: a jittered stride rather than a fixed one, so clusters never fall
      // into a rhythm the eye can pick up as a repeat.
      const at = ((c + random() * 0.9) / CONFIG.mesh.clusters) * TAU;

      // Seed: the band speck closest to this angle, plus a little lateral randomness.
      let seedIdx = -1;
      let bestGap = Infinity;
      for (let k = 0; k < band.length; k++) {
        let gap = Math.abs(band[k].ang - at);
        if (gap > Math.PI) gap = TAU - gap;
        gap += random() * 0.05;
        if (gap < bestGap) {
          bestGap = gap;
          seedIdx = k;
        }
      }
      if (seedIdx < 0) continue;
      const seed = band[seedIdx];

      // Its nearest neighbours in the band, closest first.
      // Only six neighbours are used. Keep that small ordered set instead of allocating
      // and sorting the entire band for every cluster. Strict comparison preserves the
      // original stable-sort order for ties (and the seeded result stays identical).
      const fan = [];
      for (let k = 0; k < band.length; k++) {
        if (k === seedIdx) continue;
        const p = band[k].p;
        const d = dot(seed.p, p);
        let at = fan.length;
        while (at > 0 && d > fan[at - 1].d) at--;
        if (at < 6) {
          fan.splice(at, 0, { p, d });
          if (fan.length > 6) fan.pop();
        }
      }
      if (fan.length < 3) continue;

      // Order the ring of neighbours by their bearing around the seed, in its tangent
      // plane. Taking pairs at random instead — the obvious shortcut — joins neighbours
      // that sit on opposite sides of the seed, and the triangles come out as long thin
      // slivers spanning the whole neighbourhood rather than as a tight fan.
      const axis = norm(tangential(fan[0].p, seed.p));
      const side = cross(seed.p, axis);
      for (const nb of fan) {
        const t = tangential(nb.p, seed.p);
        nb.bearing = Math.atan2(dot(t, side), dot(t, axis));
      }
      fan.sort((a, b) => a.bearing - b.bearing);

      // A contiguous run of one to three wedges out of that ring, starting anywhere — so a
      // cluster is a small connected patch, and its size varies from place to place.
      const triCount = minT + Math.floor(random() * (maxT - minT + 1));
      const from = Math.floor(random() * fan.length);

      const verts = [seed.p];
      const tris = [];
      for (let t = 0; t < triCount; t++) {
        const a = fan[(from + t) % fan.length].p;
        const b = fan[(from + t + 1) % fan.length].p;
        tris.push([seed.p, a, b]);
        verts.push(a, b);
      }

      // Centroid of everything the cluster touches — the point it stretches away from.
      const cen = norm([
        verts.reduce((s, v) => s + v[0], 0),
        verts.reduce((s, v) => s + v[1], 0),
        verts.reduce((s, v) => s + v[2], 0),
      ]);
      const rnd = random();

      const pushShared = (target) => {
        target.centroid.push(cen[0], cen[1], cen[2]);
        target.ang.push(at);
        target.which.push(f);
        target.seed.push(rnd);
      };

      for (const t of tris) {
        for (const v of t) {
          tri.pos.push(v[0], v[1], v[2]);
          pushShared(tri);
        }
        // Edges as quads. `perp` is computed from the rest pose — the stretch is small
        // enough that it stays square to the edge once the cluster expands.
        for (let e = 0; e < 3; e++) {
          const A = t[e];
          const B = t[(e + 1) % 3];
          const mid = norm([A[0] + B[0], A[1] + B[1], A[2] + B[2]]);
          const along = norm([B[0] - A[0], B[1] - A[1], B[2] - A[2]]);
          const perp = norm(cross(mid, along));
          // Same two triangles, sharing their identical corners. The vertex shader's
          // noise field now runs four times per edge instead of six.
          const base = edge.side.length;
          edge.index.push(base, base + 1, base + 2, base, base + 2, base + 3);
          const quad = [
            [A, -1], [A, 1], [B, 1], [B, -1],
          ];
          for (const [v, side] of quad) {
            edge.pos.push(v[0], v[1], v[2]);
            edge.perp.push(perp[0], perp[1], perp[2]);
            edge.side.push(side);
            pushShared(edge);
          }
        }
      }
    }
  }
  return { tri, edge };
}

/** The travelling line, as a two-vertex-wide strip that the shader inflates. */
function buildRibbons(paths) {
  const n = CONFIG.currentSamples;
  return paths.map((pts) => {
    const pos = [];
    const across = [];
    const side = [];
    const along = [];
    const index = [];

    for (let i = 0; i <= n; i++) {
      const i0 = i % n;
      const i1 = (i0 + 1) % n;
      const P = [pts[i0 * 3], pts[i0 * 3 + 1], pts[i0 * 3 + 2]];
      const T = norm([pts[i1 * 3] - P[0], pts[i1 * 3 + 1] - P[1], pts[i1 * 3 + 2] - P[2]]);
      // P doubles as the surface normal, so this lands in the tangent plane, square to the
      // path — the direction the ribbon has to widen along to stay flat on the shell.
      const B = norm(cross(P, T));
      for (const s of [-1, 1]) {
        pos.push(P[0], P[1], P[2]);
        across.push(B[0], B[1], B[2]);
        side.push(s);
        along.push(i / n);
      }
      if (i < n) {
        const a = i * 2;
        index.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
    }
    return { pos, across, side, along, index };
  });
}

/**
 * The dust field around the globe.
 *
 * Radius is distributed on a cube root so the shell fills evenly by volume rather than
 * bunching against the inner boundary, which is what a uniform radius does and what makes
 * a field like this read as a hollow bubble instead of open space.
 */
function buildMotes(count) {
  const [near, far] = CONFIG.motes.shell;
  const [minSize, maxSize] = CONFIG.motes.size;
  const position = new Float32Array(count * 3);
  const size = new Float32Array(count);
  const phase = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    const u = random() * 2 - 1;
    const theta = random() * TAU;
    const rr = Math.sqrt(Math.max(0, 1 - u * u));
    const radius = Math.cbrt(near ** 3 + random() * (far ** 3 - near ** 3));
    position[i * 3] = Math.cos(theta) * rr * radius;
    position[i * 3 + 1] = u * radius;
    position[i * 3 + 2] = Math.sin(theta) * rr * radius;
    // Size is independent of radius. Scaling it down with distance as well as through the
    // perspective divide double-counts the depth, and since a volume-uniform shell puts most
    // of its points near the outer edge it drove the bulk of the field below a pixel. The
    // bias keeps most motes small while leaving a tail of brighter ones to carry the field.
    size[i] = minSize + (maxSize - minSize) * random() ** 1.7;
    phase[i] = random() * TAU;
  }

  return { position, size, phase, count };
}

// Route changes unmount the WebGL context, but the module itself stays alive. Keep the pure,
// immutable source arrays by breakpoint so returning home—or rotating through a breakpoint
// and back—does not repeat the most expensive CPU part of globe startup. Three.js disposal
// releases GPU buffers without modifying these arrays, so they are safe to reuse.
const geometryCache = new Map();

export function buildGeometry(count, moteCount) {
  const key = `${count}:${moteCount}`;
  const cached = geometryCache.get(key);
  if (cached) return cached;

  random = seededRandom(CONFIG.seed + count);
  const paths = CONFIG.currents.map(buildCurrentPath);
  const specks = buildSpecks(count, paths);
  const clusters = buildClusters(specks.bands);
  // `bands` is only construction scaffolding. Keeping thousands of `{ p, ang }` records
  // alive alongside the cached GPU inputs would add heap without helping a later rebuild.
  delete specks.bands;
  const geometry = {
    specks,
    clusters,
    ribbons: buildRibbons(paths),
    motes: buildMotes(moteCount),
    count,
  };
  geometryCache.set(key, geometry);
  return geometry;
}
