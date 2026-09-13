"use client";

/**
 * Development-only motion smoke panel.
 * Not linked from production navigation.
 * Validates GSAP registration, ScrollTrigger, SplitText, and cleanup.
 */

import React, { useRef, useState } from "react";
import {
  registerGSAP,
  gsap,
  useGSAP,
  ScrollTrigger,
  SplitText,
} from "@/lib/motion/gsap";
import { motionConfig } from "@/lib/motion/motionConfig";
import { getPrefersReducedMotion } from "@/lib/motion/reducedMotion";
import { useSmoothScroll } from "@/components/motion/SmoothScrollProvider";
import { useMotion } from "@/components/motion/MotionProvider";
import { Reveal } from "@/components/motion/Reveal";

export function MotionPlayground() {
  const root = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const box = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("idle");
  const { enabled: lenisOn } = useSmoothScroll();
  const { reducedMotion, capability } = useMotion();

  useGSAP(
    () => {
      registerGSAP();
      if (!heading.current || !box.current) return;

      if (getPrefersReducedMotion()) {
        setStatus("reduced-motion: static");
        gsap.set([heading.current, box.current], {
          clearProps: "all",
          autoAlpha: 1,
        });
        return;
      }

      // Split into a dedicated text node container so React does not own split markup
      const split = SplitText.create(heading.current, {
        type: "lines",
        mask: "lines",
      });

      gsap.from(split.lines, {
        y: motionConfig.displacement.standard,
        autoAlpha: 0,
        duration: motionConfig.duration.slow,
        stagger: motionConfig.stagger.tight,
        ease: motionConfig.ease.reveal,
      });

      gsap.from(box.current, {
        y: motionConfig.displacement.subtle,
        autoAlpha: 0,
        duration: motionConfig.duration.normal,
        delay: 0.15,
        ease: motionConfig.ease.standard,
        scrollTrigger: {
          trigger: box.current,
          start: motionConfig.scroll.revealStart,
          toggleActions: "play none none none",
        },
      });

      setStatus(
        `ok · ST:${ScrollTrigger.getAll().length} · split lines:${split.lines.length}`
      );

      return () => {
        split.revert();
      };
    },
    { scope: root }
  );

  return (
    <div
      ref={root}
      className="zalina-container py-zalina-standard text-zalina-text"
    >
      <p className="zalina-text-eyebrow mb-4">Motion foundation · dev</p>
      <h1 ref={heading} className="zalina-text-section mb-6">
        Cinematic scroll foundation
      </h1>
      <p className="zalina-text-body mb-8 max-w-xl">
        Lenis: {lenisOn ? "on" : "off (native)"} · Tier: {capability.tier} ·
        Reduced: {reducedMotion ? "yes" : "no"} · Status: {status}
      </p>
      <div
        ref={box}
        className="h-40 w-full max-w-md"
        style={{
          border: "1px solid var(--zalina-border)",
          background: "var(--zalina-surface)",
        }}
      />
      <div className="mt-24 space-y-8">
        <Reveal>
          <p className="zalina-text-body">Reveal primitive — fade-up</p>
        </Reveal>
        <Reveal variant="fade">
          <p className="zalina-text-body">Reveal primitive — fade</p>
        </Reveal>
      </div>
      <div className="h-[60vh]" aria-hidden />
    </div>
  );
}
