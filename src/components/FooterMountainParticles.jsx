import React, { useEffect, useRef } from 'react';

/**
 * The footer engraving breathes: it crumbles into drifting dust and re-gathers itself.
 *
 * Two ideas keep it from reading as a machine wipe:
 *  1. The dissolve front is not a vertical line. It is a curve warped by three slow sine
 *     harmonics whose phases drift forever, so the edge wanders and never repeats exactly.
 *  2. The still-solid artwork does not end at that curve — it fades across a wide band of
 *     nested strips while particles lift out of it, so ink turns into dust instead of
 *     being swapped for it.
 *
 * The source asset is transparent (see scripts/build-mountain.mjs), so the page background
 * shows through the sky and the artwork never reads as a pasted-in rectangle.
 */

const HOLD_MS = 5200;
const DISSOLVE_MS = 3800;
const GAP_MS = 620;
const REFORM_MS = 4100;
const CYCLE_MS = HOLD_MS + DISSOLVE_MS + GAP_MS + REFORM_MS;

const SAMPLE_TARGET = 48000; // grid samples taken before ink filtering
const MAX_PARTICLES = 40000; // safety ceiling; the stride is widened rather than truncating rows
const MIN_INK = 0.1; // alpha below this is paper grain, not linework
const BAND = 0.24; // width of the dust band as a fraction of the sweep
const STRIPS = 12; // nested strips used to feather the solid artwork into the band
const CURVE_STEP = 12; // px between samples along a warped edge
const EMBER_RATE = 0.05; // share of particles that drift further and brighter

// Three drifting harmonics. Amplitudes are fractions of the sweep axis; speeds are radians
// per ms, deliberately incommensurate so the front never falls back into the same shape.
const WARP = [
  { amp: 0.046, freq: 2.1, speed: 0.00021 },
  { amp: 0.028, freq: 3.9, speed: -0.00034 },
  { amp: 0.016, freq: 7.3, speed: 0.00052 },
];
const WARP_MAX = WARP.reduce((sum, wv) => sum + wv.amp, 0);

const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

// How much of the artwork still survives across the dust band. Deliberately not linear:
// the ink holds almost full strength at first and then lets go quickly, so the edge reads
// as engraving breaking apart rather than a photo cross-fading to grey.
function inkSurvival(f) {
  const t = Math.min(1, Math.max(0, (f - 0.12) / 0.8));
  return 1 - t * t * (3 - 2 * t);
}

// particles are sorted by .fx ascending — first index with fx >= value
function lowerBound(particles, value) {
  let lo = 0;
  let hi = particles.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (particles[mid].fx < value) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function makeDustSprite() {
  const s = 32;
  const c = document.createElement('canvas');
  c.width = s;
  c.height = s;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, 'rgba(36,36,33,1)');
  g.addColorStop(0.34, 'rgba(36,36,33,0.94)');
  g.addColorStop(0.62, 'rgba(36,36,33,0.34)');
  g.addColorStop(1, 'rgba(36,36,33,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, s, s);
  return c;
}

export default function FooterMountainParticles({ src = '/mountain_compressed.png' }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const rafRef = useRef(null);
  const inViewRef = useRef(false);
  const reducedMotionRef = useRef(false);
  const sizeRef = useRef({ w: 0, h: 0, dpr: 1 });
  const imgRef = useRef(null);
  const offCanvasRef = useRef(null); // cover-cropped source, reused every frame
  const spriteRef = useRef(null);
  const lastPhaseRef = useRef(null);
  const topClipRef = useRef(0); // px of artwork the cover crop pushes above the container

  const buildFrame = () => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    const container = containerRef.current;
    if (!canvas || !img || !container) return;

    const rect = container.getBoundingClientRect();
    // Guard against a layout race (e.g. observer firing mid-reflow) reporting a near-zero
    // size — bail out and let the next ResizeObserver tick retry with real dimensions rather
    // than baking a bogus 1px size into the canvas.
    if (rect.width < 10 || rect.height < 10) return;
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    sizeRef.current = { w, h, dpr };

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    // Display size is driven entirely by the "block h-full w-full" CSS classes below —
    // never set inline width/height here, so a stray bad measurement can't corrupt layout.

    // Draw the source once into an offscreen canvas at device resolution, using
    // object-fit: cover / object-position: bottom. It is the crisp source both for the
    // resting draw and for particle sampling.
    const ow = w * dpr;
    const oh = h * dpr;
    const off = document.createElement('canvas');
    off.width = ow;
    off.height = oh;
    const octx = off.getContext('2d');
    const scale = Math.max(ow / img.naturalWidth, oh / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    octx.drawImage(img, (ow - drawW) / 2, oh - drawH, drawW, drawH);
    offCanvasRef.current = off;
    topClipRef.current = Math.max(0, (drawH - oh) / dpr);

    const { data } = octx.getImageData(0, 0, ow, oh);

    // Sample the ink on a regular grid. How much of the grid actually lands on linework
    // depends on the crop, so if the first pass overshoots the ceiling we widen the stride
    // and go again — never truncate, or the unsampled rows would simply never turn to dust.
    const sample = (stride) => {
      const cssStride = stride / dpr;
      const out = [];
      for (let py = 0; py < oh; py += stride) {
        for (let px = 0; px < ow; px += stride) {
          const ink = data[(py * ow + px) * 4 + 3] / 255;
          if (ink < MIN_INK) continue;

          const angle = Math.random() * Math.PI * 2;
          const dist = 18 + Math.random() * 70;
          const ember = Math.random() < EMBER_RATE;
          out.push({
            homeX: px / dpr,
            homeY: py / dpr,
            fx: px / ow, // 0 (left) → 1 (right): where this speck sits along the sweep
            ink,
            driftX: Math.cos(angle) * dist * (ember ? 1.7 : 1),
            driftY: Math.sin(angle) * dist * 0.45,
            rise: (40 + Math.random() * 130) * (ember ? 2.2 : 1),
            sway: 6 + Math.random() * 20,
            phase: Math.random() * Math.PI * 2,
            size: cssStride * (ember ? 1.9 : 1.15),
          });
        }
      }
      return out;
    };

    const baseStride = Math.max(2, Math.round(Math.sqrt((ow * oh) / SAMPLE_TARGET)));
    let particles = sample(baseStride);
    if (particles.length > MAX_PARTICLES) {
      particles = sample(Math.ceil(baseStride * Math.sqrt(particles.length / MAX_PARTICLES)));
    }

    particles.sort((a, b) => a.fx - b.fx);
    particlesRef.current = particles;
    lastPhaseRef.current = null;
  };

  const warpAt = (yn, time) => {
    let s = 0;
    for (let i = 0; i < WARP.length; i++) {
      const wv = WARP[i];
      s += wv.amp * Math.sin(yn * wv.freq * Math.PI * 2 + time * wv.speed);
    }
    return s;
  };

  // Clips to the region between two warped edges and repaints the artwork there.
  // leftAt/rightAt take a normalised y (0..1) and return an x in CSS px; leftAt must be
  // the smaller of the two for every row.
  const drawStrip = (ctx, w, h, leftAt, rightAt, alpha) => {
    if (alpha <= 0.004) return;
    const off = offCanvasRef.current;
    if (!off) return;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(leftAt(0), 0);
    for (let y = CURVE_STEP; y < h; y += CURVE_STEP) ctx.lineTo(leftAt(y / h), y);
    ctx.lineTo(leftAt(1), h);
    ctx.lineTo(rightAt(1), h);
    for (let y = h - CURVE_STEP; y > 0; y -= CURVE_STEP) ctx.lineTo(rightAt(y / h), y);
    ctx.lineTo(rightAt(0), 0);
    ctx.closePath();
    ctx.clip();
    ctx.globalAlpha = alpha;
    ctx.drawImage(off, 0, 0, w, h);
    ctx.restore();
    ctx.globalAlpha = 1;
  };

  const drawDust = (ctx, particles, from, to, sweepOf, progress, time, arriving) => {
    const sprite = spriteRef.current;
    if (!sprite) return;
    for (let i = from; i < to; i++) {
      const p = particles[i];
      const eff = sweepOf(p) + warpAt(p.homeY / Math.max(1, sizeRef.current.h), time);
      let travel = (progress - eff) / BAND; // 0 = still ink, 1 = fully scattered
      if (arriving) travel = 1 - travel; // reform runs the same path backwards
      if (travel <= 0 || travel >= 1) continue;

      const e = travel * travel; // departure accelerates
      const swirl = Math.sin(p.phase + travel * 4.2 + time * 0.0013) * p.sway * travel;
      const x = p.homeX + p.driftX * e + swirl;
      const y = p.homeY + p.driftY * e - p.rise * e;

      const twinkle = 0.72 + 0.28 * Math.sin(time * 0.005 + p.phase * 6.3);
      // Rises from nothing (the artwork still covers it), peaks mid-flight, fades to nothing
      // as it drifts clear — so no speck ever pops in or out.
      const alpha = p.ink * Math.pow(1 - travel, 0.75) * Math.min(1, travel * 5) * twinkle;
      if (alpha <= 0.012) continue;

      const s = p.size * (1 + travel * 1.1);
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprite, x - s / 2, y - s / 2, s, s);
    }
    ctx.globalAlpha = 1;
  };

  // The asset's own side edges are soft, but a narrow viewport crops them away. Fading the
  // container edges every frame guarantees the range always melts into the card instead of
  // stopping at a straight vertical line.
  const featherEdges = (ctx, w, h) => {
    const fw = Math.min(120, w * 0.09);
    ctx.save();
    ctx.globalCompositeOperation = 'destination-out';
    const left = ctx.createLinearGradient(0, 0, fw, 0);
    left.addColorStop(0, 'rgba(0,0,0,1)');
    left.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = left;
    ctx.fillRect(0, 0, fw, h);
    const right = ctx.createLinearGradient(w, 0, w - fw, 0);
    right.addColorStop(0, 'rgba(0,0,0,1)');
    right.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = right;
    ctx.fillRect(w - fw, 0, fw, h);

    // On short containers the cover crop slices through the ridge line, which would leave a
    // ruler-straight horizontal cut across the peaks. Fade exactly as much as was cut, so
    // wherever the summit does fit (wide layouts) nothing is softened at all.
    const clipped = topClipRef.current;
    if (clipped > 1) {
      const fh = Math.min(130, clipped * 1.6);
      const top = ctx.createLinearGradient(0, 0, 0, fh);
      top.addColorStop(0, 'rgba(0,0,0,1)');
      top.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = top;
      ctx.fillRect(0, 0, w, fh);
    }
    ctx.restore();
  };

  const drawStatic = () => {
    const canvas = canvasRef.current;
    const off = offCanvasRef.current;
    if (!canvas || !off) return;
    const { w, h, dpr } = sizeRef.current;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(off, 0, 0, w, h);
    featherEdges(ctx, w, h);
  };

  const drawFrame = (elapsed) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const { w, h, dpr } = sizeRef.current;

    const t = elapsed % CYCLE_MS;
    let phase;
    let phaseT = 0;
    if (t < HOLD_MS) {
      phase = 'hold';
    } else if (t < HOLD_MS + DISSOLVE_MS) {
      phase = 'dissolve';
      phaseT = (t - HOLD_MS) / DISSOLVE_MS;
    } else if (t < HOLD_MS + DISSOLVE_MS + GAP_MS) {
      phase = 'gap';
    } else {
      phase = 'reform';
      phaseT = (t - HOLD_MS - DISSOLVE_MS - GAP_MS) / REFORM_MS;
    }

    // Hold and gap are still frames — repaint once on entry, then leave the canvas alone.
    if (phase === 'hold' || phase === 'gap') {
      if (lastPhaseRef.current === phase) return phase;
      lastPhaseRef.current = phase;
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      if (phase === 'hold') drawStatic();
      return phase;
    }

    lastPhaseRef.current = phase;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const particles = particlesRef.current;
    const eased = easeInOutSine(phaseT);
    // The sweep has to start clear of the warped edge and finish clear of it on the other
    // side, or the first/last specks would snap.
    const progress = -WARP_MAX + eased * (1 + 2 * WARP_MAX + BAND);
    const step = BAND / STRIPS;

    if (phase === 'dissolve') {
      // Crumbles from the right edge inwards. Sweep coordinate: 1 at the right edge, 0 at
      // the left, so x decreases as the sweep value grows.
      const xAt = (s) => (yn) => {
        const x = w * (1 - s + warpAt(yn, elapsed));
        return x < -2 ? -2 : x > w + 2 ? w + 2 : x;
      };
      drawStrip(ctx, w, h, () => -2, xAt(progress), 1);
      for (let k = 0; k < STRIPS; k++) {
        drawStrip(ctx, w, h, xAt(progress - k * step), xAt(progress - (k + 1) * step), inkSurvival((k + 0.5) / STRIPS));
      }
      const lo = lowerBound(particles, 1 - progress - WARP_MAX);
      const hi = lowerBound(particles, 1 - progress + BAND + WARP_MAX);
      drawDust(ctx, particles, lo, hi, (p) => 1 - p.fx, progress, elapsed, false);
    } else {
      // Gathers back in from the left edge. Sweep coordinate rises with x.
      const xAt = (s) => (yn) => {
        const x = w * (s - warpAt(yn, elapsed));
        return x < -2 ? -2 : x > w + 2 ? w + 2 : x;
      };
      drawStrip(ctx, w, h, () => -2, xAt(progress - BAND), 1);
      for (let k = 0; k < STRIPS; k++) {
        drawStrip(
          ctx,
          w,
          h,
          xAt(progress - BAND + k * step),
          xAt(progress - BAND + (k + 1) * step),
          inkSurvival((k + 0.5) / STRIPS)
        );
      }
      const lo = lowerBound(particles, progress - BAND - WARP_MAX);
      const hi = lowerBound(particles, progress + WARP_MAX);
      drawDust(ctx, particles, lo, hi, (p) => p.fx, progress, elapsed, true);
    }

    featherEdges(ctx, w, h);
    return phase;
  };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    // Chromium, Android Chrome and current Safari can render a transferred 2D canvas in a
    // worker. The footer's dissolve can touch tens of thousands of dust sprites in one
    // frame; moving those exact drawing commands off the UI thread keeps touch/wheel input
    // responsive without changing the particle count, timing, resolution or appearance.
    // Browsers without the capability continue through the equivalent main-thread renderer
    // below.
    if (typeof Worker !== 'undefined' && typeof canvas.transferControlToOffscreen === 'function') {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let worker = null;
      let started = false;
      let inView = false;

      const size = () => {
        const rect = container.getBoundingClientRect();
        return {
          width: Math.max(1, Math.round(rect.width)),
          height: Math.max(1, Math.round(rect.height)),
          dpr: Math.min(window.devicePixelRatio || 1, 2),
        };
      };

      const setActivity = () => {
        worker?.postMessage({ type: 'active', value: inView && !document.hidden });
      };

      const begin = () => {
        if (started) return;
        started = true;
        const offscreen = canvas.transferControlToOffscreen();
        worker = new Worker(new URL('./footerMountain.worker.js', import.meta.url), {
          type: 'module',
        });
        worker.postMessage({
          type: 'init',
          canvas: offscreen,
          src,
          reduced,
          active: inView && !document.hidden,
          ...size(),
        }, [offscreen]);
      };

      let resizeTimer = null;
      const resizeObserver = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (worker) worker.postMessage({ type: 'resize', ...size() });
        }, 140);
      });
      resizeObserver.observe(container);

      const intersectionObserver = new IntersectionObserver(([entry]) => {
        inView = entry.isIntersecting;
        setActivity();
      }, { threshold: 0.05 });
      intersectionObserver.observe(container);

      const preloadObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return;
        begin();
        preloadObserver.disconnect();
      }, { rootMargin: '1600px 0px', threshold: 0 });
      preloadObserver.observe(container);
      document.addEventListener('visibilitychange', setActivity);

      return () => {
        clearTimeout(resizeTimer);
        resizeObserver.disconnect();
        intersectionObserver.disconnect();
        preloadObserver.disconnect();
        document.removeEventListener('visibilitychange', setActivity);
        worker?.terminate();
      };
    }

    reducedMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cancelled = false;
    let started = false;
    let ready = false;
    let startTime = 0;
    let idleHandle = null;

    // Rebuilding samples the whole bitmap, so coalesce the burst of ticks a drag-resize fires.
    let resizeTimer = null;
    const resizeObserver = new ResizeObserver(() => {
      if (!ready) return;
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        buildFrame();
        if (reducedMotionRef.current || !inViewRef.current || document.hidden) drawStatic();
      }, 140);
    });
    resizeObserver.observe(container);

    const loop = (now) => {
      rafRef.current = null;
      if (!ready || !inViewRef.current || document.hidden || reducedMotionRef.current) return;
      drawFrame(now - startTime);
      rafRef.current = requestAnimationFrame(loop);
    };

    const updateActivity = () => {
      const active = ready && inViewRef.current && !document.hidden && !reducedMotionRef.current;
      if (active && rafRef.current === null) {
        rafRef.current = requestAnimationFrame(loop);
      } else if (!active && rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const scheduleBuild = (fn) => {
      if ('requestIdleCallback' in window) {
        idleHandle = window.requestIdleCallback(fn, { timeout: 1200 });
      } else {
        idleHandle = window.setTimeout(fn, 0);
      }
    };

    const begin = () => {
      if (started || cancelled) return;
      started = true;
      spriteRef.current = makeDustSprite();

      const img = new Image();
      imgRef.current = img;
      img.decoding = 'async';
      img.onload = () => {
        if (cancelled) return;
        // Decoding, getImageData and constructing tens of thousands of particle records is
        // real work. The footer is prefetched well before it is visible, so do that work in
        // an idle slot instead of interrupting an active scroll near the top of the page.
        scheduleBuild(() => {
          idleHandle = null;
          if (cancelled) return;
          buildFrame();
          drawStatic();
          ready = true;
          startTime = performance.now();
          updateActivity();
        });
      };
      img.src = src;
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = entry.isIntersecting;
        updateActivity();
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // Loading from mount made every route download and sample the mountain while it was
    // several screens away. Start early enough that a normal scroll never sees an empty
    // canvas, while keeping the initial network and main-thread path clear.
    const preloadObserver = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        begin();
        preloadObserver.disconnect();
      },
      { rootMargin: '1600px 0px', threshold: 0 }
    );
    preloadObserver.observe(container);
    document.addEventListener('visibilitychange', updateActivity);

    return () => {
      cancelled = true;
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      if (idleHandle !== null) {
        if ('cancelIdleCallback' in window) window.cancelIdleCallback(idleHandle);
        else window.clearTimeout(idleHandle);
      }
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      preloadObserver.disconnect();
      document.removeEventListener('visibilitychange', updateActivity);
    };
  }, [src]);

  return (
    <div ref={containerRef} className="h-full w-full">
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
