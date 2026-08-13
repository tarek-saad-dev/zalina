"use client";

import { useCallback, useRef, useState } from "react";
import {
  getAccommodationAvailability,
  ApiError,
  type AccommodationAvailability,
  type PhysicalBubble,
} from "@/lib/api";

export type AvailabilityStatus =
  | "idle"
  | "loading"
  | "ready"
  | "unavailable"
  | "error";

export interface AvailabilityEntry {
  status: AvailabilityStatus;
  data: AccommodationAvailability | null;
  error: string | null;
  bubbles: PhysicalBubble[];
}

function cacheKey(input: {
  slug: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  locale?: string;
}): string {
  return [
    input.slug,
    input.checkIn,
    input.checkOut,
    String(input.guests),
    input.locale ?? "en",
  ].join("|");
}

const emptyEntry = (): AvailabilityEntry => ({
  status: "idle",
  data: null,
  error: null,
  bubbles: [],
});

/**
 * Date-specific availability cache keyed by slug + stay window + guests + locale.
 * Does not treat catalog bubbles as bookable inventory.
 */
export function useAvailabilityCache(locale?: string) {
  const [entries, setEntries] = useState<Record<string, AvailabilityEntry>>({});
  const inFlight = useRef<Map<string, Promise<AvailabilityEntry>>>(new Map());

  const getEntry = useCallback(
    (slug: string, checkIn: string, checkOut: string, guests: number) => {
      const key = cacheKey({ slug, checkIn, checkOut, guests, locale });
      return entries[key] ?? emptyEntry();
    },
    [entries, locale]
  );

  const invalidateAll = useCallback(() => {
    setEntries({});
    inFlight.current.clear();
  }, []);

  const fetchAvailability = useCallback(
    async (input: {
      slug: string;
      checkIn: string;
      checkOut: string;
      guests: number;
    }): Promise<AvailabilityEntry> => {
      const key = cacheKey({ ...input, locale });
      const existing = inFlight.current.get(key);
      if (existing) return existing;

      setEntries((prev) => ({
        ...prev,
        [key]: {
          status: "loading",
          data: prev[key]?.data ?? null,
          error: null,
          bubbles: prev[key]?.bubbles ?? [],
        },
      }));

      const promise = (async () => {
        try {
          const data = await getAccommodationAvailability(
            input.slug,
            {
              checkIn: input.checkIn,
              checkOut: input.checkOut,
              guests: input.guests,
            },
            locale
          );
          const available =
            data.availability && data.available_bubbles > 0 && data.bubbles.length > 0;
          const next: AvailabilityEntry = {
            status: available ? "ready" : "unavailable",
            data,
            error: null,
            bubbles: data.bubbles,
          };
          setEntries((prev) => ({ ...prev, [key]: next }));
          return next;
        } catch (err) {
          const message =
            err instanceof ApiError
              ? err.message
              : "Could not check availability.";
          const next: AvailabilityEntry = {
            status: "error",
            data: null,
            error: message,
            bubbles: [],
          };
          setEntries((prev) => ({ ...prev, [key]: next }));
          return next;
        } finally {
          inFlight.current.delete(key);
        }
      })();

      inFlight.current.set(key, promise);
      return promise;
    },
    [locale]
  );

  return {
    getEntry,
    fetchAvailability,
    invalidateAll,
  };
}
