/**
 * Worker renderer for the footer engraving.
 *
 * This is the same canvas composition used by FooterMountainParticles: the image crop,
 * sample ceiling, warped dissolve edge, dust paths and timing are intentionally kept in
 * lockstep with its fallback. The only difference is that the canvas belongs to this
 * worker, so a dense dust frame cannot delay scrolling on the UI thread.
 */

const HOLD_MS = 5200;
const DISSOLVE_MS = 3800;
const GAP_MS = 620;
const REFORM_MS = 4100;
const CYCLE_MS = HOLD_MS + DISSOLVE_MS + GAP_MS + REFORM_MS;

const SAMPLE_TARGET = 48000;
const MAX_PARTICLES = 40000;
const MIN_INK = 0.1;
const BAND = 0.24;
const STRIPS = 12;
const CURVE_STEP = 12;
const EMBER_RATE = 0.05;

const WARP = [
  { amp: 0.046, freq: 2.1, speed: 0.00021 },
  { amp: 0.028, freq: 3.9, speed: -0.00034 },
  { amp: 0.016, freq: 7.3, speed: 0.00052 },
];
const WARP_MAX = WARP.reduce((sum, wave) => sum + wave.amp, 0);

let canvas = null;
let context = null;
let source = null;
let offCanvas = null;
let sprite = null;
let particles = [];
let width = 1;
let height = 1;
let dpr = 1;
let topClip = 0;
let lastPhase = null;
let startTime = 0;
let active = false;
let reduced = false;
let frame = null;

const easeInOutSine = (t) => -(Math.cos(Math.PI * t) - 1) / 2;

function inkSurvival(fraction) {
  const t = Math.min(1, Math.max(0, (fraction - 0.12) / 0.8));
  return 1 - t * t * (3 - 2 * t);
}

function lowerBound(items, value) {
  let low = 0;
  let high = items.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (items[middle].fx < value) low = middle + 1;
    else high = middle;
  }
  return low;
}

function makeDustSprite() {
  const size = 32;
  const next = new OffscreenCanvas(size, size);
  const ctx = next.getContext('2d');
  const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  gradient.addColorStop(0, 'rgba(36,36,33,1)');
  gradient.addColorStop(0.34, 'rgba(36,36,33,0.94)');
  gradient.addColorStop(0.62, 'rgba(36,36,33,0.34)');
  gradient.addColorStop(1, 'rgba(36,36,33,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);
  return next;
}

function buildFrame() {
  if (!canvas || !context || !source || width < 10 || height < 10) return;

  const outputWidth = Math.round(width * dpr);
  const outputHeight = Math.round(height * dpr);
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  const nextOffCanvas = new OffscreenCanvas(outputWidth, outputHeight);
  const offContext = nextOffCanvas.getContext('2d');
  const scale = Math.max(outputWidth / source.width, outputHeight / source.height);
  const drawWidth = source.width * scale;
  const drawHeight = source.height * scale;
  offContext.drawImage(
    source,
    (outputWidth - drawWidth) / 2,
    outputHeight - drawHeight,
    drawWidth,
    drawHeight,
  );
  offCanvas = nextOffCanvas;
  topClip = Math.max(0, (drawHeight - outputHeight) / dpr);

  const { data } = offContext.getImageData(0, 0, outputWidth, outputHeight);
  const sample = (stride) => {
    const cssStride = stride / dpr;
    const result = [];
    for (let py = 0; py < outputHeight; py += stride) {
      for (let px = 0; px < outputWidth; px += stride) {
        const ink = data[(py * outputWidth + px) * 4 + 3] / 255;
        if (ink < MIN_INK) continue;

        const angle = Math.random() * Math.PI * 2;
        const distance = 18 + Math.random() * 70;
        const ember = Math.random() < EMBER_RATE;
        result.push({
          homeX: px / dpr,
          homeY: py / dpr,
          fx: px / outputWidth,
          ink,
          driftX: Math.cos(angle) * distance * (ember ? 1.7 : 1),
          driftY: Math.sin(angle) * distance * 0.45,
          rise: (40 + Math.random() * 130) * (ember ? 2.2 : 1),
          sway: 6 + Math.random() * 20,
          phase: Math.random() * Math.PI * 2,
          size: cssStride * (ember ? 1.9 : 1.15),
        });
      }
    }
    return result;
  };

  const baseStride = Math.max(2, Math.round(Math.sqrt((outputWidth * outputHeight) / SAMPLE_TARGET)));
  let nextParticles = sample(baseStride);
  if (nextParticles.length > MAX_PARTICLES) {
    nextParticles = sample(Math.ceil(baseStride * Math.sqrt(nextParticles.length / MAX_PARTICLES)));
  }
  nextParticles.sort((a, b) => a.fx - b.fx);
  particles = nextParticles;
  lastPhase = null;
}

function warpAt(normalY, time) {
  let sum = 0;
  for (const wave of WARP) {
    sum += wave.amp * Math.sin(normalY * wave.freq * Math.PI * 2 + time * wave.speed);
  }
  return sum;
}

function drawStrip(leftAt, rightAt, alpha) {
  if (alpha <= 0.004 || !offCanvas) return;
  context.save();
  context.beginPath();
  context.moveTo(leftAt(0), 0);
  for (let y = CURVE_STEP; y < height; y += CURVE_STEP) context.lineTo(leftAt(y / height), y);
  context.lineTo(leftAt(1), height);
  context.lineTo(rightAt(1), height);
  for (let y = height - CURVE_STEP; y > 0; y -= CURVE_STEP) context.lineTo(rightAt(y / height), y);
  context.lineTo(rightAt(0), 0);
  context.closePath();
  context.clip();
  context.globalAlpha = alpha;
  context.drawImage(offCanvas, 0, 0, width, height);
  context.restore();
  context.globalAlpha = 1;
}

function drawDust(from, to, sweepOf, progress, time, arriving) {
  if (!sprite) return;
  for (let index = from; index < to; index++) {
    const particle = particles[index];
    const edge = sweepOf(particle) + warpAt(particle.homeY / Math.max(1, height), time);
    let travel = (progress - edge) / BAND;
    if (arriving) travel = 1 - travel;
    if (travel <= 0 || travel >= 1) continue;

    const eased = travel * travel;
    const swirl = Math.sin(particle.phase + travel * 4.2 + time * 0.0013) * particle.sway * travel;
    const x = particle.homeX + particle.driftX * eased + swirl;
    const y = particle.homeY + particle.driftY * eased - particle.rise * eased;
    const twinkle = 0.72 + 0.28 * Math.sin(time * 0.005 + particle.phase * 6.3);
    const alpha = particle.ink * Math.pow(1 - travel, 0.75) * Math.min(1, travel * 5) * twinkle;
    if (alpha <= 0.012) continue;

    const size = particle.size * (1 + travel * 1.1);
    context.globalAlpha = alpha;
    context.drawImage(sprite, x - size / 2, y - size / 2, size, size);
  }
  context.globalAlpha = 1;
}

function featherEdges() {
  const featherWidth = Math.min(120, width * 0.09);
  context.save();
  context.globalCompositeOperation = 'destination-out';

  const left = context.createLinearGradient(0, 0, featherWidth, 0);
  left.addColorStop(0, 'rgba(0,0,0,1)');
  left.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = left;
  context.fillRect(0, 0, featherWidth, height);

  const right = context.createLinearGradient(width, 0, width - featherWidth, 0);
  right.addColorStop(0, 'rgba(0,0,0,1)');
  right.addColorStop(1, 'rgba(0,0,0,0)');
  context.fillStyle = right;
  context.fillRect(width - featherWidth, 0, featherWidth, height);

  if (topClip > 1) {
    const featherHeight = Math.min(130, topClip * 1.6);
    const top = context.createLinearGradient(0, 0, 0, featherHeight);
    top.addColorStop(0, 'rgba(0,0,0,1)');
    top.addColorStop(1, 'rgba(0,0,0,0)');
    context.fillStyle = top;
    context.fillRect(0, 0, width, featherHeight);
  }
  context.restore();
}

function clear() {
  context.setTransform(dpr, 0, 0, dpr, 0, 0);
  context.clearRect(0, 0, width, height);
}

function drawStatic() {
  if (!offCanvas) return;
  clear();
  context.drawImage(offCanvas, 0, 0, width, height);
  featherEdges();
}

function drawFrame(now) {
  const elapsed = now - startTime;
  const cycleTime = elapsed % CYCLE_MS;
  let phase;
  let phaseTime = 0;

  if (cycleTime < HOLD_MS) {
    phase = 'hold';
  } else if (cycleTime < HOLD_MS + DISSOLVE_MS) {
    phase = 'dissolve';
    phaseTime = (cycleTime - HOLD_MS) / DISSOLVE_MS;
  } else if (cycleTime < HOLD_MS + DISSOLVE_MS + GAP_MS) {
    phase = 'gap';
  } else {
    phase = 'reform';
    phaseTime = (cycleTime - HOLD_MS - DISSOLVE_MS - GAP_MS) / REFORM_MS;
  }

  if (phase === 'hold' || phase === 'gap') {
    if (lastPhase === phase) return;
    lastPhase = phase;
    clear();
    if (phase === 'hold') drawStatic();
    return;
  }

  lastPhase = phase;
  clear();
  const eased = easeInOutSine(phaseTime);
  const progress = -WARP_MAX + eased * (1 + 2 * WARP_MAX + BAND);
  const step = BAND / STRIPS;

  if (phase === 'dissolve') {
    const xAt = (sample) => (normalY) => {
      const x = width * (1 - sample + warpAt(normalY, elapsed));
      return x < -2 ? -2 : x > width + 2 ? width + 2 : x;
    };
    drawStrip(() => -2, xAt(progress), 1);
    for (let strip = 0; strip < STRIPS; strip++) {
      drawStrip(
        xAt(progress - strip * step),
        xAt(progress - (strip + 1) * step),
        inkSurvival((strip + 0.5) / STRIPS),
      );
    }
    const low = lowerBound(particles, 1 - progress - WARP_MAX);
    const high = lowerBound(particles, 1 - progress + BAND + WARP_MAX);
    drawDust(low, high, (particle) => 1 - particle.fx, progress, elapsed, false);
  } else {
    const xAt = (sample) => (normalY) => {
      const x = width * (sample - warpAt(normalY, elapsed));
      return x < -2 ? -2 : x > width + 2 ? width + 2 : x;
    };
    drawStrip(() => -2, xAt(progress - BAND), 1);
    for (let strip = 0; strip < STRIPS; strip++) {
      drawStrip(
        xAt(progress - BAND + strip * step),
        xAt(progress - BAND + (strip + 1) * step),
        inkSurvival((strip + 0.5) / STRIPS),
      );
    }
    const low = lowerBound(particles, progress - BAND - WARP_MAX);
    const high = lowerBound(particles, progress + WARP_MAX);
    drawDust(low, high, (particle) => particle.fx, progress, elapsed, true);
  }
  featherEdges();
}

const requestFrame = (callback) => (
  typeof self.requestAnimationFrame === 'function'
    ? self.requestAnimationFrame(callback)
    : self.setTimeout(() => callback(performance.now()), 16)
);

const cancelFrame = (handle) => {
  if (typeof self.cancelAnimationFrame === 'function') self.cancelAnimationFrame(handle);
  else self.clearTimeout(handle);
};

function loop(now) {
  frame = null;
  if (!active || reduced || !source) return;
  drawFrame(now);
  frame = requestFrame(loop);
}

function updateActivity() {
  if (active && !reduced && source && frame === null) {
    frame = requestFrame(loop);
  } else if ((!active || reduced) && frame !== null) {
    cancelFrame(frame);
    frame = null;
  }
}

function resize(nextWidth, nextHeight, nextDpr) {
  width = nextWidth;
  height = nextHeight;
  dpr = nextDpr;
  if (!source) return;
  buildFrame();
  drawStatic();
}

self.onmessage = async ({ data }) => {
  if (data.type === 'init') {
    canvas = data.canvas;
    context = canvas.getContext('2d');
    width = data.width;
    height = data.height;
    dpr = data.dpr;
    reduced = data.reduced;
    active = data.active;
    sprite = makeDustSprite();

    try {
      const response = await fetch(data.src);
      if (!response.ok) return;
      source = await createImageBitmap(await response.blob());
      buildFrame();
      drawStatic();
      startTime = performance.now();
      updateActivity();
    } catch {
      // The footer remains a readable card if its decorative artwork cannot be fetched.
    }
  } else if (data.type === 'resize') {
    resize(data.width, data.height, data.dpr);
  } else if (data.type === 'active') {
    active = data.value;
    updateActivity();
  }
};
