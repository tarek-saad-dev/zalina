import { apiFetchSafe } from "./client";
import type { ApiAddOn, ApiExperience, ApiMedia, ApiZone } from "./types";
import { resolveApiLocale } from "./locale";

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

export function getMedia(
  modelType: string,
  modelId: number | string,
  locale?: string
): Promise<ApiMedia[]> {
  return apiFetchSafe<ApiMedia[]>(`/media/${modelType}/${modelId}`, [], {
    locale: resolveApiLocale(locale),
    next: { revalidate: 60 },
  });
}
