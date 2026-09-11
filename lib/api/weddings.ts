import { apiFetch } from "./client";
import {
  normalizeWeddingAvailability,
  normalizeWeddingPackage,
  type RawWeddingAvailability,
  type RawWeddingPackage,
} from "./adapters";
import type { WeddingAvailability, WeddingPackage } from "./booking-types";
import { resolveApiLocale } from "./locale";

function asPackageList(raw: unknown): RawWeddingPackage[] {
  if (Array.isArray(raw)) return raw as RawWeddingPackage[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as RawWeddingPackage[];
    if (Array.isArray(obj.weddings)) return obj.weddings as RawWeddingPackage[];
    if (Array.isArray(obj.packages)) return obj.packages as RawWeddingPackage[];
  }
  return [];
}

/** GET /weddings — public wedding package catalog. */
export async function getWeddings(locale?: string): Promise<WeddingPackage[]> {
  const raw = await apiFetch<unknown>("/weddings", {
    locale: resolveApiLocale(locale),
    cache: "no-store",
  });
  return asPackageList(raw)
    .map(normalizeWeddingPackage)
    .filter((pkg) => pkg.is_active)
    .sort((a, b) => a.display_order - b.display_order || a.id - b.id);
}

/** GET /weddings/availability — estimate + occupancy preview. */
export async function getWeddingAvailability(
  params: {
    wedding_package_id: number;
    wedding_date: string;
    guests: number;
  },
  locale?: string,
  init?: { signal?: AbortSignal }
): Promise<WeddingAvailability> {
  const raw = await apiFetch<RawWeddingAvailability>("/weddings/availability", {
    locale: resolveApiLocale(locale),
    searchParams: {
      wedding_package_id: params.wedding_package_id,
      wedding_date: params.wedding_date,
      guests: params.guests,
    },
    cache: "no-store",
    signal: init?.signal,
  });
  return normalizeWeddingAvailability(raw);
}
