import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineSegments2 } from 'three/addons/lines/LineSegments2.js';
import { LineSegmentsGeometry } from 'three/addons/lines/LineSegmentsGeometry.js';
import { CONFIG, TAU, buildGeometry } from './heroGlobeGeometry';

/**
 * A translucent particle shell, a faint geodesic net and local patches of charge.
 * Scrolling opens an irregular luminous boundary on the camera-facing surface while
 * pushing the camera forward. Dots and contour share the opening field, so the bright
 * edge clears the near hemisphere and leaves the far hemisphere visible through it.
 *
 * Geometry is seeded once per breakpoint; animation runs through GPU uniforms. The parent
 * owns scroll progress, and the renderer gently follows it without React frame updates.
 */

// A smooth multi-stop ramp from the shell's cool blue up to white-hot, shared by every layer
// so the net, the beads and the line all run the same temperature.
//
// The windows deliberately overlap. Two colours and a straight `mix` gives a hard-edged
// transition with a muddy purple in the middle; overlapping smoothsteps hand off gradually
// and the whole sweep from cold to white reads as one continuous gradient.
const HEAT_RAMP = /* glsl */ `
  vec3 heatRamp(float h) {
    // BynarIO palette: deep navy -> bright blue -> cyan -> magenta-pink -> white
    // Stronger pink/magenta accent starting at h > 0.7 to match BynarIO's visible
    // current-head coloring from the reference screenshots.
    vec3 c = vec3(0.22, 0.36, 0.78);
    c = mix(c, vec3(0.38, 0.56, 0.96), smoothstep(0.00, 0.24, h));
    c = mix(c, vec3(0.52, 0.72, 1.00), smoothstep(0.18, 0.44, h));
    c = mix(c, vec3(0.72, 0.88, 1.00), smoothstep(0.38, 0.64, h));
    c = mix(c, vec3(0.92, 0.72, 0.96), smoothstep(0.62, 0.82, h));
    c = mix(c, vec3(1.00, 0.86, 0.94), smoothstep(0.78, 0.92, h));
    c = mix(c, vec3(1.00, 1.00, 1.00), smoothstep(0.90, 1.00, h));
    return c;
  }
`;

// Shared by every moving layer. Gradient noise + a two-scale warp so the shell undulates
// as one piece: specks, the opening and currents all sample the same field.
const ALIVE = /* glsl */ `
  uniform float uTime;
  uniform vec4 uMorph;
  uniform vec3 uRipple;

  vec3 hash3(vec3 p) {
    p = vec3(
      dot(p, vec3(127.1, 311.7, 74.7)),
      dot(p, vec3(269.5, 183.3, 246.1)),
      dot(p, vec3(113.5, 271.9, 124.6))
    );
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float vnoise(vec3 p) {
    vec3 i = floor(p);
    vec3 f = fract(p);
    vec3 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(
        mix(dot(hash3(i + vec3(0.0, 0.0, 0.0)), f - vec3(0.0, 0.0, 0.0)),
            dot(hash3(i + vec3(1.0, 0.0, 0.0)), f - vec3(1.0, 0.0, 0.0)), u.x),
        mix(dot(hash3(i + vec3(0.0, 1.0, 0.0)), f - vec3(0.0, 1.0, 0.0)),
            dot(hash3(i + vec3(1.0, 1.0, 0.0)), f - vec3(1.0, 1.0, 0.0)), u.x),
        u.y
      ),
      mix(
        mix(dot(hash3(i + vec3(0.0, 0.0, 1.0)), f - vec3(0.0, 0.0, 1.0)),
            dot(hash3(i + vec3(1.0, 0.0, 1.0)), f - vec3(1.0, 0.0, 1.0)), u.x),
        mix(dot(hash3(i + vec3(0.0, 1.0, 1.0)), f - vec3(0.0, 1.0, 1.0)),
            dot(hash3(i + vec3(1.0, 1.0, 1.0)), f - vec3(1.0, 1.0, 1.0)), u.x),
        u.y
      ),
      u.z
    );
  }

  vec3 alive(vec3 p, float boost) {
    float r = length(p);
    vec3 n = p / max(r, 1e-5);
    float t = uTime * 0.001;
    vec3 drift = vec3(t * uMorph.z, t * uMorph.z * 0.71, -t * uMorph.z * 0.53);
    vec3 rdrift = vec3(-t * uRipple.z * 0.8, t * uRipple.z, t * uRipple.z * 0.55);
    float lobe = vnoise(n * uMorph.y + drift);
    float lobe2 = vnoise(n * uMorph.y * 2.15 + drift * 1.3 + vec3(4.2, 1.1, 0.0));
    float ripple = vnoise(n * uRipple.y + rdrift);
    float disp = (lobe * 0.72 + lobe2 * 0.28) * uMorph.x + ripple * uRipple.x;
    vec3 swirl = cross(n, vec3(0.18, 1.0, 0.37)) * (ripple * 0.55 + lobe * 0.45) * uMorph.w * boost;
    return n * (r * (1.0 + disp * boost)) + swirl * r;
  }
`;

const LIVE_TINT = /* glsl */ `
  uniform vec3 uTint;
  uniform float uTintAmt;

  vec3 liveTint(vec3 c) {
    return mix(c, c * uTint, uTintAmt);
  }
`;

// How far behind the head a point is, in radians, always positive.
const SWEEP = /* glsl */ `
  const float TAU = 6.283185307179586;
  float behindHead(float head, float ang) {
    return mod(head - ang, TAU);
  }
`;

// The opening faces the camera while the shell turns behind it. The same boundary is
// sampled by the dots and the luminous surface, keeping the clearing welded to its edge.
const OPENING = /* glsl */ `
  uniform float uOpening;

  float openingRadius(float angle) {
    float t = uTime * 0.001;
    float ripple = sin(angle * 3.0 + t * 0.42) * 0.14
      + sin(angle * 7.0 - t * 0.31 + 1.2) * 0.095
      + sin(angle * 13.0 + t * 0.55) * 0.052
      + sin(angle * 23.0 - t * 0.26) * 0.024;
    return uOpening * (1.0 + ripple);
  }

  float openingDistance(vec3 viewDir) {
    float angle = atan(viewDir.y, viewDir.x);
    return acos(clamp(viewDir.z, -1.0, 1.0)) - openingRadius(angle);
  }
`;

const SPECK_VERT = /* glsl */ `
  attribute float aWeight;
  attribute vec2 aTwinkle;
  attribute vec4 aSpark; // ang, band, gain, which current

  uniform vec2 uHeads;
  uniform vec2 uSparkTail;
  uniform float uFade;
  uniform float uDpr;
  uniform float uCamDist;
  uniform vec2 uSize;   // [far, near] in CSS px
  uniform vec2 uAlpha;  // [far, near]
  uniform vec2 uShell;  // the depth window the near/far split happens across
  uniform vec3 uPointer;     // the point on the shell under the cursor, in globe space
  uniform vec2 uPointerGlow; // [chord radius, gain]

  varying vec3 vColor;
  varying float vAlpha;
  varying float vAccentGlow;

  ${HEAT_RAMP}
  ${LIVE_TINT}
  ${ALIVE}
  ${SWEEP}
  ${OPENING}

  void main() {
    vec3 p = alive(position, 1.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);

    // Rotation-only transform of the position as a direction: its z is exactly the near/far
    // term, with no dependence on where the sphere sits in the frame.
    float depth = normalize((modelViewMatrix * vec4(p, 0.0)).xyz).z * 0.5 + 0.5;
    float d = smoothstep(uShell.x, uShell.y, depth);

    float heat = 0.0;
    if (aSpark.y > 0.0) {
      float head = aSpark.w < 0.5 ? uHeads.x : uHeads.y;
      float tail = aSpark.w < 0.5 ? uSparkTail.x : uSparkTail.y;
      float behind = behindHead(head, aSpark.x);
      if (behind <= tail) {
        // Holds near full brightness along the band and only guts out at the very tail — a
        // squared falloff leaves everything but the head a dull smear.
        heat = pow(1.0 - behind / tail, 0.6) * aSpark.y * aSpark.z;
      }
    }
    float hb = clamp(heat * 1.15, 0.0, 1.0);

    // Cursor ignition. Positions are already unit vectors, so the straight-line distance to
    // the point under the cursor is a chord and the lit region is a cap. Scaling by the
    // near/far term confines it to the near hemisphere — otherwise the cap bleeds through
    // the shell and lights the back of the sphere as brightly as the front.
    float lift = (1.0 - smoothstep(0.0, uPointerGlow.x, length(position - uPointer)))
      * uPointerGlow.y * d;

    float clearing = 1.0;
    float edgeLight = 0.0;
    // Before the opening starts both factors are constant. This uniform branch skips
    // the boundary's trigonometry for every speck without changing either fade curve.
    if (uOpening > 0.01) {
      vec3 viewDir = normalize((modelViewMatrix * vec4(p, 0.0)).xyz);
      float boundary = openingDistance(viewDir);
      clearing = mix(1.0, smoothstep(-0.035, 0.075, boundary),
        smoothstep(0.01, 0.08, uOpening));
      edgeLight = exp(-abs(boundary) * 45.0) * smoothstep(0.01, 0.12, uOpening);
    }
    float densityNoise = vnoise(position * 2.8 + vec3(uTime * 0.00008, 1.7, 0.0));
    float visibility = smoothstep(-0.34, 0.28, densityNoise);
    float twinkle = 0.78 + 0.22 * sin(uTime * aTwinkle.y + aTwinkle.x);
    float px = mix(uSize.x, uSize.y, d) * aWeight * (0.55 + visibility * 0.6)
      + hb * 1.8 + lift * 1.2 + edgeLight * 1.4;

    // BynarIO base particle colors: deeper navy-blue for far hemisphere, brighter ice-white
    // for near hemisphere. The far dots read as a faint blue wash, not grey.
    vColor = mix(
      mix(vec3(0.40, 0.50, 0.78), vec3(0.69, 0.78, 1.0), d),
      heatRamp(hb),
      smoothstep(0.0, 0.18, hb)
    );
    vColor = mix(vColor, vec3(0.80, 0.90, 1.0), clamp(lift * 0.7, 0.0, 1.0));
    vColor = liveTint(vColor);
    // Three small colour fields drift independently across the shell. Keeping each cap
    // tight leaves the globe calm, while HDR colour and a slightly wider point halo let the
    // yellow, green and pink accents breathe instead of reading as hard pixels.
    vec3 shellDir = normalize(position);
    float accentTime = uTime * 0.00018;
    vec3 pinkDir = normalize(vec3(sin(accentTime), -0.38, cos(accentTime)));
    vec3 greenDir = normalize(vec3(
      cos(accentTime * 0.83 + 2.15),
      0.28,
      sin(accentTime * 0.83 + 2.15)
    ));
    vec3 yellowDir = normalize(vec3(
      sin(-accentTime * 0.67 + 4.10),
      0.62,
      cos(-accentTime * 0.67 + 4.10)
    ));
    float pinkCharge = pow(max(0.0, dot(shellDir, pinkDir)), 52.0)
      * (0.78 + 0.22 * sin(uTime * 0.00082));
    float greenCharge = pow(max(0.0, dot(shellDir, greenDir)), 58.0)
      * (0.80 + 0.20 * sin(uTime * 0.00071 + 2.2));
    float yellowCharge = pow(max(0.0, dot(shellDir, yellowDir)), 62.0)
      * (0.82 + 0.18 * sin(uTime * 0.00064 + 4.1));
    float charge = pinkCharge + greenCharge + yellowCharge;
    float accentMix = clamp(charge, 0.0, 1.0);
    vec3 accentColor = (
      pinkCharge * vec3(1.22, 0.34, 0.68)
      + greenCharge * vec3(0.42, 1.14, 0.70)
      + yellowCharge * vec3(1.24, 1.00, 0.38)
    ) / max(charge, 0.001);
    vColor = mix(vColor, accentColor, accentMix);
    vAccentGlow = accentMix;
    px += accentMix * 1.15;
    vAlpha = (mix(uAlpha.x, uAlpha.y, d) * aWeight * twinkle
      + hb * 0.3 * (0.4 + d * 0.6) + accentMix * 0.78
      + lift * 0.35 + edgeLight * 0.6) * uFade * clearing * (0.4 + visibility * 0.6);

    gl_PointSize = px * uDpr * (uCamDist / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const SPECK_FRAG = /* glsl */ `
  precision highp float;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vAccentGlow;

  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    if (r > 1.0) discard;
    // A colourless core bleeding out into a wide soft halo — the two-term falloff is what
    // gives a speck a solid centre and a glow rather than one flat disc.
    float a = exp(-r * r * 16.0) * (1.1 + vAccentGlow * 0.12)
      + exp(-r * r * 4.5) * (0.10 + vAccentGlow * 0.11);
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

const CONTOUR_VERT = /* glsl */ `
  varying vec3 vViewDirection;
  ${ALIVE}
  void main() {
    vec3 p = alive(position, 1.0);
    vViewDirection = mat3(modelViewMatrix) * p;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const CONTOUR_FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform float uFade;
  varying vec3 vViewDirection;
  ${OPENING}
  void main() {
    if (uOpening < 0.012) discard;
    vec3 direction = normalize(vViewDirection);
    float distanceToEdge = abs(openingDistance(direction));
    float angle = atan(direction.y, direction.x);
    float t = uTime * 0.001;
    float hot = pow(0.5 + 0.5 * sin(angle * 3.0 - t * 1.15), 32.0);
    hot *= 0.55 + 0.45 * sin(angle * 7.0 + t * 0.6);
    float width = 0.0024 + hot * 0.012;
    float aa = max(fwidth(distanceToEdge), 0.0008);
    float core = 1.0 - smoothstep(width, width + aa * 1.4, distanceToEdge);
    float halo = exp(-distanceToEdge / (0.009 + hot * 0.025));
    float energy = core * (1.15 + hot * 1.8) + halo * 0.34;
    vec3 color = mix(vec3(0.34, 0.51, 1.0), vec3(0.72, 0.88, 1.15), core * 0.55 + hot * 0.45);
    float visibility = uFade * smoothstep(0.012, 0.07, uOpening);
    gl_FragColor = vec4(color * energy, min(1.0, energy) * visibility);
  }
`;

const RIBBON_VERT = /* glsl */ `
  attribute vec3 aAcross;
  attribute float aSide;
  attribute float aAlong;

  uniform float uHead;
  uniform float uTail;
  uniform float uWidthBase;
  uniform float uWidthGain;
  uniform float uTaper;
  uniform float uFade;

  varying float vSide;
  varying float vGlow;
  varying float vAlong;

  ${ALIVE}
  ${SWEEP}

  void main() {
    float ang = aAlong * TAU;
    float behind = behindHead(uHead, ang);
    float w = 0.0;
    vGlow = 0.0;

    if (behind <= uTail) {
      float t = behind / uTail;
      // Width and brightness run on different curves. Brightness holds along the whole line;
      // mass does not — that is what makes the head read as arriving charge rather than as
      // an even tube laid over the sphere.
      w = uWidthBase + uWidthGain * pow(1.0 - t, uTaper);
      vGlow = (0.28 + 0.82 * pow(1.0 - t, 0.75)) * uFade;
    }

    // Widen in the tangent plane, then renormalise, so the ribbon stays on the shell however
    // fat it gets. The nudge outward keeps it clear of the specks it runs over.
    //
    // Morph is taken from the centreline once and copied onto both sides. Warping each
    // vertex on its own tears the strip into a smear, which is how the travelling line
    // disappeared — the head was still lighting specks, but the ribbon itself had no body.
    vec3 rest = position;
    vec3 p = normalize(rest + aAcross * (aSide * w)) * 1.006;
    p += alive(rest, 1.0) - rest;
    vSide = aSide;
    vAlong = aAlong;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const RIBBON_FRAG = /* glsl */ `
  precision highp float;
  uniform float uTime;
  varying float vSide;
  varying float vGlow;
  varying float vAlong;

  ${HEAT_RAMP}
  ${LIVE_TINT}

  void main() {
    if (vGlow <= 0.001) discard;
    float e = abs(vSide);
    float core = pow(1.0 - e, 5.0);
    float halo = pow(1.0 - e, 1.6);
    // A high-frequency term along the line's own length, so a thick rope still crackles
    // instead of reading as a smooth tube.
    float sparkle = 0.74 + 0.26 * sin(vAlong * 420.0 + uTime * 0.011);
    vec3 col = liveTint(mix(vec3(0.55, 0.75, 1.0), vec3(1.0), core * sparkle));
    gl_FragColor = vec4(col, (core * 0.95 * sparkle + halo * 0.16) * vGlow);
  }
`;

const MOTE_VERT = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;

  uniform float uTime;
  uniform float uDpr;
  uniform float uCamDist;
  uniform float uFade;

  varying float vAlpha;
  varying float vShine;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float dist = -mv.z;
    float twinkle = 0.5 + 0.5 * sin(uTime * (0.0007 + aPhase * 0.00035) + aPhase);
    vShine = pow(twinkle, 10.0);
    // Keep stars off the globe's face so they live in the night field around it.
    float disc = length(mv.xy) / max(dist, 0.01);
    float globeAng = 1.35 / max(uCamDist, 0.5);
    float offGlobe = smoothstep(globeAng * 0.92, globeAng * 1.55, disc);
    vAlpha = (0.28 + 0.72 * vShine) * uFade * offGlobe
      * smoothstep(0.55, 2.1, dist);
    gl_PointSize = min(
      mix(aSize, aSize * 1.85, vShine) * uDpr * (uCamDist / max(dist, 0.35)),
      16.0 * uDpr
    );
    gl_Position = projectionMatrix * mv;
  }
`;

const MOTE_FRAG = /* glsl */ `
  precision highp float;
  uniform vec3 uColor;
  uniform float uAlpha;
  varying float vAlpha;
  varying float vShine;

  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv) * 2.0;
    if (r > 1.0) discard;
    float disc = pow(1.0 - r, 2.2) * 0.7 + pow(1.0 - r, 8.0) * 0.55;
    float spike = max(0.0, 1.0 - abs(uv.x) * 16.0) * max(0.0, 1.0 - abs(uv.y) * 2.4)
                + max(0.0, 1.0 - abs(uv.y) * 16.0) * max(0.0, 1.0 - abs(uv.x) * 2.4);
    float a = disc + spike * (0.28 + vShine * 0.9);
    gl_FragColor = vec4(uColor, a * vAlpha * uAlpha);
  }
`;

// --- post ---------------------------------------------------------------------------
// Position arrives already in clip space, so the quad needs no matrices at all.
const QUAD_VERT = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// The scene buffer is half float, so a speck cluster genuinely sums past 1.0 instead of
// flattening at white. That headroom is what the threshold reads: everything below it is
// discarded outright, so only the cores bleed and the field of dim specks stays crisp.
const BRIGHT_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D tSrc;
  uniform float uThreshold;
  uniform float uKnee;
  varying vec2 vUv;

  void main() {
    vec4 c = texture2D(tSrc, vUv);
    float energy = max(c.r, max(c.g, c.b));
    float w = smoothstep(uThreshold, uThreshold + uKnee, energy);
    gl_FragColor = vec4(c.rgb * w, c.a * w);
  }
`;

// Nine-tap Gaussian for five fetches: the outer taps sit between texels and let the
// bilinear unit average each pair on the way in.
const BLUR_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D tSrc;
  uniform vec2 uStep;
  varying vec2 vUv;

  void main() {
    vec4 sum = texture2D(tSrc, vUv) * 0.2270270270;
    sum += (texture2D(tSrc, vUv + uStep * 1.3846153846)
          + texture2D(tSrc, vUv - uStep * 1.3846153846)) * 0.3162162162;
    sum += (texture2D(tSrc, vUv + uStep * 3.2307692308)
          + texture2D(tSrc, vUv - uStep * 3.2307692308)) * 0.0702702703;
    gl_FragColor = sum;
  }
`;

const COMPOSITE_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D tScene;
  uniform sampler2D tBloom;
  uniform float uStrength;
  varying vec2 vUv;

  void main() {
    vec4 s = texture2D(tScene, vUv);
    vec4 b = texture2D(tBloom, vUv);
    // Alpha has to rise with the bloom. The canvas is composited over the CSS grade rather
    // than over black, so a halo with no alpha behind it is simply not there.
    gl_FragColor = vec4(s.rgb + b.rgb * uStrength, min(1.0, s.a + b.a * uStrength));
  }
`;

const additive = (extra) => ({
  transparent: true,
  blending: THREE.AdditiveBlending,
  depthTest: false,
  depthWrite: false,
  ...extra,
});

const NODE_VERT = /* glsl */ `
  attribute float aSeed;
  attribute float aHop;

  uniform float uFade;
  uniform float uWarp;
  uniform float uDpr;
  uniform float uCamDist;
  uniform vec2 uSize;
  uniform float uFlow;
  uniform float uWave;
  uniform float uBfsAmt;

  varying float vAlpha;
  varying float vShine;
  ${ALIVE}
  void main() {
    #ifdef WARP_CAGE
    vec3 p = mix(position, alive(position, 1.0), uWarp);
    #else
    vec3 p = position;
    #endif
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    vec3 viewN = normalize((modelViewMatrix * vec4(normalize(position), 0.0)).xyz);
    float depth = viewN.z * 0.5 + 0.5;
    float idle = 0.42 + 0.22 * sin(uTime * 0.00085 + aSeed * 6.2831853);
    float flash = pow(max(0.0, sin(uTime * (0.0011 + aSeed * 0.0024) + aSeed * 17.3)), 18.0);
    float meridian = dot(normalize(position), vec3(0.16, 0.52, 0.84)) * 0.5 + 0.5;
    float flow = fract(uTime * uFlow + meridian * 0.58 + aSeed * 0.16);
    float pass = exp(-min(flow, 1.0 - flow) * 22.0);
    float twinkle = clamp(flash * 1.15 + pass * 0.55, 0.0, 1.0);

    float pulse = exp(-(uWave - aHop) * (uWave - aHop) * 22.0);
    vShine = max(twinkle, pulse * uBfsAmt);
    float vis = mix(mix(1.0, 0.08, depth), 1.0, uBfsAmt);
    vAlpha = (idle * 0.7 + vShine * 1.35) * vis * uFade;
    gl_PointSize = mix(uSize.x, uSize.y, vShine) * uDpr * (uCamDist / max(-mv.z, 0.35));
    gl_Position = projectionMatrix * mv;
  }
`;

const NODE_FRAG = /* glsl */ `
  precision highp float;
  varying float vAlpha;
  varying float vShine;
  ${LIVE_TINT}
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float r = length(uv) * 2.0;
    if (r > 1.0) discard;
    float disc = pow(1.0 - r, 2.4) * 0.72 + pow(1.0 - r, 9.0) * 0.7;
    float spike = max(0.0, 1.0 - abs(uv.x) * 18.0) * max(0.0, 1.0 - abs(uv.y) * 2.6)
                + max(0.0, 1.0 - abs(uv.y) * 18.0) * max(0.0, 1.0 - abs(uv.x) * 2.6);
    float a = disc + spike * (0.35 + vShine * 0.85);
    vec3 col = mix(vec3(0.82, 0.90, 1.0), vec3(1.0), vShine);
    gl_FragColor = vec4(liveTint(col), a * vAlpha);
  }
`;

function wireCageFacing(mat, waveU, bfsU) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uWave = waveU;
    shader.uniforms.uBfsAmt = bfsU;
    shader.vertexShader = shader.vertexShader
      .replace(
        '#include <clipping_planes_pars_vertex>',
        `#include <clipping_planes_pars_vertex>
        attribute float instanceHopA;
        attribute float instanceHopB;
        varying float vCageFacing;
        varying float vHopA;
        varying float vHopB;
        varying float vT;`,
      )
      .replace(
        'vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );',
        `vec4 start = modelViewMatrix * vec4( instanceStart, 1.0 );
        vCageFacing = normalize(mat3(modelViewMatrix) * mix(instanceStart, instanceEnd, 0.5)).z * 0.5 + 0.5;
        vHopA = instanceHopA;
        vHopB = instanceHopB;
        vT = position.y < 0.5 ? 0.0 : 1.0;`,
      );
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <clipping_planes_pars_fragment>',
        `#include <clipping_planes_pars_fragment>
        varying float vCageFacing;
        varying float vHopA;
        varying float vHopB;
        varying float vT;
        uniform float uWave;
        uniform float uBfsAmt;`,
      )
      .replace(
        'float alpha = opacity;',
        `float facing = mix(1.0, 0.07, pow(clamp(vCageFacing, 0.0, 1.0), 1.45) * (1.0 - uBfsAmt));
        float lo = min(vHopA, vHopB);
        float hi = max(vHopA, vHopB);
        float t = clamp(vT, 0.0, 1.0);
        float fromLo = abs(hi - lo) < 0.05
          ? t
          : abs(mix(vHopA, vHopB, t) - lo) / max(hi - lo, 0.001);
        float d = (uWave - lo) - fromLo;
        float head = exp(-d * d * 72.0);
        float tail = exp(-max(d, 0.0) * 7.8) * smoothstep(-0.04, 0.02, d);
        float flow = (head * 0.95 + tail * 0.32) * uBfsAmt;
        float glow = clamp((head * 0.85 + tail * 0.28) * uBfsAmt, 0.0, 1.0);
        float alpha = opacity * facing + flow * 0.75;
        vec3 bfsCol = vec3(1.0);`
      )
      .replace(
        'vec4 diffuseColor = vec4( diffuse, alpha );',
        'vec4 diffuseColor = vec4( mix(diffuse, bfsCol, glow), alpha );',
      );
  };
  mat.customProgramCacheKey = () => 'cage-white-flow-v8';
}

function buildCageGraph(wire) {
  const pos = wire.attributes.position;
  const idOf = new Map();
  const verts = [];
  const idAt = (i) => {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const k = `${x.toFixed(4)}|${y.toFixed(4)}|${z.toFixed(4)}`;
    if (!idOf.has(k)) {
      idOf.set(k, verts.length / 3);
      verts.push(x, y, z);
    }
    return idOf.get(k);
  };
  const adj = [];
  const segs = [];
  for (let i = 0; i < pos.count; i += 2) {
    const a = idAt(i);
    const b = idAt(i + 1);
    segs.push(a, b);
    (adj[a] ||= []).push(b);
    (adj[b] ||= []).push(a);
  }
  let seed = 0;
  let bestY = -2;
  const n = verts.length / 3;
  for (let i = 0; i < n; i++) {
    if (verts[i * 3 + 1] > bestY) {
      bestY = verts[i * 3 + 1];
      seed = i;
    }
  }
  const hop = new Float32Array(n);
  hop.fill(-1);
  const q = [seed];
  hop[seed] = 0;
  let maxHop = 0;
  for (let qi = 0; qi < q.length; qi++) {
    const u = q[qi];
    for (const v of adj[u] || []) {
      if (hop[v] < 0) {
        hop[v] = hop[u] + 1;
        maxHop = Math.max(maxHop, hop[v]);
        q.push(v);
      }
    }
  }
  const hopA = new Float32Array(segs.length / 2);
  const hopB = new Float32Array(segs.length / 2);
  for (let i = 0; i < segs.length; i += 2) {
    hopA[i / 2] = Math.max(0, hop[segs[i]]);
    hopB[i / 2] = Math.max(0, hop[segs[i + 1]]);
  }
  return { verts: new Float32Array(verts), hop, hopA, hopB, maxHop };
}

const attr = (a, size) => new THREE.BufferAttribute(new Float32Array(a), size);

export default function HeroParticleGlobe({ progressRef }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        // Every layer composites without depth testing; an MSAA depth attachment
        // would consume GPU memory without affecting a single pixel.
        depth: false,
        powerPreference: 'high-performance',
      });
    } catch {
      // The hero copy remains usable when WebGL is unavailable.
      return;
    }
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.layers.enable(1);
    const camera = new THREE.PerspectiveCamera(CONFIG.fov, 1, 0.1, 100);
    camera.position.z = CONFIG.camera.rest;
    const globe = new THREE.Group();
    globe.layers.enable(1);
    scene.add(globe);

    // The dust is deliberately not a child of the globe: it counter-rotates on its own much
    // slower axis, and that difference in rate is the entire parallax cue.
    const moteField = new THREE.Group();
    scene.add(moteField);

    const uniforms = {
      uTime: { value: 0 },
      uHeads: { value: new THREE.Vector2() },
      uFade: { value: 1 },
      uOpening: { value: 0 },
      uDpr: { value: 1 },
      uMorph: { value: new THREE.Vector4(
        CONFIG.morph.amount,
        CONFIG.morph.freq,
        CONFIG.morph.speed,
        CONFIG.morph.swirl,
      ) },
      uRipple: { value: new THREE.Vector3(
        CONFIG.morph.ripple,
        CONFIG.morph.rippleFreq,
        CONFIG.morph.rippleSpeed,
      ) },
      uTint: { value: new THREE.Color(1, 1, 1) },
      uTintAmt: { value: CONFIG.tint.strength },
    };

    // Survive the rebuild that happens at every breakpoint, so the render loop can hold on
    // to one reference each instead of rediscovering them after every `build`.
    const pointerUniforms = {
      uPointer: { value: new THREE.Vector3(0, 0, 1) },
      uPointerGlow: { value: new THREE.Vector2(CONFIG.pointerGlow.radius, 0) },
    };
    const moteFade = { value: 1 };

    // No glass-like fresnel shell: the light belongs to individual points and the opening.
    const contour = new THREE.Mesh(
      new THREE.SphereGeometry(1.004, 128, 96),
      new THREE.ShaderMaterial(additive({
        vertexShader: CONTOUR_VERT,
        fragmentShader: CONTOUR_FRAG,
        side: THREE.FrontSide,
        uniforms,
      })),
    );
    contour.frustumCulled = false;
    globe.add(contour);

    let meshes = [];
    let ribbons = [];
    let ribbonUniforms = [];
    let cageFadeUniform = null;
    let cageLineMat = null;
    const cageWave = { value: -2 };
    const cageBfsAmt = { value: 0 };
    let cageMaxHop = 8;
    let built = 0;
    let view = null;
    // `host` is `absolute inset-0` inside the sticky hero stage, so its viewport rect only
    // moves on an actual resize — not on scroll, while the stage is pinned. Caching it here
    // and refreshing inside `resize()` means the pointer handler below never forces a
    // synchronous layout read on every single `pointermove`, the way `useParallax` already
    // avoids the same cost for scroll.
    let hostRect = null;

    /** Releases the previous breakpoint's buffers before the next set is built. */
    const disposeMeshes = () => {
      for (const m of meshes) {
        m.removeFromParent();
        m.geometry.dispose();
        m.material.dispose();
      }
      meshes = [];
      ribbons = [];
      ribbonUniforms = [];
      cageLineMat = null;
    };

    const build = (count, moteCount) => {
      disposeMeshes();
      const geo = buildGeometry(count, moteCount);
      const cur = CONFIG.currents;

      // --- specks -------------------------------------------------------------------
      const sg = new THREE.BufferGeometry();
      sg.setAttribute('position', new THREE.BufferAttribute(geo.specks.position, 3));
      sg.setAttribute('aWeight', new THREE.BufferAttribute(geo.specks.weight, 1));
      sg.setAttribute('aTwinkle', new THREE.BufferAttribute(geo.specks.twinkle, 2));
      sg.setAttribute('aSpark', new THREE.BufferAttribute(geo.specks.spark, 4));
      const specks = new THREE.Points(sg, new THREE.ShaderMaterial(additive({
        vertexShader: SPECK_VERT,
        fragmentShader: SPECK_FRAG,
        uniforms: {
          ...uniforms,
          uSparkTail: { value: new THREE.Vector2(cur[0].sparkTail, cur[0].sparkTail) },
          uCamDist: { value: CONFIG.camDist },
          uSize: { value: new THREE.Vector2(...CONFIG.speck.size) },
          uAlpha: { value: new THREE.Vector2(...CONFIG.speck.alpha) },
          uShell: { value: new THREE.Vector2(...CONFIG.speck.shell) },
          ...pointerUniforms,
        },
      })));
      specks.frustumCulled = false;
      globe.add(specks);
      meshes.push(specks);

      // --- motes --------------------------------------------------------------------
      const mg = new THREE.BufferGeometry();
      mg.setAttribute('position', new THREE.BufferAttribute(geo.motes.position, 3));
      mg.setAttribute('aSize', new THREE.BufferAttribute(geo.motes.size, 1));
      mg.setAttribute('aPhase', new THREE.BufferAttribute(geo.motes.phase, 1));
      const motes = new THREE.Points(mg, new THREE.ShaderMaterial(additive({
        vertexShader: MOTE_VERT,
        fragmentShader: MOTE_FRAG,
        uniforms: {
          uTime: uniforms.uTime,
          uDpr: uniforms.uDpr,
          uFade: moteFade,
          uCamDist: { value: CONFIG.camDist },
          uAlpha: { value: CONFIG.motes.alpha },
          uColor: { value: new THREE.Color(0.86, 0.92, 1.0) },
        },
      })));
      motes.frustumCulled = false;
      moteField.add(motes);
      meshes.push(motes);

      // --- transparent geodesic grid + star nodes --------------------------------
      // Hairline ice, drawn after bloom so 1px strokes stay visible. The particle
      // surface is untouched; this is only the faint net and its twinkling vertices.
      cageFadeUniform = { value: 1 };
      const srcCage = new THREE.IcosahedronGeometry(CONFIG.cage.scale, CONFIG.cage.detail);
      const wire = new THREE.WireframeGeometry(srcCage);
      const graph = buildCageGraph(wire);
      cageMaxHop = Math.max(1, graph.maxHop);
      const lineGeo = new LineSegmentsGeometry().fromWireframeGeometry(wire);
      wire.dispose();
      lineGeo.setAttribute('instanceHopA', new THREE.InstancedBufferAttribute(graph.hopA, 1));
      lineGeo.setAttribute('instanceHopB', new THREE.InstancedBufferAttribute(graph.hopB, 1));
      cageLineMat = new LineMaterial({
        color: 0x91a7d1,
        linewidth: CONFIG.cage.linePx,
        worldUnits: false,
        dashed: false,
        transparent: true,
        opacity: 0.14,
        depthTest: false,
        depthWrite: false,
        blending: THREE.NormalBlending,
        toneMapped: false,
        premultipliedAlpha: false,
      });
      wireCageFacing(cageLineMat, cageWave, cageBfsAmt);
      if (view) renderer.getDrawingBufferSize(cageLineMat.resolution);
      const cage = new LineSegments2(lineGeo, cageLineMat);
      cage.frustumCulled = false;
      cage.renderOrder = 10;
      cage.layers.set(1);
      globe.add(cage);
      meshes.push(cage);

      srcCage.dispose();
      const ng = new THREE.BufferGeometry();
      ng.setAttribute('position', new THREE.BufferAttribute(graph.verts, 3));
      const nodeSeed = new Float32Array(graph.hop.length);
      for (let i = 0; i < graph.hop.length; i++) {
        nodeSeed[i] = (Math.sin(graph.verts[i * 3] * 91.7 + graph.verts[i * 3 + 1] * 47.3 + graph.verts[i * 3 + 2] * 13.1) * 0.5 + 0.5);
      }
      ng.setAttribute('aSeed', new THREE.BufferAttribute(nodeSeed, 1));
      ng.setAttribute('aHop', new THREE.BufferAttribute(graph.hop, 1));
      const nodes = new THREE.Points(ng, new THREE.ShaderMaterial(additive({
        vertexShader: NODE_VERT,
        fragmentShader: NODE_FRAG,
        defines: CONFIG.cage.warp ? { WARP_CAGE: 1 } : {},
        uniforms: {
          ...uniforms,
          uFade: cageFadeUniform,
          uWarp: { value: CONFIG.cage.warp },
          uCamDist: { value: CONFIG.camDist },
          uSize: { value: new THREE.Vector2(...CONFIG.cage.nodeSize) },
          uFlow: { value: CONFIG.net.flow },
          uWave: cageWave,
          uBfsAmt: cageBfsAmt,
        },
      })));
      nodes.frustumCulled = false;
      nodes.renderOrder = 11;
      nodes.layers.set(1);
      globe.add(nodes);
      meshes.push(nodes);

      // --- currents -----------------------------------------------------------------
      geo.ribbons.forEach((r, f) => {
        const rg = new THREE.BufferGeometry();
        rg.setAttribute('position', attr(r.pos, 3));
        rg.setAttribute('aAcross', attr(r.across, 3));
        rg.setAttribute('aSide', attr(r.side, 1));
        rg.setAttribute('aAlong', attr(r.along, 1));
        rg.setIndex(r.index);
        const u = {
          uTime: uniforms.uTime,
          uFade: { value: 0.1 },
          uHead: { value: 0 },
          uTail: { value: cur[f].tail },
          uWidthBase: { value: CONFIG.line.widthBase },
          uWidthGain: { value: CONFIG.line.widthGain },
          uTaper: { value: CONFIG.line.taper },
          uMorph: uniforms.uMorph,
          uRipple: uniforms.uRipple,
          uTint: uniforms.uTint,
          uTintAmt: uniforms.uTintAmt,
        };
        const ribbon = new THREE.Mesh(rg, new THREE.ShaderMaterial(additive({
          vertexShader: RIBBON_VERT,
          fragmentShader: RIBBON_FRAG,
          side: THREE.DoubleSide,
          uniforms: u,
        })));
        ribbon.frustumCulled = false;
        globe.add(ribbon);
        meshes.push(ribbon);
        ribbons.push(ribbon);
        ribbonUniforms.push(u);
      });

      built = count;
    };

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const smoothstep = (value, from, to) => {
      const t = THREE.MathUtils.clamp((value - from) / (to - from), 0, 1);
      return t * t * (3 - 2 * t);
    };
    const mix = (a, b, t) => a + (b - a) * t;

    const pointerNdc = new THREE.Vector2();
    let pointerActive = false;
    const rayOrigin = new THREE.Vector3();
    const rayDir = new THREE.Vector3();
    const inverseGlobe = new THREE.Matrix4();

    /**
     * Resolves the cursor to a point on the shell, in the globe's own space.
     *
     * Working in globe space rather than screen space is what keeps the lit cap pinned under
     * the cursor while the sphere turns underneath it — a screen-space test would smear the
     * highlight across whatever specks happened to project nearby.
     */
    const updatePointerTarget = (fade) => {
      const gain = pointerActive ? CONFIG.pointerGlow.gain * fade : 0;
      pointerUniforms.uPointerGlow.value.y +=
        (gain - pointerUniforms.uPointerGlow.value.y) * 0.09;
      if (pointerUniforms.uPointerGlow.value.y < 0.001) return;

      rayOrigin.setFromMatrixPosition(camera.matrixWorld);
      rayDir.set(pointerNdc.x, pointerNdc.y, 0.5).unproject(camera).sub(rayOrigin).normalize();
      inverseGlobe.copy(globe.matrixWorld).invert();
      rayOrigin.applyMatrix4(inverseGlobe);
      rayDir.transformDirection(inverseGlobe);
      // Point of closest approach to the centre, projected back onto the shell. Unlike a
      // true intersection this still resolves when the cursor is off the sphere, so the
      // highlight slides to the limb and stays there instead of snapping away.
      pointerUniforms.uPointer.value
        .copy(rayDir)
        .multiplyScalar(-rayOrigin.dot(rayDir))
        .add(rayOrigin)
        .normalize();
    };

    // --- post chain -------------------------------------------------------------------
    const bloomOn = CONFIG.bloom.enabled;
    const passScene = new THREE.Scene();
    const passCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const passMaterial = (fragmentShader, uniformValues) => new THREE.ShaderMaterial({
      vertexShader: QUAD_VERT,
      fragmentShader,
      uniforms: uniformValues,
      depthTest: false,
      depthWrite: false,
      blending: THREE.NoBlending,
    });

    const brightPass = passMaterial(BRIGHT_FRAG, {
      tSrc: { value: null },
      uThreshold: { value: CONFIG.bloom.threshold },
      uKnee: { value: CONFIG.bloom.knee },
    });
    const blurPass = passMaterial(BLUR_FRAG, {
      tSrc: { value: null },
      uStep: { value: new THREE.Vector2() },
    });
    const compositePass = passMaterial(COMPOSITE_FRAG, {
      tScene: { value: null },
      tBloom: { value: null },
      uStrength: { value: CONFIG.bloom.strength },
    });

    const passQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), compositePass);
    passQuad.frustumCulled = false;
    passScene.add(passQuad);

    let rtScene = null;
    let rtBloomA = null;
    let rtBloomB = null;
    const bloomTexel = new THREE.Vector2();

    const disposeTargets = () => {
      for (const rt of [rtScene, rtBloomA, rtBloomB]) if (rt) rt.dispose();
      rtScene = rtBloomA = rtBloomB = null;
    };

    const makeTargets = (pw, ph) => {
      disposeTargets();
      const options = { depthBuffer: false, stencilBuffer: false, type: THREE.HalfFloatType };
      // Deliberately not multisampled. A half-float MSAA buffer at this size runs to a couple
      // of hundred megabytes and tile-based GPUs drop whole tiles out of the resolve, which
      // shows up as rectangular holes in the frame. Nothing here has a hard geometric edge
      // that would miss it — the points are soft in the shader and the bloom re-softens the
      // rest — so the buffer stays single-sampled.
      rtScene = new THREE.WebGLRenderTarget(pw, ph, options);
      // Quarter resolution. The blur is the one place a wide radius is cheap, and at this
      // scale the bilinear stretch back up costs nothing in a halo that is soft anyway.
      const bw = Math.max(1, Math.round(pw / 4));
      const bh = Math.max(1, Math.round(ph / 4));
      rtBloomA = new THREE.WebGLRenderTarget(bw, bh, options);
      rtBloomB = new THREE.WebGLRenderTarget(bw, bh, options);
      bloomTexel.set(1 / bw, 1 / bh);
    };

    const runPass = (material, target) => {
      passQuad.material = material;
      renderer.setRenderTarget(target);
      renderer.render(passScene, passCamera);
    };

    const resize = () => {
      const w = host.offsetWidth;
      const h = host.offsetHeight;
      if (w < 10 || h < 10) return;
      hostRect = host.getBoundingClientRect();
      // Every post pass is paid for per drawing-buffer pixel, so the ceiling comes down when
      // the chain is on. Between 1.5x and 1.8x there is nothing to see in a field of soft
      // points, and the difference is a third of the fill cost across five passes.
      const dpr = Math.min(window.devicePixelRatio || 1, bloomOn ? 1.5 : 1.8);
      if (view && view.w === w && view.h === h && view.dpr === dpr) return;
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      uniforms.uDpr.value = dpr;
      view = { w, h, dpr };
      if (bloomOn) makeTargets(Math.round(w * dpr), Math.round(h * dpr));
      if (cageLineMat) renderer.getDrawingBufferSize(cageLineMat.resolution);

      const narrow = w < 768;
      const want = narrow
        ? CONFIG.specks.mobile
        : w < 1280 ? CONFIG.specks.tablet : CONFIG.specks.desktop;
      const wantMotes = narrow
        ? CONFIG.motes.mobile
        : w < 1280 ? CONFIG.motes.tablet : CONFIG.motes.desktop;
      if (built !== want) build(want, wantMotes);
    };

    let easedScroll = 0;
    let previousScroll = 0;
    let previousElapsed = 0;

    const render = (elapsed) => {
      if (!view) return;
      const { w } = view;

      const targetScroll = THREE.MathUtils.clamp(
        (progressRef ? progressRef.current : 0) * CONFIG.scrollSensitivity,
        0,
        1,
      );
      const dt = Math.min(0.05, Math.max(0.001, (elapsed - previousElapsed) / 1000));
      previousElapsed = elapsed;
      const follow = 1 - Math.exp(-CONFIG.damping * dt);
      easedScroll += (targetScroll - easedScroll) * follow;
      const scrollVelocity = (easedScroll - previousScroll) / dt;
      previousScroll = easedScroll;
      const scroll = easedScroll;

      // The pinned timeline ends one viewport before the stage leaves. Hold a visible
      // mesh and far-side particles through that entire exit; the seam masks them.
      const sceneFade = 1 - smoothstep(scroll, 0.86, 1) * 0.3;
      const particleFade = (1 - smoothstep(scroll, 0.65, 0.94) * 0.8) * sceneFade;
      uniforms.uFade.value = particleFade;
      uniforms.uOpening.value = smoothstep(scroll, 0.12, 0.76) * 1.48;
      // Match the fragment shader's discard exactly. At rest the 24,320-triangle
      // surface is wholly invisible; it needs no vertex shading or rasterization.
      contour.visible = uniforms.uOpening.value >= 0.012;
      const insidePush = smoothstep(scroll, 0.34, 0.94);
      if (cageFadeUniform) {
        cageFadeUniform.value = 0.65 * sceneFade;
      }
      cageBfsAmt.value = (0.16 + 0.08 * insidePush) * sceneFade;
      if (cageBfsAmt.value > 0.001) {
        cageWave.value = (elapsed * CONFIG.net.bfs) % (cageMaxHop + 7.5);
      } else {
        cageWave.value = -2;
      }
      if (cageLineMat) {
        cageLineMat.opacity = (0.075 + 0.035 * insidePush) * sceneFade;
        cageLineMat.linewidth = CONFIG.cage.linePx;
      }
      uniforms.uTime.value = elapsed;

      // Slow cyan ↔ magenta drift. Two out-of-phase sines so the cycle never lands on the
      // same pair of values twice in a row — a single oscillator reads as a blink.
      const hue = elapsed * CONFIG.tint.speed;
      const cyan = 0.5 + 0.5 * Math.sin(hue);
      const magenta = 0.5 + 0.5 * Math.sin(hue * 0.73 + 1.9);
      uniforms.uTint.value.set(
        0.76 + magenta * 0.42,
        0.80 + cyan * 0.24,
        1.04 + cyan * 0.08,
      );

      const wide = w >= 1024;
      const firstPush = smoothstep(scroll, 0.0, 0.34);
      // Keep the opening sphere proportional to the narrower dimension on phones.
      const responsiveDistance = Math.max(1, 0.72 / camera.aspect);
      const restDistance = CONFIG.camera.rest;
      let cameraDistance = mix(restDistance, CONFIG.camera.detail, firstPush);
      cameraDistance = mix(cameraDistance, CONFIG.camera.inside, insidePush);
      cameraDistance *= responsiveDistance;
      cameraDistance -= THREE.MathUtils.clamp(
        scrollVelocity * CONFIG.velocityPush,
        -0.10,
        0.16,
      );
      camera.position.z = Math.max(0.98, cameraDistance);

      // A breath under a percent. Too small to read as a scale change, large enough that the
      // sphere never sits perfectly still — which is what makes a static render look dead.
      globe.scale.setScalar(1 + Math.sin(elapsed * CONFIG.breathe.speed) * CONFIG.breathe.amount);
      const offset = wide ? CONFIG.offset.wide : CONFIG.offset.narrow;
      globe.position.x = offset.x;
      globe.position.y = -offset.y * (1 - insidePush);

      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;
      globe.rotation.y =
        elapsed * CONFIG.yawSpeed +
        pointer.x * CONFIG.parallax +
        scroll * CONFIG.scrollSpin +
        THREE.MathUtils.clamp(scrollVelocity * 0.018, -0.08, 0.08);
      globe.rotation.x =
        Math.sin(elapsed * 0.00012) * CONFIG.pitchWobble + pointer.y * CONFIG.parallax * 0.55;

      // Counter-rotating and an order of magnitude slower, so the dust reads as the volume
      // the globe is suspended in rather than as more of the globe.
      moteField.rotation.y = -elapsed * CONFIG.motes.spin;
      moteField.rotation.x = pointer.y * CONFIG.parallax * 0.3;
      moteFade.value = 0.92 - smoothstep(scroll, 0.80, 0.97) * 0.25;

      for (let f = 0; f < CONFIG.currents.length; f++) {
        const head = (((elapsed * CONFIG.currents[f].speed) % TAU) + TAU) % TAU;
        uniforms.uHeads.value.setComponent(f, head);
        if (ribbonUniforms[f]) {
          ribbonUniforms[f].uHead.value = head;
          ribbonUniforms[f].uFade.value = 0.10 * (1 - smoothstep(scroll, 0.08, 0.25));
          ribbons[f].visible = ribbonUniforms[f].uFade.value > 0;
        }
      }

      camera.updateMatrixWorld();
      globe.updateMatrixWorld();
      updatePointerTarget(particleFade);

      const drawCage = () => {
        renderer.autoClear = false;
        camera.layers.set(1);
        renderer.render(scene, camera);
        renderer.autoClear = true;
        camera.layers.set(0);
      };

      camera.layers.set(0);
      if (bloomOn && rtScene) {
        renderer.setRenderTarget(rtScene);
        renderer.render(scene, camera);

        brightPass.uniforms.tSrc.value = rtScene.texture;
        runPass(brightPass, rtBloomA);

        // Each iteration doubles the tap spacing over the same five fetches, so the reach of
        // the halo grows geometrically while the cost only grows linearly.
        for (let i = 0; i < CONFIG.bloom.passes; i++) {
          const spread = CONFIG.bloom.spread * (1 << i);
          blurPass.uniforms.tSrc.value = rtBloomA.texture;
          blurPass.uniforms.uStep.value.set(bloomTexel.x * spread, 0);
          runPass(blurPass, rtBloomB);
          blurPass.uniforms.tSrc.value = rtBloomB.texture;
          blurPass.uniforms.uStep.value.set(0, bloomTexel.y * spread);
          runPass(blurPass, rtBloomA);
        }

        compositePass.uniforms.tScene.value = rtScene.texture;
        compositePass.uniforms.tBloom.value = rtBloomA.texture;
        runPass(compositePass, null);
        drawCage();
      } else {
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);
        drawCage();
      }
    };

    resize();

    let raf = null;
    let lastFrame = null;
    let elapsed = 0;
    let inView = true;
    let shadersReady = false;
    let disposed = false;
    const loop = (now) => {
      raf = null;
      if (!shadersReady || !inView || document.hidden) return;
      if (lastFrame !== null) elapsed += Math.min(now - lastFrame, 50);
      lastFrame = now;
      render(elapsed);
      raf = requestAnimationFrame(loop);
    };
    const updateActivity = () => {
      if (shadersReady && inView && !document.hidden && !reduced) {
        if (raf === null) raf = requestAnimationFrame(loop);
      } else {
        if (raf !== null) cancelAnimationFrame(raf);
        raf = null;
        lastFrame = null;
      }
    };

    let resizeTimer = null;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        resize();
        if (reduced && shadersReady) render(4200);
      }, 140);
    });
    ro.observe(host);

    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      updateActivity();
    }, { threshold: 0 });
    io.observe(host);
    document.addEventListener('visibilitychange', updateActivity);

    const onMove = (e) => {
      if (!inView || document.hidden) return;
      pointer.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
      const box = hostRect || host.getBoundingClientRect();
      pointerNdc.set(
        ((e.clientX - box.left) / box.width) * 2 - 1,
        -(((e.clientY - box.top) / box.height) * 2 - 1),
      );
      pointerActive = true;
    };
    const onLeave = () => { pointerActive = false; };
    if (window.matchMedia('(pointer: fine)').matches && !reduced) {
      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerleave', onLeave, { passive: true });
    }

    // Compiling the contour alone left every visible layer and all three post-processing
    // programs to compile inside the first animation frame. That frame stalls for about
    // 50 ms on a desktop Chrome run and far longer on a phone. Ask the driver's parallel
    // compiler for every program up front, including the separate cage layer and the three
    // render-target variants, then upload one complete warm frame before starting the loop.
    // The frame sequence, buffers and shader code are unchanged; only when compilation is
    // allowed to block the main thread changes.
    const prepareShaders = async () => {
      renderer.setRenderTarget(rtScene);
      camera.layers.set(0);
      await renderer.compileAsync(scene, camera);
      camera.layers.set(1);
      await renderer.compileAsync(scene, camera);
      camera.layers.set(0);

      if (bloomOn) {
        for (const [material, target] of [
          [brightPass, rtBloomA],
          [blurPass, rtBloomB],
          [compositePass, null],
        ]) {
          passQuad.material = material;
          renderer.setRenderTarget(target);
          await renderer.compileAsync(passScene, passCamera);
        }
      }

      if (disposed) return;
      renderer.setRenderTarget(null);
      if (inView || reduced) render(reduced ? 4200 : elapsed);
      shadersReady = true;
      updateActivity();
    };

    prepareShaders().catch(() => {
      // Older drivers without parallel compilation still get the same scene. Their first
      // frame falls back to Three's normal synchronous compilation path.
      if (disposed) return;
      renderer.setRenderTarget(null);
      shadersReady = true;
      if (reduced) render(4200);
      updateActivity();
    });

    // The GL context holds real memory and the browser caps how many can be live at once, so
    // it is released explicitly rather than left to be collected — otherwise a handful of hot
    // reloads exhausts the budget and the canvas goes black.
    return () => {
      disposed = true;
      if (raf !== null) cancelAnimationFrame(raf);
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', updateActivity);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerleave', onLeave);
      disposeMeshes();
      disposeTargets();
      contour.geometry.dispose();
      contour.material.dispose();
      passQuad.geometry.dispose();
      for (const m of [brightPass, blurPass, compositePass]) m.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [progressRef]);

  return (
    <div ref={hostRef} aria-hidden="true" className="hero-globe pointer-events-none absolute inset-0 z-0" />
  );
}
