"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import { BOOK_NOW_HREF, FEATURED_DINNER_HIGHLIGHTS } from "./data";
import { useExpMotion } from "./useExpMotion";

export function EditorialSpotlight() {
  const { prefersReducedMotion, isMobile, fadeUp, transition } = useExpMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });
  const imageY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion || isMobile ? [0, 0] : [28, -28]
  );

  return (
    <section
      ref={sectionRef}
      className="exp-section overflow-hidden"
      style={{
        background: "transparent",
        paddingTop: "clamp(2.5rem, 4.5vw, 4.75rem)",
      }}
      aria-labelledby="featured-heading"
    >
      <div className="exp-container">
        <motion.div
          className="exp-section-header"
          initial={fadeUp.initial}
          whileInView={fadeUp.animate}
          viewport={{ once: true }}
          transition={transition(0)}
        >
          <p className="exp-eyebrow mb-3">Featured</p>
          <h2 id="featured-heading" className="exp-section-heading-lg">
            Signature Dinner Experience
          </h2>
        </motion.div>

        <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14 xl:gap-16">
          <motion.div
            className="relative"
            initial={fadeUp.initial}
            whileInView={fadeUp.animate}
            viewport={{ once: true }}
            transition={transition(0.08)}
          >
            <div
              className="pointer-events-none absolute -inset-4 md:-inset-8"
              style={{
                background:
                  "radial-gradient(ellipse at center, rgba(212,175,55,0.14) 0%, transparent 65%)",
              }}
              aria-hidden="true"
            />

            <div
              className="relative overflow-hidden rounded-sm"
              style={{
                border: "1px solid var(--exp-border)",
                boxShadow: "0 28px 70px rgba(0,0,0,0.48)",
              }}
            >
              <motion.div
                className="relative aspect-[4/5] w-full sm:aspect-[3/4]"
                style={{ y: imageY }}
              >
                <Image
                  src="/assets/Flavors.png"
                  alt="Signature dinner experience in a lantern-lit majlis"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover scale-[1.08]"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 45%, rgba(5,5,5,0.5) 100%)",
                  }}
                  aria-hidden="true"
                />
              </motion.div>

              <motion.div
                className="absolute bottom-5 left-5 right-5 sm:left-auto sm:right-5 sm:w-52"
                animate={
                  prefersReducedMotion || isMobile
                    ? undefined
                    : { y: [0, -4, 0] }
                }
                transition={
                  prefersReducedMotion || isMobile
                    ? undefined
                    : { duration: 6, repeat: Infinity, ease: "easeInOut" }
                }
                style={{
                  background: "rgba(15,12,10,0.84)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid var(--exp-border)",
                  padding: "0.875rem 1.125rem",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
                }}
              >
                <p
                  className="text-sm"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--exp-gold-soft)",
                  }}
                >
                  From sunset to starlight
                </p>
              </motion.div>
            </div>

            <div
              className="pointer-events-none absolute -left-3 top-10 hidden h-24 w-px lg:block"
              style={{ background: "var(--exp-border)" }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute -bottom-3 left-10 hidden h-px w-24 lg:block"
              style={{ background: "var(--exp-border)" }}
              aria-hidden="true"
            />
          </motion.div>

          <motion.div
            className="relative"
            initial={fadeUp.initial}
            whileInView={fadeUp.animate}
            viewport={{ once: true }}
            transition={transition(0.16)}
          >
            <div
              className="exp-glass rounded-sm p-7 sm:p-8 md:p-10"
              style={{ boxShadow: "0 22px 55px rgba(0,0,0,0.35)" }}
            >
              <h3
                className="mb-4 text-[1.75rem] leading-tight sm:mb-5 sm:text-3xl md:text-4xl"
                style={{
                  fontFamily: "var(--font-display)",
                  color: "var(--exp-text-primary)",
                  fontWeight: 400,
                }}
              >
                An Evening to Remember
              </h3>

              <p className="exp-body mb-7 sm:mb-8">
                Indulge in a curated dining experience where every detail speaks
                of luxury, warmth, and Arabian heritage.
              </p>

              <ul className="mb-8 space-y-3.5 sm:mb-9 sm:space-y-4">
                {FEATURED_DINNER_HIGHLIGHTS.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                      style={{
                        border: "1px solid var(--exp-border)",
                        background: "rgba(212,175,55,0.08)",
                      }}
                      aria-hidden="true"
                    >
                      <Check
                        size={11}
                        style={{ color: "var(--exp-gold)" }}
                        strokeWidth={2}
                      />
                    </span>
                    <span
                      className="text-sm leading-relaxed"
                      style={{ color: "var(--exp-text-muted)" }}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link href={BOOK_NOW_HREF} className="exp-btn-primary">
                Reserve Now
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
