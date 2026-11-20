import type { CatalogMediaCard } from "@/lib/media";
import { selectSignatureMomentCards } from "./signatureMomentsLayout";

/**
 * Render every valid live experience: the previous carousel's 9-card editorial
 * cap does not apply to the all-visible panel grid. Never invent filler cards.
 */
export function getSignaturePanels(
  moments: CatalogMediaCard[],
  fallback: CatalogMediaCard
): CatalogMediaCard[] {
  return selectSignatureMomentCards(moments, fallback, Math.max(1, moments.length));
}
