"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { registerGSAP, gsap, useGSAP } from "@/lib/motion/gsap";
import { motionConfig } from "@/lib/motion/motionConfig";
import { getPrefersReducedMotion } from "@/lib/motion/reducedMotion";

export type RevealVariant = "fade" | "fade-up" | "image" | "line";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  variant?: RevealVariant;
  /** Delay in seconds */
  delay?: number;
  /** Play once when entering view (default true) */
  once?: boolean;
};

const variantFrom: Record<RevealVariant, gsap.TweenVars> = {
  fade: { autoAlpha: 0 },
  "fade-up": {
    autoAlpha: 0,
    y: motionConfig.displacement.standard,
  },
  image: {
    autoAlpha: 0,
    scale: 1.04,
  },
  line: {
    autoAlpha: 0,
    y: motionConfig.displacement.subtle,
  },
};

/**
 * Lightweight scroll reveal for ordinary elements.
 * Major cinematic sections should use custom GSAP timelines instead.
 *
 * Accessibility: reduced-motion skips tween; content stays visible (no FOUC hide).
 * CSS class `zalina-reveal` keeps content visible if JS fails.
 */
export function Reveal({
  children,
  className,
  variant = "fade-up",
  delay = 0,
  once = true,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      registerGSAP();
      const el = ref.current;
      if (!el) return;

      if (getPrefersReducedMotion()) {
        gsap.set(el, { clearProps: "all", autoAlpha: 1 });
        return;
      }

      const from = variantFrom[variant];

      gsap.fromTo(
        el,
        { ...from },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration:
            variant === "image"
              ? motionConfig.duration.slow
              : motionConfig.duration.normal,
          delay,
          ease: motionConfig.ease.reveal,
          scrollTrigger: {
            trigger: el,
            start: motionConfig.scroll.revealStart,
            toggleActions: once
              ? "play none none none"
              : "play reverse play reverse",
          },
        }
      );
    },
    { dependencies: [variant, delay, once] }
  );

  return (
    <div
      ref={ref}
      className={cn("zalina-reveal", className)}
      data-reveal={variant}
    >
      {children}
    </div>
  );
}
