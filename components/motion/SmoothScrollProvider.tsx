"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import Lenis from "lenis";
import { registerGSAP, gsap, ScrollTrigger } from "@/lib/motion/gsap";
import { getDeviceCapability } from "@/lib/motion/deviceCapability";
import { subscribeReducedMotion } from "@/lib/motion/reducedMotion";

type SmoothScrollContextValue = {
  lenis: Lenis | null;
  enabled: boolean;
};

const SmoothScrollContext = createContext<SmoothScrollContextValue>({
  lenis: null,
  enabled: false,
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

/**
 * Lenis on desktop / fine pointer only.
 * Synchronized with GSAP ticker + ScrollTrigger — single RAF path via gsap.ticker.
 * Touch / mobile / reduced-motion → native scrolling.
 */
export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    registerGSAP();

    let instance: Lenis | null = null;
    let tickerCb: ((time: number) => void) | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let unsubReduced: (() => void) | null = null;
    let mqCleanup: (() => void) | null = null;

    const destroyLenis = () => {
      if (tickerCb) {
        gsap.ticker.remove(tickerCb);
        tickerCb = null;
      }
      if (instance) {
        instance.destroy();
        instance = null;
      }
      document.documentElement.classList.remove(
        "lenis",
        "lenis-smooth",
        "zalina-smooth-scroll"
      );
      setLenis(null);
      setEnabled(false);
    };

    const createLenis = () => {
      destroyLenis();

      const capability = getDeviceCapability();
      if (!capability.prefersSmoothScroll) return;

      instance = new Lenis({
        autoRaf: false,
        lerp: 0.085,
        smoothWheel: true,
        syncTouch: false,
        touchMultiplier: 1.2,
      });

      instance.on("scroll", ScrollTrigger.update);

      tickerCb = (time: number) => {
        instance?.raf(time * 1000);
      };
      gsap.ticker.add(tickerCb);
      gsap.ticker.lagSmoothing(0);

      document.documentElement.classList.add(
        "lenis",
        "lenis-smooth",
        "zalina-smooth-scroll"
      );

      setLenis(instance);
      setEnabled(true);

      // Dynamic page height (images, accordion, route content)
      requestAnimationFrame(() => ScrollTrigger.refresh());
    };

    createLenis();

    unsubReduced = subscribeReducedMotion(() => {
      createLenis();
    });

    const finePointerMq = window.matchMedia(
      "(hover: hover) and (pointer: fine)"
    );
    const widthMq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => createLenis();
    finePointerMq.addEventListener("change", onMq);
    widthMq.addEventListener("change", onMq);
    mqCleanup = () => {
      finePointerMq.removeEventListener("change", onMq);
      widthMq.removeEventListener("change", onMq);
    };

    resizeObserver = new ResizeObserver(() => {
      instance?.resize();
      ScrollTrigger.refresh();
    });
    resizeObserver.observe(document.body);

    return () => {
      unsubReduced?.();
      mqCleanup?.();
      resizeObserver?.disconnect();
      destroyLenis();
      gsap.ticker.lagSmoothing(500, 33);
    };
  }, []);

  const value = useMemo(
    () => ({ lenis, enabled }),
    [lenis, enabled]
  );

  return (
    <SmoothScrollContext.Provider value={value}>
      {children}
    </SmoothScrollContext.Provider>
  );
}
