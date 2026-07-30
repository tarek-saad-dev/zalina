import { apiFetch, apiFetchSafe } from "./client";
import type {
  ApiAccommodation,
  ApiAddOn,
  ApiExperience,
  ApiMedia,
  ApiZone,
} from "./types";

export function getZones(locale = "en"): Promise<ApiZone[]> {
  return apiFetchSafe<ApiZone[]>("/zones", [], {
    locale,
    next: { revalidate: 60 },
  });
}

export function getZone(slug: string, locale = "en"): Promise<ApiZone | null> {
  return apiFetchSafe<ApiZone | null>(`/zones/${slug}`, null, {
    locale,
    next: { revalidate: 60 },
  });
}

export function getAccommodations(opts?: {
  zone?: string;
  guests?: number;
  locale?: string;
}): Promise<ApiAccommodation[]> {
  return apiFetchSafe<ApiAccommodation[]>("/accommodations", [], {
    locale: opts?.locale ?? "en",
    searchParams: {
      zone: opts?.zone,
      guests: opts?.guests,
    },
    next: { revalidate: 60 },
  });
}

export function getAccommodation(
  slug: string,
  locale = "en"
): Promise<ApiAccommodation | null> {
  return apiFetchSafe<ApiAccommodation | null>(
    `/accommodations/${slug}`,
    null,
    { locale, next: { revalidate: 60 } }
  );
}

export function getExperiences(locale = "en"): Promise<ApiExperience[]> {
  return apiFetchSafe<ApiExperience[]>("/experiences", [], {
    locale,
    next: { revalidate: 60 },
  });
}

export function getExperience(
  id: number | string,
  locale = "en"
): Promise<ApiExperience | null> {
  return apiFetchSafe<ApiExperience | null>(`/experiences/${id}`, null, {
    locale,
    next: { revalidate: 60 },
  });
}

export function getAddOns(locale = "en"): Promise<ApiAddOn[]> {
  return apiFetchSafe<ApiAddOn[]>("/add-ons", [], {
    locale,
    next: { revalidate: 60 },
  });
}

export function getMedia(
  modelType: string,
  modelId: number | string,
  locale = "en"
): Promise<ApiMedia[]> {
  return apiFetchSafe<ApiMedia[]>(`/media/${modelType}/${modelId}`, [], {
    locale,
    next: { revalidate: 60 },
  });
}

/** Strict variants that throw — for booking mutations / critical paths. */
export function getAccommodationsStrict(opts?: {
  zone?: string;
  guests?: number;
  locale?: string;
}): Promise<ApiAccommodation[]> {
  return apiFetch<ApiAccommodation[]>("/accommodations", {
    locale: opts?.locale ?? "en",
    searchParams: { zone: opts?.zone, guests: opts?.guests },
  });
}
