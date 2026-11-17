import { apiFetchSafe } from "@/lib/api/client";
import { normalizePromotions, type PromotionCampaign, type PromotionLocale } from "./domain";

/**
 * CMS-controlled active promotions. No hard-coded campaigns or fake fallback.
 * Laravel should return only enabled + published + scheduled + targeted campaigns.
 * Frontend also validates payload and scheduled window defensively.
 */
export async function getActivePromotions(
  locale: PromotionLocale,
  path: string
): Promise<PromotionCampaign[]> {
  const raw = await apiFetchSafe<unknown>("/promotions/active", [], {
    locale,
    searchParams: { path },
    cache: "no-store",
  });
  return normalizePromotions(raw);
}
