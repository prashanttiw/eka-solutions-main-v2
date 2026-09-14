# Homepage globe performance

Local optimization completed 2026-09-07. The baseline is the owner's existing, uncommitted
renderer at the start of this request, not Git HEAD. No commit, push, or deployment.

The particle distribution, colours, glow, camera, scroll timing, pointer response, density,
resolution cap, current paths, star field, and reduced-motion behavior are preserved.
`CONFIG` is unchanged. The hero layout, stylesheet, header, and footer were not edited.

## Cost and result

| Component measurement | Before | After |
| --- | ---: | ---: |
| Desktop opening triangle submissions / frame | 27,360 | 3,040 (89% fewer) |
| Desktop opening draw calls / frame, including bloom | 14 | 13 |
| Desktop middle/late-scroll triangle submissions / frame | 27,360 | 26,680 |
| Desktop cluster-edge vertices | 1,872 | 1,248 (33% fewer) |
| Desktop cluster-edge GPU buffers, including indices | 97,344 bytes | 68,640 bytes |
| Desktop geometry setup median | 7.25 ms | 3.37 ms |
| Tablet geometry setup median | 5.77 ms | 2.52 ms |
| Phone geometry setup median | 3.56 ms | 1.71 ms |
| Globe/Three.js chunk, gzip | 149.63 kB | About 150 kB |

Geometry setup timings are 51 local Node samples per breakpoint on Apple M1, including
warmup; medians describe geometry construction, not total page load. Equivalent geometry
was checked against the original before timing. Expect different absolute timings on
other CPUs. The triangle reduction is **not** an 89% reduction in total GPU time: bloom
and particle shading still run at their original quality.

The main remaining cost is the preserved rendering design: 1,500/2,300/2,800 specks, animated
noise, a detailed opening surface during scrolling, and HDR bloom. At 1440×900 with the
existing 1.5 DPR cap, the canvas is 2160×1350. The full-size RGBA16F scene plus two quarter-
resolution bloom targets use approximately 25 MiB of colour texture storage, excluding
browser compositing and antialiasing buffers. Those textures retain their original sizes.
The unused multisampled depth attachment is removed; Chrome confirms zero depth bits and
four antialiasing samples. The exact memory saving depends on the GPU/browser allocation.

The globe was already lazy-loaded. Network size remains essentially unchanged; this pass
improves scene initialization and ongoing rendering work rather than removing Three.js.
No new runtime dependencies were added.

## Implementation

- Omit the contour draw while its fragment shader would discard every pixel. This removes
  a 24,320-triangle noise-deformed surface at the opening pose. Prepare its shader against
  the HDR target at startup so scrolling into it does not introduce shader compilation.
- Omit the current ribbon once its existing fade reaches zero. Its fade curve is unchanged.
- Skip boundary trigonometry before the opening begins, noise evaluation for dormant
  clusters, and node warping when the existing warp setting is zero.
- Index identical corners of the cluster-edge quads. Every expanded attribute and triangle
  matches the original; only the duplicated storage and vertex processing are removed.
- Keep the six nearest cluster neighbours incrementally instead of sorting every candidate.
  Preserve stable tie ordering and all random-number consumption. Reuse the cage wireframe
  for graph construction instead of constructing a second identical wireframe.
- Request no depth attachment because all globe and postprocessing materials disable depth
  tests and writes. Keep antialiasing and all original bloom settings.

## Verification

- `node scripts/test-hero-globe.mjs`: four passing tests. SHA-256 snapshots of the original
  GPU inputs at all three breakpoints protect the precise seeded geometry, including the
  indexed edge expansion. Returning to a breakpoint remains deterministic.
- `npm run build`: passes. The existing >500 kB chunk warning remains for Three.js.
- `npm run lint`: passes with the pre-existing `Navbar.jsx` state-in-effect warning.
- `git diff --check`: passes.
- Twelve deterministic before/after frame pairs: 1440×900 at 1.5 DPR, 1366×768 at 1 DPR,
  and 390×844 at device DPR 3 (rendering remains capped at 1.5), at scroll 0/0.2/0.5/0.9.
  The original and optimized components use the same seeded data and explicit timeline.
  Seven pairs are pixel-identical. The others differ at 0.0002–0.0264% of pixels, mainly
  around moving edges; maximum individual channel difference is 20/255 and worst mean
  absolute channel difference is 0.000108/255. Visual inspection shows the same globe.
- Actual production homepage checked at desktop and phone sizes, with 4× CPU throttling:
  opening composition, forward/reverse scroll, desktop pointer response, desktop resize
  across breakpoints, contact navigation and remount, and the reduced-motion still frame.
  No JavaScript or shader errors. Exactly one globe canvas after remount.
- Offscreen draw calls stop; returning resumes them. A simulated `visibilitychange` with
  `document.hidden` stops/resumes draws. Headless tab visibility was simulated explicitly.
- Each production viewport's 120-frame opening sample had ~16.7 ms median and p95 rAF
  intervals, with no gaps over 34 ms. GPU timer-query runs were sensitive to system load
  and test ordering, so no percentage GPU-time/FPS improvement is claimed.

These checks use Chrome's ANGLE Metal renderer on Apple M1. Phone dimensions and CPU
throttling do not emulate a phone GPU or a Windows graphics driver. Physical Windows,
Android, and iOS frame-rate/battery measurements remain unverified.

Temporary original source, frame images, metrics, and browser harnesses from this session:
`/tmp/eka-globe-audit-20260906/`. The permanent geometry regression test needs no extra tools.
