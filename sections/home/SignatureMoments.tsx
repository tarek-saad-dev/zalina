"use client";

import React, { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CmsImage } from "@/components/media/CmsImage";
import {
  NEUTRAL_MEDIA_FALLBACK,
  type CatalogMediaCard,
} from "@/lib/media";
import {
  detectRtlScrollMode,
  isNearEnd,
  isNearStart,
  scrollForward,
  scrollToStart,
  type RtlScrollMode,
} from "@/lib/rtl/scroll";

const cardWidths = ["340px", "380px", "320px", "360px", "300px"];
const AUTO_SCROLL_PX = 380;
const MANUAL_SCROLL_PX = 400;

interface SignatureMomentsProps {
  moments?: CatalogMediaCard[];
}

export function SignatureMoments({ moments = [] }: SignatureMomentsProps) {
  const t = useTranslations("home.signatureMoments");
  const isArabic = useLocale() === "ar";
  const titleFont = isArabic
    ? "var(--font-body-ar), 'Alexandria', sans-serif"
    : "var(--font-display), 'Cormorant Garamond', serif";
  const bodyFont = isArabic
    ? "var(--font-body-ar), 'Alexandria', sans-serif"
    : "var(--font-body), 'Inter', sans-serif";
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollModeRef = useRef<RtlScrollMode>("ltr");
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);

  const items =
    moments.length > 0
      ? moments
      : [
          {
            id: "neutral",
            title: t("fallbackTitle"),
            subtitle: t("fallbackSubtitle"),
            image: NEUTRAL_MEDIA_FALLBACK,
            alt: t("fallbackAlt"),
          },
        ];

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const mode = scrollModeRef.current;
    setCanScrollPrev(!isNearStart(el, 10, mode));
    setCanScrollNext(!isNearEnd(el, 10, mode));
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    scrollModeRef.current = detectRtlScrollMode(el);
    checkScroll();
    el.addEventListener("scroll", checkScroll, { passive: true });
    return () => el.removeEventListener("scroll", checkScroll);
  }, [items.length, isArabic]);

  const scrollByDir = (dir: "prev" | "next") => {
    const el = scrollRef.current;
    if (!el) return;
    const mode = scrollModeRef.current;
    if (dir === "next") {
      scrollForward(el, MANUAL_SCROLL_PX, "smooth", mode);
    } else {
      scrollForward(el, -MANUAL_SCROLL_PX, "smooth", mode);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      const mode = scrollModeRef.current;

      if (isNearEnd(el, 50, mode)) {
        scrollToStart(el, "smooth", mode);
      } else {
        scrollForward(el, AUTO_SCROLL_PX, "smooth", mode);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isArabic]);

  return (
    <section
      className="relative overflow-hidden lux-section-compact"
      style={{ background: "var(--lux-surface)" }}
    >
      <div className="lux-container" style={{ marginBottom: "var(--space-5)" }}>
        <div className="text-center relative">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lux-eyebrow"
            style={{ marginBottom: "var(--space-3)" }}
          >
            {t("eyebrow")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lux-heading-lg"
          >
            {t("title")}
          </motion.h2>

          <div className="hidden md:flex gap-2 absolute bottom-0 inset-inline-end-0">
            <button
              type="button"
              onClick={() => scrollByDir("prev")}
              disabled={!canScrollPrev}
              aria-label="Previous"
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                canScrollPrev
                  ? "bg-white/10 hover:bg-white/20 border border-white/20"
                  : "bg-white/5 border border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              {isArabic ? (
                <ChevronRight size={24} className="text-white" />
              ) : (
                <ChevronLeft size={24} className="text-white" />
              )}
            </button>
            <button
              type="button"
              onClick={() => scrollByDir("next")}
              disabled={!canScrollNext}
              aria-label="Next"
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                canScrollNext
                  ? "bg-white/10 hover:bg-white/20 border border-white/20"
                  : "bg-white/5 border border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              {isArabic ? (
                <ChevronLeft size={24} className="text-white" />
              ) : (
                <ChevronRight size={24} className="text-white" />
              )}
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        dir={isArabic ? "rtl" : "ltr"}
        className="flex overflow-x-auto scrollbar-hide"
        style={{
          gap: "16px",
          paddingInlineStart:
            "max(24px, calc((100vw - 1440px) / 2 + 80px))",
          paddingInlineEnd: "24px",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {items.map((moment, index) => (
          <motion.div
            key={moment.id}
            initial={{ opacity: 0, x: isArabic ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative overflow-hidden flex-shrink-0"
            style={{
              width: cardWidths[index % cardWidths.length],
              height: "420px",
              scrollSnapAlign: "start",
            }}
          >
            <div
              className="absolute inset-0"
              style={{ width: "100%", height: "100%" }}
            >
              <CmsImage
                src={moment.image}
                alt={moment.alt || moment.title}
                fill
                sizes="(max-width: 768px) 85vw, 400px"
                className="object-cover"
                priority={index < 3}
                loading={index < 3 ? undefined : "eager"}
                fadeIn={false}
                quality={75}
              />
            </div>

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `
                  linear-gradient(
                    to top,
                    rgba(5,5,5,0.92) 0%,
                    rgba(5,5,5,0.72) 28%,
                    rgba(5,5,5,0.35) 52%,
                    rgba(5,5,5,0.08) 72%,
                    transparent 100%
                  )
                `,
              }}
            />

            <div className="absolute bottom-0 left-0 right-0 p-6">
              <div className="flex flex-col" style={{ minHeight: "5.75rem" }}>
                <h3
                  className="text-white leading-tight line-clamp-1"
                  style={{
                    fontFamily: titleFont,
                    fontSize: isArabic
                      ? "clamp(0.95rem, 1.5vw + 0.5rem, 1.1rem)"
                      : "clamp(1.05rem, 1.2vw + 0.6rem, 1.25rem)",
                    fontWeight: isArabic ? 500 : 400,
                    letterSpacing: isArabic ? "0" : "0.02em",
                    lineHeight: isArabic ? 1.45 : 1.25,
                    marginBottom: "var(--space-2)",
                    textShadow:
                      "0 2px 12px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.7)",
                  }}
                >
                  {moment.title}
                </h3>
                <p
                  className="line-clamp-2"
                  style={{
                    fontSize: isArabic ? "0.8125rem" : "0.875rem",
                    fontFamily: bodyFont,
                    fontWeight: 400,
                    letterSpacing: isArabic ? "0" : undefined,
                    lineHeight: isArabic ? 1.7 : 1.55,
                    color: "rgba(255,255,255,0.72)",
                    textShadow: "0 1px 8px rgba(0,0,0,0.85)",
                  }}
                >
                  {moment.subtitle || "\u00A0"}
                </p>
              </div>

              <div
                className="mt-4 h-[2px] w-12"
                style={{
                  background: isArabic
                    ? "linear-gradient(270deg, #D4AF37, transparent)"
                    : "linear-gradient(90deg, #D4AF37, transparent)",
                }}
              />
            </div>
          </motion.div>
        ))}

        <div style={{ width: "24px", flexShrink: 0 }} aria-hidden />
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
