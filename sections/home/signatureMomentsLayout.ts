import type { CatalogMediaCard } from "@/lib/media";

/**
 * A small editorial selection keeps the home page scannable, while the full
 * CMS catalog remains accessible at /experiences. Ignore invalid CMS rows.
 */
export function selectSignatureMomentCards(
  moments: CatalogMediaCard[],
  fallback: CatalogMediaCard,
  limit = 4
): CatalogMediaCard[] {
  const valid = moments
    .filter((moment) => (
      typeof moment.title === "string" &&
      moment.title.trim().length > 0 &&
      typeof moment.image === "string" &&
      moment.image.trim().length > 0
    ))
    .slice(0, Math.max(1, Math.floor(limit) || 4));

  return valid.length ? valid : [fallback];
}

/** Signed shortest distance around a cyclic, vertically stacked card deck. */
export function signedCarouselDistance(index: number, activeIndex: number, total: number): number {
  if (total <= 1) return 0;
  const forward = (index - activeIndex + total) % total;
  const backward = forward - total;
  return forward <= total / 2 ? forward : backward;
}
