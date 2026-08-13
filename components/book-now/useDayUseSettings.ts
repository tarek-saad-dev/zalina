"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getDayUseSettings,
  type DayUseSettings,
  ApiError,
} from "@/lib/api";

export type DayUseSettingsStatus =
  | "idle"
  | "loading"
  | "ready"
  | "error";

export function useDayUseSettings(options: {
  enabled: boolean;
  locale?: string;
}) {
  const { enabled, locale } = options;
  const [status, setStatus] = useState<DayUseSettingsStatus>("idle");
  const [settings, setSettings] = useState<DayUseSettings | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!enabled) return;
    setStatus("loading");
    setError(null);
    try {
      const data = await getDayUseSettings(locale);
      setSettings(data);
      setStatus("ready");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Could not load Day Use settings.";
      setSettings(null);
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
    settings,
    error,
    reload: load,
  };
}
