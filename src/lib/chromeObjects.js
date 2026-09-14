/**
 * The two silver renders, by name.
 *
 * Kept out of the component so `ChromeObject.jsx` exports a component and nothing else —
 * a module that exports both loses Fast Refresh, which for a file touched on every
 * placement tweak is a real cost.
 *
 * The intrinsic dimensions are here rather than measured at runtime so every placement can
 * reserve the right box before the image decodes, and the paper never reflows under the
 * reader when an object finally arrives.
 */
export const CHROME_OBJECTS = {
  cluster: { src: '/assets/chrome-cluster.webp', width: 760, height: 744 },
  spiral: { src: '/assets/chrome-spiral.webp', width: 583, height: 760 },
};
