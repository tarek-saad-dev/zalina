/**
 * Zalina motion tokens — slow, confident, elegant, cinematic.
 *
 * Responsibilities (do not invent one-off durations/eases in sections):
 * - GSAP: cinematic timelines, scroll storytelling, parallax, scrub, pin,
 *   masked text, image reveals, multi-element sequencing
 * - ScrollTrigger: scroll-linked progress, pinning, scrub — always with cleanup
 * - SplitText: hero / major headings only (lines/words/masks) — not every paragraph
 * - Flip: genuine layout state transforms only
 * - Framer Motion: menus, mount/unmount, small UI state, modals
 * - CSS: hover, color, border, glow, tiny transforms
 *
 * Never animate the same property on the same element with both FM and GSAP.
 */

export const motionConfig = {
  duration: {
    /** Micro UI / hover-adjacent */
    fast: 0.3,
    /** Standard entrance / UI settle */
    normal: 0.6,
    /** Section-level reveal */
    slow: 0.9,
    /** Hero / cinematic beats */
    cinematic: 1.2,
    /** Future route veil (total budget ~400–800ms) */
    pageTransition: 0.55,
  },

  ease: {
    /** Default settle */
    standard: "power2.out",
    /** Soft entrance */
    reveal: "power3.out",
    /** Long cinematic arcs */
    cinematic: "power2.inOut",
    /** Scrubbed / scroll-linked (1:1 mapping) */
    linear: "none",
  },

  /** Entrance displacement — prefer this range unless a cinematic moment needs more */
  displacement: {
    subtle: 12,
    standard: 24,
    emphasis: 40,
  },

  stagger: {
    tight: 0.06,
    normal: 0.1,
    relaxed: 0.16,
  },

  scroll: {
    /** Soft scrub lag (seconds) — avoid harsh 1:1 unless intentional */
    scrub: 0.65,
    /** Default reveal start */
    revealStart: "top 85%",
  },

  pageTransition: {
    /** Target total feel; never delay navigation artificially beyond this */
    minMs: 400,
    maxMs: 800,
  },
} as const;

export type MotionConfig = typeof motionConfig;
