/**
 * Device capability for motion — prefer pointer/hover over width alone.
 *
 * Desktop / high capability: cinematic timelines, parallax, pin, richer image motion
 * Tablet: reduced parallax, limited pin, simpler reveals
 * Mobile: native scroll, minimal transforms, no pin hijack, simple crossfades
 */

export type MotionTier = "desktop" | "tablet" | "mobile";

export type DeviceCapability = {
  tier: MotionTier;
  /** Fine pointer + hover — suitable for Lenis / heavy scroll storytelling */
  prefersSmoothScroll: boolean;
  canHover: boolean;
  isCoarsePointer: boolean;
  allowParallax: boolean;
  allowPinning: boolean;
  allowHorizontalScrollStory: boolean;
  allowContinuousDecoration: boolean;
};

function mq(query: string): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(query).matches;
}

export function getDeviceCapability(): DeviceCapability {
  const isMobileWidth = mq("(max-width: 767px)");
  const isTabletWidth = mq("(min-width: 768px) and (max-width: 1023px)");
  const canHover = mq("(hover: hover) and (pointer: fine)");
  const isCoarsePointer = mq("(pointer: coarse)");
  const prefersReduced = mq("(prefers-reduced-motion: reduce)");

  const tier: MotionTier = isMobileWidth
    ? "mobile"
    : isTabletWidth
      ? "tablet"
      : "desktop";

  // Prefer native scroll on touch / coarse pointers — never fight the browser.
  const prefersSmoothScroll =
    !prefersReduced &&
    canHover &&
    !isCoarsePointer &&
    tier === "desktop";

  if (prefersReduced || tier === "mobile") {
    return {
      tier,
      prefersSmoothScroll: false,
      canHover,
      isCoarsePointer,
      allowParallax: false,
      allowPinning: false,
      allowHorizontalScrollStory: false,
      allowContinuousDecoration: false,
    };
  }

  if (tier === "tablet") {
    return {
      tier,
      prefersSmoothScroll: false,
      canHover,
      isCoarsePointer,
      allowParallax: true,
      allowPinning: false,
      allowHorizontalScrollStory: false,
      allowContinuousDecoration: true,
    };
  }

  return {
    tier: "desktop",
    prefersSmoothScroll,
    canHover,
    isCoarsePointer,
    allowParallax: true,
    allowPinning: true,
    allowHorizontalScrollStory: true,
    allowContinuousDecoration: true,
  };
}
