"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  getDayUseProducts,
  type DayUseProduct,
  ApiError,
} from "@/lib/api";

export type DayUseProductsStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error";

export type DayUseSettingsStatus = DayUseProductsStatus;

export function useDayUseSettings(options: {
  enabled: boolean;
  locale?: string;
  /** Optional override for non-ApiError fallback (defaults to translated checkout.productsLoadFailed). */
  errorFallback?: string;
}) {
  const { enabled, locale, errorFallback } = options;
  const t = useTranslations("bookNow");
  const fallback = errorFallback ?? t("checkout.productsLoadFailed");
  const [status, setStatus] = useState<DayUseProductsStatus>("idle");
  const [products, setProducts] = useState<DayUseProduct[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setStatus("loading");
    setError(null);
    try {
      const data = await getDayUseProducts(locale);
      setProducts(data);
      setStatus("ready");
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : fallback;
      setProducts([]);
      setError(message);
      setStatus("error");
    }
  }, [enabled, locale, fallback]);

  useEffect(() => {
    if (!enabled) {
      setStatus("idle");
      return;
    }
    void load();
  }, [enabled, load]);

  return {
    status,
    products,
    /** @deprecated Use products — single settings object no longer returned. */
    settings: null as null,
    error,
    reload: load,
  };
}
