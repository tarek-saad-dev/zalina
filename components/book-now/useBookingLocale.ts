"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import type { ApiLocale } from "@/lib/api";
import { DEFAULT_API_LOCALE } from "@/lib/api/locale";
import {
  applyDocumentLocale,
  BOOKING_LOCALE_EVENT,
  resolveBookingPageLocale,
} from "./bookingLocale";

/**
 * Booking/wedding locale from ?lang= only; site default is English.
 * Document lang/dir sync is shared with DocumentLocaleSync in the root layout.
 */
export function useBookingLocale(): ApiLocale {
  const pathname = usePathname();
  const [locale, setLocale] = useState<ApiLocale>(DEFAULT_API_LOCALE);

  useEffect(() => {
    const syncFromUrl = () => {
      const resolved = resolveBookingPageLocale(
        new URLSearchParams(window.location.search).get("lang")
      );
      applyDocumentLocale(resolved);
      setLocale(resolved);
    };

    const onLocaleEvent = (event: Event) => {
      const detail = (event as CustomEvent<ApiLocale>).detail;
      if (detail === "ar" || detail === "en") setLocale(detail);
    };

    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    window.addEventListener(BOOKING_LOCALE_EVENT, onLocaleEvent);

    return () => {
      window.removeEventListener("popstate", syncFromUrl);
      window.removeEventListener(BOOKING_LOCALE_EVENT, onLocaleEvent);
    };
  }, [pathname]);

  return locale;
}
