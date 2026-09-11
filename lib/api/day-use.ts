import { apiFetch } from "./client";
import {
  normalizeDayUseProduct,
  type RawDayUseProduct,
} from "./adapters";
import type { DayUseProduct } from "./booking-types";
import { resolveApiLocale } from "./locale";

function asDayUseProductList(raw: unknown): RawDayUseProduct[] {
  if (Array.isArray(raw)) return raw as RawDayUseProduct[];
  if (raw && typeof raw === "object") {
    const obj = raw as Record<string, unknown>;
    if (Array.isArray(obj.data)) return obj.data as RawDayUseProduct[];
  }
  return [];
}

/** GET /day-use — public Day Use product catalog (array in response.data). */
export async function getDayUseProducts(
  locale?: string
): Promise<DayUseProduct[]> {
  const raw = await apiFetch<unknown>("/day-use", {
    locale: resolveApiLocale(locale),
    cache: "no-store",
  });
  return asDayUseProductList(raw)
    .map(normalizeDayUseProduct)
    .filter((product) => product.is_active);
}

/** @deprecated Use getDayUseProducts — endpoint now returns an array. */
export async function getDayUseSettings(
  locale?: string
): Promise<DayUseProduct[]> {
  return getDayUseProducts(locale);
}
