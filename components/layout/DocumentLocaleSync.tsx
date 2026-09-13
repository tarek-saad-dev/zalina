"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  applyDocumentLocale,
  resolveBookingPageLocale,
} from "@/components/book-now/bookingLocale";

/**
 * Keeps <html lang/dir> aligned with ?lang= (default en).
 * Prevents Arabic document state from leaking after leaving ?lang=ar pages.
 */
export function DocumentLocaleSync() {
  const pathname = usePathname();

  useEffect(() => {
    const sync = () => {
      const resolved = resolveBookingPageLocale(
        new URLSearchParams(window.location.search).get("lang")
      );
      applyDocumentLocale(resolved);
    };

    sync();
    window.addEventListener("popstate", sync);

    const originalPush = history.pushState.bind(history);
    const originalReplace = history.replaceState.bind(history);

    history.pushState = ((...args: Parameters<History["pushState"]>) => {
      originalPush(...args);
      sync();
    }) as History["pushState"];

    history.replaceState = ((...args: Parameters<History["replaceState"]>) => {
      originalReplace(...args);
      sync();
    }) as History["replaceState"];

    return () => {
      window.removeEventListener("popstate", sync);
      history.pushState = originalPush;
      history.replaceState = originalReplace;
    };
  }, [pathname]);

  return null;
}
