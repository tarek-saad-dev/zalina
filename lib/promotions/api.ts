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
  if (
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_ZALINA_PROMOTIONS_DEMO === "true"
  ) {
    const { demoPromotions } = await import("./fixtures");
    // Display fixtures ONLY on marketing routes; never on payment/booking.
    const excluded = /^\/(?:book-now|booking|checkout|payment)(?:\/|$)/.test(path) ||
      /^\/events\/[^/]+\/book(?:\/|$)/.test(path);
    return excluded ? [] : demoPromotions;
  }
  const raw = await apiFetchSafe<unknown>("/promotions/active", [], {
    locale,
    searchParams: { path },
    cache: "no-store",
  });
  return normalizePromotions(raw);
}
