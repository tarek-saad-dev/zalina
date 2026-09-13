"use client";

import React, { useRef } from "react";
import { cn } from "@/lib/utils";
import { registerGSAP, useGSAP } from "@/lib/motion/gsap";
import {
  createSplitReveal,
  whenFontsReady,
  type SplitTextMode,
} from "@/lib/motion/splitText";
import { motionConfig } from "@/lib/motion/motionConfig";

type TextRevealProps = {
  children: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  type?: SplitTextMode;
  /** Immediate play (hero) vs scroll-triggered */
  trigger?: "load" | "scroll";
};

/**
 * SplitText reveal pattern for future Hero / section headings.
 * Not wired into homepage sections yet — infrastructure only.
 *
 * No FOUC: content is visible by default; animation enhances when ready.
 * Fonts are awaited before split measurements.
 */
export function TextReveal({
  children,
  className,
  as: Tag = "h2",
  type = "lines",
  trigger = "scroll",
}: TextRevealProps) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      registerGSAP();
      const el = ref.current;
      if (!el) return;

      let reverted = false;
      let handle: ReturnType<typeof createSplitReveal> | null = null;

      const run = async () => {
        await whenFontsReady();
        if (reverted || !ref.current) return;

        handle = createSplitReveal({
          target: ref.current,
          type,
          mask: "lines",
          duration: motionConfig.duration.cinematic,
          stagger: motionConfig.stagger.tight,
          y: motionConfig.displacement.emphasis,
          scrollTrigger:
            trigger === "load"
              ? false
              : {
                  trigger: ref.current,
                  start: motionConfig.scroll.revealStart,
                  toggleActions: "play none none none",
                },
        });
      };

      void run();

      return () => {
        reverted = true;
        handle?.revert();
      };
    },
    { dependencies: [type, trigger] }
  );

  return (
    <Tag
      ref={ref as React.RefObject<HTMLHeadingElement>}
      className={cn("zalina-text-reveal", className)}
      data-text-reveal={type}
    >
      {children}
    </Tag>
  );
}
