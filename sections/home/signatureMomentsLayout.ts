import type { CatalogMediaCard } from "@/lib/media";

/**
 * A small editorial selection keeps the home page scannable, while the full
 * CMS catalog remains accessible at /experiences. Ignore invalid CMS rows.
 */
export function selectSignatureMomentCards(
  moments: CatalogMediaCard[],
  fallback: CatalogMediaCard,
  limit = 5
): CatalogMediaCard[] {
  const valid = moments
    .filter((moment) => (
      typeof moment.title === "string" &&
      moment.title.trim().length > 0 &&
      typeof moment.image === "string" &&
      moment.image.trim().length > 0
    ))
    .slice(0, Math.max(1, Math.floor(limit) || 5));

  return valid.length ? valid : [fallback];
}

/** Signed shortest distance around a cyclic, vertically stacked card deck. */
export function signedCarouselDistance(index: number, activeIndex: number, total: number): number {
  if (total <= 1) return 0;
  const forward = (index - activeIndex + total) % total;
  const backward = forward - total;
  return forward <= total / 2 ? forward : backward;
}

export interface MomentDeckPose {
  depth: number;
  rotateY: number;
  scale: number;
  opacity: number;
  zIndex: number;
  visible: boolean;
}

/** Dimensionless fan geometry; X spacing is provided by responsive CSS. */
export function getMomentDeckPose(visualOffset: number): MomentDeckPose {
  const distance = Math.abs(visualOffset);
  if (distance === 0) return { depth: 90, rotateY: 0, scale: 1, opacity: 1, zIndex: 30, visible: true };
  if (distance === 1) return {
    depth: -135, rotateY: visualOffset > 0 ? -51 : 51,
    scale: 0.86, opacity: 0.9, zIndex: 20, visible: true,
  };
  if (distance === 2) return {
    depth: -295, rotateY: visualOffset > 0 ? -66 : 66,
    scale: 0.72, opacity: 0.64, zIndex: 10, visible: true,
  };
  return { depth: -410, rotateY: 0, scale: 0.6, opacity: 0, zIndex: 0, visible: false };
}

/** CSS arithmetic compatible with browsers that do not support calc() multiplication. */
export function momentDeckXShift(offset: number): string {
  if (offset === 0) return "0px";
  const magnitude = Math.min(2, Math.abs(offset));
  const segments = Array.from({length:magnitude}, () => "var(--moment-stride)");
  return offset > 0
    ? magnitude === 1 ? segments[0] : "calc(" + segments.join(" + ") + ")"
    : "calc(0px - " + segments.join(" - ") + ")";
}

/** Autoplay never starts for short catalogs, motion-sensitive users or after manual input. */
export function canAutoAdvanceMoments({
  count, isInView, userInteracted, isHovered, hasFocusWithin, reducedMotion,
}: {
  count: number;
  isInView: boolean;
  userInteracted: boolean;
  isHovered: boolean;
  hasFocusWithin: boolean;
  reducedMotion: boolean;
}): boolean {
  return count > 1 && isInView && !userInteracted && !isHovered && !hasFocusWithin && !reducedMotion;
}
