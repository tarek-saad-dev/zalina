import { apiFetch } from "@/lib/api/client";
import { ApiError } from "@/lib/api/types";
import {
  normalizeAvailability,
  normalizeEventDetail,
  normalizeEventList,
  type EventAvailability,
  type EventDetail,
  type EventLocale,
  type EventSummary,
} from "./domain";

export type EventListResult =
  | { state: "ready"; events: EventSummary[]; isDemo: boolean }
  | { state: "unavailable"; events: []; isDemo: false };
export type EventDetailResult =
  | { state: "ready"; event: EventDetail; isDemo: boolean }
  | { state: "not_found" | "unavailable"; event: null; isDemo: false };

function demoEnabled(): boolean {
  return process.env.NODE_ENV !== "production" && process.env.ZALINA_EVENTS_DEMO === "true";
}

/**
 * Public event endpoints are future Laravel contracts. Existing CMS /experiences
 * is marketing-only and MUST NOT be passed off as bookable inventory.
 */
export async function listBookableEvents(locale: EventLocale): Promise<EventListResult> {
  if (demoEnabled()) {
    const { demoEvents } = await import("./fixtures");
    return { state: "ready", events: demoEvents.map(({ occurrences, packages, ...details }) => details), isDemo: true };
  }
  try {
    const raw = await apiFetch<unknown>("/events", { locale, cache: "no-store" });
    return { state: "ready", events: normalizeEventList(raw), isDemo: false };
  } catch {
    return { state: "unavailable", events: [], isDemo: false };
  }
}

export async function getBookableEvent(
  slug: string,
  locale: EventLocale
): Promise<EventDetailResult> {
  if (demoEnabled()) {
    const { demoEvents } = await import("./fixtures");
    const event = demoEvents.find((item) => item.slug === slug);
    return event
      ? { state: "ready", event, isDemo: true }
      : { state: "not_found", event: null, isDemo: false };
  }
  try {
    const raw = await apiFetch<unknown>(`/events/${encodeURIComponent(slug)}`, {
      locale, cache: "no-store",
    });
    const event = normalizeEventDetail(raw);
    return event
      ? { state: "ready", event, isDemo: false }
      : { state: "unavailable", event: null, isDemo: false };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return { state: "not_found", event: null, isDemo: false };
    }
    return { state: "unavailable", event: null, isDemo: false };
  }
}

/**
 * Called in the browser for a selected occurrence. Never invent availability
 * or pricing when Laravel is missing. Demo mode is server-authorized in dev.
 */
export async function getEventAvailability(
  slug: string,
  occurrenceId: number,
  locale: EventLocale,
  isDemo: boolean,
  signal?: AbortSignal
): Promise<EventAvailability> {
  if (isDemo && process.env.NODE_ENV !== "production") {
    const { demoAvailability } = await import("./fixtures");
    const fixture = demoAvailability(slug, occurrenceId);
    if (!fixture) throw new Error("Demo occurrence unavailable");
    return fixture;
  }
  const raw = await apiFetch<unknown>(`/events/${encodeURIComponent(slug)}/availability`, {
    locale, cache: "no-store", searchParams: { occurrence_id: occurrenceId }, signal,
  });
  const availability = normalizeAvailability(raw, occurrenceId);
  if (!availability) throw new Error("Invalid event availability response");
  return availability;
}
