"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

/**
 * Motion helpers for the experiences page.
 * Entrance variants intentionally ignore viewport width so a late
 * mobile-matchMedia update cannot reset opacity mid-animation.
 */
export function useExpMotion() {
  const prefersReducedMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const reduceMotion = Boolean(prefersReducedMotion);

  return {
    prefersReducedMotion: reduceMotion,
    isMobile,
    fadeUp: reduceMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
        },
    fadeIn: reduceMotion
      ? { initial: { opacity: 1 }, animate: { opacity: 1 } }
      : {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
        },
    blurClear: reduceMotion
      ? {
          initial: { opacity: 1, y: 0 },
          animate: { opacity: 1, y: 0 },
        }
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
        },
    viewport: { once: true, amount: 0.18 as const },
    transition: (delay = 0, duration = 0.85) =>
      reduceMotion
        ? { duration: 0 }
        : {
            duration,
            delay,
            ease: [0.22, 1, 0.36, 1] as const,
          },
    stagger: (index: number) => Math.min(index, 4) * 0.06,
  };
}
