import { registerGSAP, gsap, SplitText } from "./gsap";
import { motionConfig } from "./motionConfig";
import { getPrefersReducedMotion } from "./reducedMotion";

export type SplitTextMode = "lines" | "words" | "lines,words";

export type CreateSplitRevealOptions = {
  /** Target heading / editorial node */
  target: Element | string;
  type?: SplitTextMode;
  /** Prefer masks for line reveals (hero / section titles) */
  mask?: "lines" | "words" | boolean;
  duration?: number;
  stagger?: number;
  y?: number;
  ease?: string;
  /** ScrollTrigger config or false to play immediately */
  scrollTrigger?: gsap.TweenVars["scrollTrigger"] | false;
};

export type SplitRevealHandle = {
  split: SplitText;
  tween: gsap.core.Tween | null;
  revert: () => void;
};

/**
 * SplitText foundation for future Hero / section-heading reveals.
 * - Does not leave content invisible if reduced motion
 * - Caller must revert on cleanup (useGSAP / matchMedia handles this if created inside)
 * - Prefer waiting for fonts: `await document.fonts.ready` before measuring
 *
 * Do NOT apply across the homepage yet — prepare / test only.
 */
export function createSplitReveal(
  options: CreateSplitRevealOptions
): SplitRevealHandle | null {
  if (typeof window === "undefined") return null;
  registerGSAP();

  const {
    target,
    type = "lines",
    mask = "lines",
    duration = motionConfig.duration.slow,
    stagger = motionConfig.stagger.normal,
    y = motionConfig.displacement.standard,
    ease = motionConfig.ease.reveal,
    scrollTrigger,
  } = options;

  const el =
    typeof target === "string" ? document.querySelector(target) : target;
  if (!el) return null;

  if (getPrefersReducedMotion()) {
    gsap.set(el, { autoAlpha: 1, clearProps: "transform" });
    return null;
  }

  const split = SplitText.create(el, {
    type,
    mask: mask === true ? "lines" : mask || undefined,
    autoSplit: true,
  });

  const units =
    type.includes("lines") && split.lines?.length
      ? split.lines
      : split.words?.length
        ? split.words
        : split.chars;

  const tween = gsap.from(units, {
    y,
    autoAlpha: 0,
    duration,
    ease,
    stagger,
    ...(scrollTrigger === false
      ? {}
      : {
          scrollTrigger: scrollTrigger ?? {
            trigger: el,
            start: motionConfig.scroll.revealStart,
            toggleActions: "play none none none",
          },
        }),
  });

  return {
    split,
    tween,
    revert: () => {
      tween.kill();
      split.revert();
    },
  };
}

/** Wait for document fonts before SplitText measurement (hero headlines). */
export async function whenFontsReady(): Promise<void> {
  if (typeof document === "undefined") return;
  try {
    await document.fonts.ready;
  } catch {
    /* ignore */
  }
}
