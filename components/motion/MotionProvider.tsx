"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { registerGSAP } from "@/lib/motion/gsap";
import {
  getDeviceCapability,
  type DeviceCapability,
} from "@/lib/motion/deviceCapability";
import {
  getPrefersReducedMotion,
  subscribeReducedMotion,
} from "@/lib/motion/reducedMotion";
import { SmoothScrollProvider } from "./SmoothScrollProvider";

type MotionContextValue = {
  ready: boolean;
  reducedMotion: boolean;
  capability: DeviceCapability;
};

const MotionContext = createContext<MotionContextValue>({
  ready: false,
  reducedMotion: false,
  capability: {
    tier: "desktop",
    prefersSmoothScroll: false,
    canHover: true,
    isCoarsePointer: false,
    allowParallax: true,
    allowPinning: true,
    allowHorizontalScrollStory: true,
    allowContinuousDecoration: true,
  },
});

export function useMotion() {
  return useContext(MotionContext);
}

/**
 * Root motion shell: register GSAP once, expose capability + reduced-motion,
 * mount Lenis (desktop only) via SmoothScrollProvider.
 *
 * Framer Motion stays installed for menus / small UI — do not animate the same
 * property with both libraries on one element.
 */
export function MotionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [capability, setCapability] = useState<DeviceCapability>(() =>
    typeof window === "undefined"
      ? {
          tier: "desktop" as const,
          prefersSmoothScroll: false,
          canHover: true,
          isCoarsePointer: false,
          allowParallax: true,
          allowPinning: true,
          allowHorizontalScrollStory: true,
          allowContinuousDecoration: true,
        }
      : getDeviceCapability()
  );

  useEffect(() => {
    registerGSAP();
    setReducedMotion(getPrefersReducedMotion());
    setCapability(getDeviceCapability());
    setReady(true);

    const unsub = subscribeReducedMotion((prefers) => {
      setReducedMotion(prefers);
      setCapability(getDeviceCapability());
      document.documentElement.dataset.reducedMotion = prefers ? "true" : "false";
    });

    const refreshCapability = () => setCapability(getDeviceCapability());
    window.addEventListener("resize", refreshCapability, { passive: true });

    return () => {
      unsub();
      window.removeEventListener("resize", refreshCapability);
    };
  }, []);

  const value = useMemo(
    () => ({ ready, reducedMotion, capability }),
    [ready, reducedMotion, capability]
  );

  return (
    <MotionContext.Provider value={value}>
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </MotionContext.Provider>
  );
}
