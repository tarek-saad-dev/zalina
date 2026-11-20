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

/** Build a concise, per-card line for the photographic panel header. */
export function getSignaturePanelTagline(subtitle: string | undefined, fallback: string): string {
  const words = subtitle?.trim().split(/\s+/).filter(Boolean) || [];
  return words.length ? words.slice(0, 6).join(" ").replace(/[.,!?،؛:]+$/g, "") : fallback;
}
