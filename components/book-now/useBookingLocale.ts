"use client";

import { useEffect, useState } from "react";
import type { ApiLocale } from "@/lib/api";
import { resolveApiLocale } from "@/lib/api";

/** Prefer document lang; fall back to site default. */
export function useBookingLocale(): ApiLocale {
  const [locale, setLocale] = useState<ApiLocale>("en");

  useEffect(() => {
    const fromHtml = document.documentElement.lang;
    setLocale(resolveApiLocale(fromHtml));
  }, []);

  return locale;
}
