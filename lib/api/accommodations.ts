import { apiFetch, apiFetchSafe } from "./client";
import {
  normalizeAccommodationAvailability,
  normalizeAccommodationType,
  type RawAccommodationAvailability,
  type RawAccommodationType,
} from "./adapters";
import type {
  AccommodationAvailability,
  AccommodationType,
} from "./booking-types";
import { resolveApiLocale } from "./locale";

export interface ListAccommodationTypesOptions {
  guests?: number;
  locale?: string;
  /** When true, throws on failure instead of returning []. Default false for marketing SSR. */
  strict?: boolean;
}

/** GET /accommodations — Bubble Stay accommodation types catalog. */
export async function listAccommodationTypes(
  options: ListAccommodationTypesOptions = {}
): Promise<AccommodationType[]> {
  const locale = resolveApiLocale(options.locale);
  const searchParams = { guests: options.guests };

  if (options.strict) {
    const raw = await apiFetch<RawAccommodationType[]>("/accommodations", {
      locale,
      searchParams,
      cache: "no-store",
    });
    return raw.map(normalizeAccommodationType);
  }

  const raw = await apiFetchSafe<RawAccommodationType[]>("/accommodations", [], {
    locale,
    searchParams,
    next: { revalidate: 60 },
  });
  return raw.map(normalizeAccommodationType);
}

/** GET /accommodations/{slug} */
export async function getAccommodationType(
  slug: string,
  locale?: string
): Promise<AccommodationType | null> {
  const raw = await apiFetchSafe<RawAccommodationType | null>(
    `/accommodations/${slug}`,
    null,
    {
      locale: resolveApiLocale(locale),
      next: { revalidate: 60 },
    }
  );
  return raw ? normalizeAccommodationType(raw) : null;
}

/** Strict single-type fetch for booking flows — throws on failure. */
export async function getAccommodationTypeStrict(
  slug: string,
  locale?: string
): Promise<AccommodationType> {
  const raw = await apiFetch<RawAccommodationType>(`/accommodations/${slug}`, {
    locale: resolveApiLocale(locale),
    cache: "no-store",
  });
  return normalizeAccommodationType(raw);
}

/**
 * GET /accommodations/{slug}/availability
 * Returns numeric available_bubbles count + bookable bubbles[] for the window.
 */
export async function getAccommodationAvailability(
  slug: string,
  params: {
    checkIn: string;
    checkOut: string;
    guests: number;
  },
  locale?: string
): Promise<AccommodationAvailability> {
  const raw = await apiFetch<RawAccommodationAvailability>(
    `/accommodations/${slug}/availability`,
    {
      locale: resolveApiLocale(locale),
      searchParams: {
        check_in: params.checkIn,
        check_out: params.checkOut,
        guests: params.guests,
      },
      cache: "no-store",
    }
  );
  return normalizeAccommodationAvailability(raw);
}
