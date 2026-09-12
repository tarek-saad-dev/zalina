"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type HeroRevealContextValue = {
  markHeroReady: () => void;
  isReady: boolean;
};

const HeroRevealContext = createContext<HeroRevealContextValue | null>(null);

const SAFETY_MS = 4500;
const FADE_MS = 400;

export function useHeroReveal() {
  return useContext(HeroRevealContext);
}

/** Call from hero `Image` `onLoadingComplete` / `onLoad`. No-op outside a gate. */
export function useMarkHeroReady() {
  const ctx = useHeroReveal();
  return useCallback(() => {
    ctx?.markHeroReady();
  }, [ctx]);
}

/**
 * Full-viewport gate: hides page chrome until the LCP hero image reports ready
 * (or a safety timeout fires). Covers the fixed navbar via z-index.
 */
export function HeroRevealGate({
  children,
  safetyTimeoutMs = SAFETY_MS,
}: {
  children: React.ReactNode;
  safetyTimeoutMs?: number;
}) {
  const [ready, setReady] = useState(false);
  const [overlayGone, setOverlayGone] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const markHeroReady = useCallback(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = () => setReduceMotion(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const t = window.setTimeout(() => setReady(true), safetyTimeoutMs);
    return () => window.clearTimeout(t);
  }, [safetyTimeoutMs]);

  useEffect(() => {
    if (!ready) return;
    if (reduceMotion) {
      setOverlayGone(true);
      return;
    }
    const t = window.setTimeout(() => setOverlayGone(true), FADE_MS);
    return () => window.clearTimeout(t);
  }, [ready, reduceMotion]);

  useEffect(() => {
    if (overlayGone) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [overlayGone]);

  const value = useMemo(
    () => ({ markHeroReady, isReady: ready }),
    [markHeroReady, ready]
  );

  return (
    <HeroRevealContext.Provider value={value}>
      <div
        style={{
          opacity: ready ? 1 : 0,
          transition: reduceMotion ? undefined : `opacity ${FADE_MS}ms ease`,
        }}
      >
        {children}
      </div>
      {!overlayGone ? (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{
            background: "#050505",
            opacity: ready ? 0 : 1,
            transition: reduceMotion ? undefined : `opacity ${FADE_MS}ms ease`,
            pointerEvents: ready ? "none" : "auto",
          }}
          aria-busy={!ready}
          aria-live="polite"
          role="status"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/zalina-logo-full.png"
            alt="Zalina Arabian Village"
            width={160}
            height={64}
            className="h-14 w-auto opacity-85 sm:h-16"
            decoding="async"
          />
          <span className="sr-only">Loading experience</span>
        </div>
      ) : null}
    </HeroRevealContext.Provider>
  );
}
