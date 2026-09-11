"use client";

import { useEffect, useState } from "react";
import type { ApiLocale } from "@/lib/api";
import { resolveApiLocale } from "@/lib/api";

/**
 * Prefer ?lang= query, then <html lang>, then site default.
 * When ?lang=ar|en is present, sync document lang/dir for RTL + Accept-Language callers.
 */
export function useBookingLocale(): ApiLocale {
  const [locale, setLocale] = useState<ApiLocale>("en");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = params.get("lang");
    const fromHtml = document.documentElement.lang;
    const resolved = resolveApiLocale(fromQuery || fromHtml);

    if (fromQuery === "ar" || fromQuery === "en") {
      document.documentElement.lang = resolved;
      document.documentElement.dir = resolved === "ar" ? "rtl" : "ltr";
    }

    setLocale(resolved);
  }, []);

  return locale;
}
