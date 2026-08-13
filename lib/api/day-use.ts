import { apiFetch } from "./client";
import { normalizeDayUseSettings, type RawDayUseSettings } from "./adapters";
import type { DayUseSettings } from "./booking-types";
import { resolveApiLocale } from "./locale";

/** GET /day-use — public Day Use product settings for checkout. */
export async function getDayUseSettings(
  locale?: string
): Promise<DayUseSettings> {
  const raw = await apiFetch<RawDayUseSettings>("/day-use", {
    locale: resolveApiLocale(locale),
    cache: "no-store",
  });
  return normalizeDayUseSettings(raw);
}
