/** Public campaign payload; the Laravel CMS is the source of truth. */
export type PromotionPlacement = "top_bar" | "floating_card";
export type PromotionLocale = "ar" | "en";

export interface PromotionCampaign {
  id: string;
  slug: string;
  placements: PromotionPlacement[];
  priority: number;
  title_ar: string;
  title_en: string;
  description_ar: string | null;
  description_en: string | null;
  eyebrow_ar: string | null;
  eyebrow_en: string | null;
  cta_label_ar: string;
  cta_label_en: string;
  cta_href: string;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  display_delay_seconds: number;
  dismiss_for_hours: number;
}

type JsonObject = Record<string, unknown>;

function record(value: unknown): JsonObject | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function safeNumber(value: unknown, fallback: number, max: number): number {
  if (typeof value !== "number" || !Number.isFinite(value)) return fallback;
  return Math.max(0, Math.min(max, value));
}

/** Restrict campaign links to site-local routes (and prevent protocol-relative URLs). */
export function localCampaignHref(path: string, locale: PromotionLocale): string | null {
  const trimmed = path.trim();
  if (
    !trimmed.startsWith("/") ||
    trimmed.startsWith("//") ||
    trimmed.includes("\\") ||
    /[\u0000-\u001f]/.test(trimmed)
  ) {
    return null;
  }
  if (/^\/(ar|en)(\/|$)/.test(trimmed)) return trimmed;
  return `/${locale}${trimmed === "/" ? "" : trimmed}`;
}

/** Images are decorative: only local assets or HTTPS images are accepted. */
export function safePromotionImage(value: string | null): string | null {
  if (!value) return null;
  if (value.startsWith("/") && !value.startsWith("//") && !value.includes("\\")) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Validate untrusted API results so a malformed campaign never breaks the site layout. */
export function normalizePromotions(raw: unknown): PromotionCampaign[] {
  const source = Array.isArray(raw)
    ? raw
    : (record(raw)?.campaigns ?? record(raw)?.items);
  if (!Array.isArray(source)) return [];

  const campaigns: PromotionCampaign[] = [];
  for (const entry of source) {
    const item = record(entry);
    if (!item || (item.enabled !== undefined && item.enabled !== true)) continue;
    const id = typeof item.id === "string" || typeof item.id === "number"
      ? String(item.id) : "";
    const titleAr = optionalString(item.title_ar);
    const titleEn = optionalString(item.title_en);
    const labelAr = optionalString(item.cta_label_ar);
    const labelEn = optionalString(item.cta_label_en);
    const href = optionalString(item.cta_href);
    const placements = Array.isArray(item.placements)
      ? item.placements.filter(
          (p): p is PromotionPlacement => p === "top_bar" || p === "floating_card"
        )
      : [];
    if (!id || !titleAr || !titleEn || !labelAr || !labelEn || !href || !placements.length) continue;
    if (!localCampaignHref(href, "en")) continue;

    campaigns.push({
      id,
      slug: optionalString(item.slug) ?? id,
      placements: Array.from(new Set(placements)),
      priority: safeNumber(item.priority, 0, 10000),
      title_ar: titleAr,
      title_en: titleEn,
      description_ar: optionalString(item.description_ar),
      description_en: optionalString(item.description_en),
      eyebrow_ar: optionalString(item.eyebrow_ar),
      eyebrow_en: optionalString(item.eyebrow_en),
      cta_label_ar: labelAr,
      cta_label_en: labelEn,
      cta_href: href,
      image_url: safePromotionImage(optionalString(item.image_url)),
      starts_at: optionalString(item.starts_at),
      ends_at: optionalString(item.ends_at),
      display_delay_seconds: safeNumber(item.display_delay_seconds, 3, 30),
      dismiss_for_hours: safeNumber(item.dismiss_for_hours, 24, 720),
    });
  }
  return campaigns.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
}

export function campaignWithinSchedule(
  campaign: PromotionCampaign,
  now = Date.now()
): boolean {
  if (campaign.starts_at) {
    const start = Date.parse(campaign.starts_at);
    if (!Number.isFinite(start) || now < start) return false;
  }
  if (campaign.ends_at) {
    const end = Date.parse(campaign.ends_at);
    if (!Number.isFinite(end) || now >= end) return false;
  }
  return true;
}

export function selectCampaign(
  campaigns: PromotionCampaign[],
  placement: PromotionPlacement,
  dismissedIds: ReadonlySet<string>,
  now = Date.now()
): PromotionCampaign | null {
  return campaigns.find(
    (campaign) =>
      campaign.placements.includes(placement) &&
      !dismissedIds.has(campaign.id) &&
      campaignWithinSchedule(campaign, now)
  ) ?? null;
}
