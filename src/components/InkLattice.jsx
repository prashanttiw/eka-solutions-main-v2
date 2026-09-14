import React, { useEffect, useRef } from 'react';

/**
 * The paper counterpart to the hero globe.
 *
 * The globe at the top of the site is the night version of this idea: thousands of lit
 * specks in WebGL against black. That one is deliberately untouchable — it is the first
 * thing anyone sees and it costs half a megabyte of Three.js to run. So the inside pages
 * get the daytime version instead: the same solids, drawn as an engineer's line drawing in
 * blue ink on the paper, on a plain 2D canvas that costs about four kilobytes and never
 * takes a GL context.
 *
 * That constraint is the whole design. A second WebGL scene on every page would be the
 * obvious way to answer "put 3D on the inside pages", and it would have been the wrong
 * one — two contexts fighting for the same GPU on a laptop, on pages whose actual job is
 * to be read. A wireframe in 2D canvas holds sixty frames on anything, and drawn in the
 * body ink it reads as part of the same document rather than as a widget dropped into it.
 *
 * Four solids, one per kind of page, so the inside pages are told apart at a glance before
 * a word of the heading has been read.
 */

/* ------------------------------------------------------------------ geometry */

/** Icosahedron, subdivided and pushed back onto the unit sphere. */
function icosphere(subdivisions = 1) {
  const t = (1 + Math.sqrt(5)) / 2;
  let verts = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ];
  let faces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
  ];

  for (let pass = 0; pass < subdivisions; pass += 1) {
    const cache = new Map();
    const next = [];
    const midpoint = (a, b) => {
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      const hit = cache.get(key);
      if (hit !== undefined) return hit;
      const va = verts[a];
      const vb = verts[b];
      verts.push([(va[0] + vb[0]) / 2, (va[1] + vb[1]) / 2, (va[2] + vb[2]) / 2]);
      const index = verts.length - 1;
      cache.set(key, index);
      return index;
    };
    for (const [a, b, c] of faces) {
      const ab = midpoint(a, b);
      const bc = midpoint(b, c);
      const ca = midpoint(c, a);
      next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
    }
    faces = next;
  }

  verts = verts.map(([x, y, z]) => {
    const length = Math.hypot(x, y, z) || 1;
    return [x / length, y / length, z / length];
  });

  const seen = new Set();
  const edges = [];
  for (const [a, b, c] of faces) {
    for (const [p, q] of [[a, b], [b, c], [c, a]]) {
      const key = p < q ? `${p}:${q}` : `${q}:${p}`;
      if (seen.has(key)) continue;
      seen.add(key);
      edges.push([p, q]);
    }
  }
  return { verts, edges };
}

function torus(major = 0.78, minor = 0.3, around = 26, through = 12) {
  const verts = [];
  for (let i = 0; i < around; i += 1) {
    for (let j = 0; j < through; j += 1) {
      const u = (i / around) * Math.PI * 2;
      const v = (j / through) * Math.PI * 2;
      const ring = major + minor * Math.cos(v);
      verts.push([ring * Math.cos(u), minor * Math.sin(v), ring * Math.sin(u)]);
    }
  }
  const at = (i, j) => (((i % around) + around) % around) * through + (((j % through) + through) % through);
  const edges = [];
  for (let i = 0; i < around; i += 1) {
    for (let j = 0; j < through; j += 1) {
      edges.push([at(i, j), at(i + 1, j)], [at(i, j), at(i, j + 1)]);
    }
  }
  return { verts, edges };
}

/** A coil around a vertical axis, with rungs back to it — a process, drawn. */
function helix(turns = 3, perTurn = 22, radius = 0.66, height = 1.5) {
  const verts = [];
  const edges = [];
  const count = turns * perTurn;
  for (let i = 0; i <= count; i += 1) {
    const a = (i / perTurn) * Math.PI * 2;
    const y = height * (i / count) - height / 2;
    verts.push([radius * Math.cos(a), y, radius * Math.sin(a)]);
  }
  for (let i = 0; i < count; i += 1) edges.push([i, i + 1]);

  // The axis, and a rung every sixth step.
  const axisTop = verts.push([0, height / 2, 0]) - 1;
  const axisBottom = verts.push([0, -height / 2, 0]) - 1;
  edges.push([axisBottom, axisTop]);
  for (let i = 0; i <= count; i += 6) {
    const y = height * (i / count) - height / 2;
    const hub = verts.push([0, y, 0]) - 1;
    edges.push([hub, i]);
  }
  return { verts, edges };
}

/** Three cubes inside one another, each turned a little — a stack of constraints. */
function prism(shells = 3) {
  const verts = [];
  const edges = [];
  const corners = [
    [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
    [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
  ];
  const wire = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7],
  ];

  for (let shell = 0; shell < shells; shell += 1) {
    const scale = 0.9 - shell * 0.26;
    const spin = shell * 0.42;
    const base = verts.length;
    for (const [x, y, z] of corners) {
      // Turn each shell about Y so the nested cubes never line up into one silhouette.
      verts.push([
        (x * Math.cos(spin) - z * Math.sin(spin)) * scale,
        y * scale,
        (x * Math.sin(spin) + z * Math.cos(spin)) * scale,
      ]);
    }
    for (const [a, b] of wire) edges.push([base + a, base + b]);
  }
  return { verts, edges };
}

/**
 * Each solid with the projection that suits it.
 *
 * `fov` is the camera distance in object radii, so a larger number is a flatter, more
 * axonometric drawing. The nested cubes need that: at the sphere's setting the near
 * corners project so far out that their edges leave the canvas and read as stray rules
 * across the page rather than as part of the object. Curved solids want the opposite —
 * the perspective is what tells a wireframe sphere apart from a flat mandala.
 */
const SHAPES = {
  sphere: { build: () => icosphere(2), fov: 3.2, fit: 1 },
  globe: { build: () => icosphere(1), fov: 3.2, fit: 1 },
  torus: { build: torus, fov: 3.4, fit: 1.06 },
  helix: { build: helix, fov: 3.6, fit: 0.94 },
  prism: { build: prism, fov: 5.6, fit: 0.8 },
};

/* ------------------------------------------------------------------ component */

export default function InkLattice({
  variant = 'sphere',
  className = '',
  speed = 1,
  density = 1,
  label,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const shape = SHAPES[variant] ?? SHAPES.sphere;
    const { verts, edges } = shape.build();

    const styles = getComputedStyle(document.documentElement);
    const ink = styles.getPropertyValue('--ink-rgb').trim() || '27, 34, 82';
    const accent = '47, 66, 176';

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const coarse = window.matchMedia('(pointer: coarse)');

    let width = 0;
    let height = 0;
    let ratio = 1;
    let raf = 0;
    let visible = true;
    let start = 0;

    // Pointer parallax. Held as a target the render eases toward, so a fast mouse does not
    // snap the solid around — it leans.
    const lean = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      ratio = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const projected = new Array(verts.length);

    const draw = (time) => {
      if (!start) start = time;
      const t = (time - start) / 1000;

      context.clearRect(0, 0, width, height);
      if (!width || !height) return;

      lean.x += (lean.tx - lean.x) * 0.06;
      lean.y += (lean.ty - lean.y) * 0.06;

      const spin = reduced.matches ? 0.6 : t * 0.16 * speed;
      const tilt = (reduced.matches ? -0.32 : Math.sin(t * 0.11) * 0.26 - 0.22) + lean.y * 0.3;
      const yaw = spin + lean.x * 0.4;

      const cy = Math.cos(yaw);
      const sy = Math.sin(yaw);
      const cx = Math.cos(tilt);
      const sx = Math.sin(tilt);

      const scale = Math.min(width, height) * 0.42 * shape.fit;
      const ox = width / 2;
      const oy = height / 2;
      const fov = shape.fov;

      for (let i = 0; i < verts.length; i += 1) {
        const [vx, vy, vz] = verts[i];
        // Y then X. Two rotations is all this needs; a full matrix would cost more to read
        // than it would save.
        const x1 = vx * cy + vz * sy;
        const z1 = -vx * sy + vz * cy;
        const y2 = vy * cx - z1 * sx;
        const z2 = vy * sx + z1 * cx;

        const depth = fov / (fov + z2);
        projected[i] = [ox + x1 * scale * depth, oy + y2 * scale * depth, z2, depth];
      }

      // Far edges first, so the near ones draw over them and the solid reads as solid.
      const order = edges
        .map((edge, index) => [index, (projected[edge[0]][2] + projected[edge[1]][2]) / 2])
        .sort((a, b) => b[1] - a[1]);

      for (const [index] of order) {
        const [a, b] = edges[index];
        const pa = projected[a];
        const pb = projected[b];

        // −1 at the back, +1 at the front.
        const front = (pa[2] + pb[2]) / -2;
        const near = (front + 1) / 2;

        const alpha = (0.05 + near * 0.42) * density;
        // A slow band of light travelling around the solid, so the drawing is never
        // uniformly weighted and the eye is given somewhere to rest.
        const sweep = reduced.matches
          ? 0
          : Math.max(0, Math.sin(t * 0.55 - index * 0.012)) ** 8;

        context.beginPath();
        context.moveTo(pa[0], pa[1]);
        context.lineTo(pb[0], pb[1]);
        context.strokeStyle = sweep > 0.08
          ? `rgba(${accent}, ${Math.min(0.85, alpha + sweep * 0.55)})`
          : `rgba(${ink}, ${alpha})`;
        context.lineWidth = 0.6 + near * 0.75 + sweep * 0.9;
        context.stroke();
      }

      // Vertices, front hemisphere only. They are what stop the wireframe reading as a
      // net and start it reading as a constructed object.
      for (let i = 0; i < projected.length; i += 1) {
        const p = projected[i];
        if (p[2] > 0.1) continue;
        const near = (-p[2] + 1) / 2;
        context.beginPath();
        context.arc(p[0], p[1], 0.7 + near * 1.05, 0, Math.PI * 2);
        context.fillStyle = `rgba(${accent}, ${(0.1 + near * 0.4) * density})`;
        context.fill();
      }
    };

    const loop = (time) => {
      draw(time);
      raf = window.requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (raf) return;
      if (reduced.matches) {
        // One frame, then stop. The solid is still worth having; the rotation is not.
        raf = window.requestAnimationFrame((time) => {
          draw(time);
          raf = 0;
        });
        return;
      }
      raf = window.requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      if (!raf) return;
      window.cancelAnimationFrame(raf);
      raf = 0;
    };

    const onPointer = (event) => {
      if (coarse.matches) return;
      // Read the ref rather than the captured element: this listener is on `window`, so it
      // outlives the canvas by however long it takes React to run the cleanup, and during
      // a hot reload it can outlive it by longer than that.
      const node = canvasRef.current;
      if (!node) return;
      const rect = node.getBoundingClientRect();
      lean.tx = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      lean.ty = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    };

    // Off-screen means no frames. There is one of these per page header, and it should
    // stop costing anything the moment it scrolls away.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) startLoop();
        else stopLoop();
      },
      { rootMargin: '120px' },
    );

    const onVisibility = () => {
      if (document.hidden) stopLoop();
      else if (visible) startLoop();
    };

    const resizeObserver = new ResizeObserver(() => {
      resize();
      if (reduced.matches) startLoop();
    });

    resize();
    resizeObserver.observe(canvas);
    observer.observe(canvas);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    reduced.addEventListener('change', () => {
      stopLoop();
      startLoop();
    });
    startLoop();

    return () => {
      stopLoop();
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('pointermove', onPointer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [variant, speed, density]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      role={label ? 'img' : 'presentation'}
      aria-label={label || undefined}
      aria-hidden={label ? undefined : 'true'}
    />
  );
}
