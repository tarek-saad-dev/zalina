import { apiFetchSafe } from "./client";
import type { ApiAddOn, ApiExperience, ApiPage, ApiZone } from "./types";
import { resolveApiLocale } from "./locale";
import {
  listMediaForModel,
  assertCmsMediaOwner,
} from "./media";
import type { CmsMedia, CmsMediaOwner } from "@/lib/media";

export { listMediaForModel, assertCmsMediaOwner };

/** CMS zones — marketing only; not linked to bookings in V2. */
export function getZones(locale?: string): Promise<ApiZone[]> {
  return apiFetchSafe<ApiZone[]>("/zones", [], {
    locale: resolveApiLocale(locale),
    next: { revalidate: 60 },
  });
}

export function getZone(
  slug: string,
  locale?: string
): Promise<ApiZone | null> {
  return apiFetchSafe<ApiZone | null>(`/zones/${slug}`, null, {
    locale: resolveApiLocale(locale),
    next: { revalidate: 60 },
  });
}

/** CMS experiences — marketing only; not bookable via POST /bookings. */
export function getExperiences(locale?: string): Promise<ApiExperience[]> {
  return apiFetchSafe<ApiExperience[]>("/experiences", [], {
    locale: resolveApiLocale(locale),
    next: { revalidate: 60 },
  });
}

export function getExperience(
  id: number | string,
  locale?: string
): Promise<ApiExperience | null> {
  return apiFetchSafe<ApiExperience | null>(`/experiences/${id}`, null, {
    locale: resolveApiLocale(locale),
    next: { revalidate: 60 },
  });
}

/** CMS add-ons — marketing only; not part of V2 checkout. */
export function getAddOns(locale?: string): Promise<ApiAddOn[]> {
  return apiFetchSafe<ApiAddOn[]>("/add-ons", [], {
    locale: resolveApiLocale(locale),
    next: { revalidate: 60 },
  });
}

/**
 * @deprecated Prefer listMediaForModel — typed owners only.
 * Kept for compatibility; rejects unsupported types.
 */
export function getMedia(
  modelType: CmsMediaOwner | string,
  modelId: number | string,
  locale?: string
): Promise<CmsMedia[]> {
  return listMediaForModel(modelType, modelId, locale);
}

/**
 * GET /pages/{slug} — documented in Postman as HTML title/content only (no media).
 * Live production currently 404s for common slugs (no published pages).
 */
export function getPage(
  slug: string,
  locale?: string
): Promise<ApiPage | null> {
  return apiFetchSafe<ApiPage | null>(`/pages/${slug}`, null, {
    locale: resolveApiLocale(locale),
    next: { revalidate: 60 },
  });
}
