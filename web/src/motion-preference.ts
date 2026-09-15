export const reducedMotionQuery =
  "(prefers-reduced-motion: reduce) and (min-width: 48.0625rem)";

export function prefersReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches;
}
