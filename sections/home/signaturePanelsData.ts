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

/** Short header line, like the editorial reference panels (not a paragraph). */
export function getSignaturePanelTagline(subtitle: string | undefined, fallback: string): string {
  const words = subtitle?.trim().split(/\s+/).filter(Boolean) || [];
  return words.length ? words.slice(0, 4).join(" ").replace(/[.,!?،؛:]+$/g, "") : fallback;
}

/**
 * The reference uses a compact 1–2 line footer, not the entire CMS paragraph.
 * Keep full copy in the underlying CMS/catalog; render a human-readable teaser
 * without inserting an ellipsis or truncating in the middle of a word.
 */
export function getSignaturePanelCaption(subtitle: string | undefined, fallback: string): string {
  const full = subtitle?.replace(/\s+/g, " ").trim() || "";
  if (!full) return fallback;

  let opening = full.split(/[,،؛.!?؟]/u, 1)[0].trim();
  if (opening.length < 24) opening = full;
  const clause = opening.split(/\s+(?:as|featuring|including|where|which|that)\s+/i, 1)[0].trim();
  if (clause.length >= 24) opening = clause;

  return opening.split(/\s+/).slice(0, 13).join(" ").replace(/[.,!?،؛:]+$/g, "");
}

/**
 * Extra-long CMS titles must shrink rather than acquire an ellipsis.
 * Responsive CSS still allows natural wrapping at any width.
 */
export function getSignaturePanelTitleVariant(title: string): "normal" | "long" | "extra-long" {
  const length = Array.from(title.trim()).length;
  if (length >= 38) return "extra-long";
  if (length >= 25) return "long";
  return "normal";
}
