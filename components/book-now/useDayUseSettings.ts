"use client";

import { useCallback, useEffect, useState } from "react";
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
}) {
  const { enabled, locale } = options;
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
        err instanceof ApiError
          ? err.message
          : "Could not load Day Use products.";
      setProducts([]);
      setError(message);
      setStatus("error");
    }
  }, [enabled, locale]);

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
