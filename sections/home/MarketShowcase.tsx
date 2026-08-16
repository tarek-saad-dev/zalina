"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CmsImage } from "@/components/media/CmsImage";
import {
  NEUTRAL_MEDIA_FALLBACK,
  type MarketCard,
} from "@/lib/media";

interface MarketShowcaseProps {
  stalls?: MarketCard[];
  /** Display name for the market zone, e.g. Al-Souk Village */
  zoneName?: string;
}

const AUTO_MS = 4500;

export function MarketShowcase({
  stalls = [],
  zoneName = "Al-Souk Village",
}: MarketShowcaseProps) {
  const prefersReduced = useReducedMotion();
  const slides: MarketCard[] =
    stalls.length > 0
      ? stalls
      : [
          {
            id: "neutral",
            title: zoneName,
            subtitle: "Market photography from the CMS",
            image: NEUTRAL_MEDIA_FALLBACK,
            alt: zoneName,
            size: "hero",
          },
        ];

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;
  const active = slides[index] ?? slides[0];

  const go = useCallback(
    (next: number) => {
      if (count <= 1) return;
      setIndex(((next % count) + count) % count);
    },
    [count]
  );

  useEffect(() => {
    if (paused || prefersReduced || count <= 1) return;
    const id = window.setInterval(() => go(index + 1), AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, prefersReduced, count, index, go]);

  return (
    <section
      className="relative overflow-hidden py-16 md:py-20"
      style={{ background: "var(--lux-surface)" }}
      aria-labelledby="market-showcase-title"
      aria-roledescription="carousel"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 65% 45% at 15% 20%, rgba(201, 163, 92, 0.08) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 90% 80%, rgba(120, 70, 30, 0.07) 0%, transparent 50%)
          `,
        }}
      />

      <div className="lux-container relative z-10">
        <div className="mx-auto max-w-3xl text-center mb-10 md:mb-12">
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45 }}
            className="lux-eyebrow mb-3"
            style={{ color: "var(--lux-gold)" }}
          >
            THE MARKET
          </motion.p>

          <motion.h2
            id="market-showcase-title"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="lux-heading-lg mb-4"
            style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}
          >
            {zoneName}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.12 }}
            className="lux-body mx-auto"
            style={{ fontSize: "0.98rem", opacity: 0.82, maxWidth: "36rem" }}
          >
            A living Arabian souk at the heart of Zalina — stalls, courtyards,
            and lanes ready for embassies and partners seeking a distinguished
            presence in the village market.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.1 }}
          className="relative mx-auto w-full max-w-5xl"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocusCapture={() => setPaused(true)}
          onBlurCapture={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
              setPaused(false);
            }
          }}
        >
          <div
            className="relative overflow-hidden"
            style={{
              aspectRatio: "16 / 10",
              minHeight: "280px",
              border: "1px solid rgba(212, 175, 55, 0.28)",
              boxShadow: "0 18px 50px rgba(0,0,0,0.35)",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active.id}
                className="absolute inset-0"
                initial={
                  prefersReduced ? { opacity: 1 } : { opacity: 0, scale: 1.04 }
                }
                animate={{ opacity: 1, scale: 1 }}
                exit={prefersReduced ? { opacity: 0 } : { opacity: 0 }}
                transition={{ duration: prefersReduced ? 0.2 : 0.7, ease: "easeOut" }}
              >
                <CmsImage
                  src={active.image}
                  alt={active.alt || active.title || zoneName}
                  fill
                  sizes="(max-width: 1024px) 100vw, 1024px"
                  className="object-cover"
                  priority={index === 0}
                />
              </motion.div>
            </AnimatePresence>

            {/* Soft bazaar vignette — keeps focus on the place, not UI chrome */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: `
                  linear-gradient(to top, rgba(8,6,4,0.55) 0%, transparent 42%),
                  linear-gradient(to bottom, rgba(8,6,4,0.2) 0%, transparent 28%)
                `,
              }}
            />

            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous market photo"
                  onClick={() => go(index - 1)}
                  className="absolute left-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-100 md:left-4"
                  style={{
                    background: "rgba(5,5,5,0.45)",
                    border: "1px solid rgba(212,175,55,0.4)",
                    color: "var(--lux-gold)",
                    opacity: 0.85,
                  }}
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label="Next market photo"
                  onClick={() => go(index + 1)}
                  className="absolute right-3 top-1/2 z-10 -translate-y-1/2 flex h-10 w-10 items-center justify-center transition-opacity hover:opacity-100 md:right-4"
                  style={{
                    background: "rgba(5,5,5,0.45)",
                    border: "1px solid rgba(212,175,55,0.4)",
                    color: "var(--lux-gold)",
                    opacity: 0.85,
                  }}
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
              </>
            )}

            <div className="absolute bottom-0 left-0 right-0 z-10 flex items-end justify-between gap-4 p-4 md:p-6">
              <div className="min-w-0">
                <p
                  className="text-[10px] tracking-[0.28em] uppercase mb-1"
                  style={{ color: "var(--lux-gold)", opacity: 0.85 }}
                >
                  Stall presence · {zoneName}
                </p>
                {(active.title || active.subtitle) && (
                  <p
                    className="truncate text-white text-sm md:text-base"
                    style={{ fontFamily: "var(--font-display, serif)" }}
                  >
                    {active.title}
                    {active.subtitle ? (
                      <span className="text-white/65 font-normal">
                        {" "}
                        — {active.subtitle}
                      </span>
                    ) : null}
                  </p>
                )}
              </div>

              {count > 1 && (
                <div
                  className="flex shrink-0 items-center gap-1.5"
                  role="tablist"
                  aria-label="Market slides"
                >
                  {slides.map((slide, i) => (
                    <button
                      key={slide.id}
                      type="button"
                      role="tab"
                      aria-selected={i === index}
                      aria-label={`Show photo ${i + 1} of ${count}`}
                      onClick={() => setIndex(i)}
                      className="h-1.5 rounded-sm transition-all"
                      style={{
                        width: i === index ? "22px" : "8px",
                        background:
                          i === index
                            ? "var(--lux-gold)"
                            : "rgba(255,255,255,0.35)",
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <p className="sr-only" aria-live="polite">
            Photo {index + 1} of {count}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="mt-8 flex flex-col items-center gap-3 text-center"
        >
          <p
            className="lux-body text-sm max-w-md"
            style={{ opacity: 0.72 }}
          >
            Secure a stall for your embassy or cultural house — and be seen where
            guests already gather.
          </p>
          <Link
            href="/zones"
            className="lux-btn-secondary inline-flex items-center gap-2 text-sm tracking-wide"
          >
            Discover the Market Zone
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export default MarketShowcase;
