/**
 * Phase 2.6 — Cinematic scroll transition language
 *
 * TYPE A — Shared element continuum
 *   A gold graphic evolves across the seam (divider → frame → image).
 *
 * TYPE B — Depth handoff
 *   Current scene recedes (scale / opacity / gradient) while the next emerges.
 *
 * TYPE C — Mask reveal
 *   Next media appears through clip-path / overflow mask tied to the gold thread.
 *
 * Storyboard (this phase):
 *   Transition A — Hero → Heritage (arrival → story): TYPE B + gold cue
 *   Transition B — Heritage → Signature (story → discovery): TYPE A + C (primary)
 */

export const sceneTransitionConfig = {
  /** Light scrub — finger/wheel stays connected */
  scrubMobile: true as const,
  scrubDesktop: 0.35,
  /** Approximate scroll span for Heritage → Signature morph */
  mobileScrollHint: "heritage bottom → first card mid-viewport",
  desktopScrollHint: "heritage bottom → first card settled",
  z: {
    sceneBase: 0,
    sceneNext: 10,
    goldFrame: 20,
    navbar: 50,
  },
} as const;

export type SceneTransitionConfig = typeof sceneTransitionConfig;
