export const reducedMotionQuery =
  "(prefers-reduced-motion: reduce) and (min-width: 48rem)";

export function prefersReducedMotion() {
  return window.matchMedia(reducedMotionQuery).matches;
}
