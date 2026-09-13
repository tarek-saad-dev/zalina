/**
 * Site-wide reduced-motion helpers.
 * Prefer CSS `@media (prefers-reduced-motion: reduce)` for pure CSS effects.
 * Use these helpers when GSAP / Lenis must branch in JS.
 *
 * When reduced motion is on:
 * - skip parallax, scrub, pin storytelling, continuous loops, aggressive SplitText
 * - content must remain fully visible (never leave opacity: 0 / clipped)
 */

export const REDUCED_MOTION_MQ = "(prefers-reduced-motion: reduce)";

export function getPrefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(REDUCED_MOTION_MQ).matches;
}

/** Subscribe to preference changes. Returns unsubscribe. */
export function subscribeReducedMotion(
  onChange: (prefersReduced: boolean) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const mq = window.matchMedia(REDUCED_MOTION_MQ);
  const handler = () => onChange(mq.matches);
  handler();
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}

/**
 * GSAP matchMedia condition map — use with createResponsiveMotion().
 * Width tiers always cover the full range so setups always run.
 * Use `canHover` for fine-pointer-only enhancements (pin, magnetic, etc.).
 * When reduceMotion is true, set final visible state immediately (no hide).
 */
export const motionMediaConditions = {
  reduceMotion: REDUCED_MOTION_MQ,
  isDesktop: "(min-width: 1024px)",
  isTablet: "(min-width: 768px) and (max-width: 1023px)",
  isMobile: "(max-width: 767px)",
  canHover: "(hover: hover) and (pointer: fine)",
  coarsePointer: "(pointer: coarse)",
} as const;
