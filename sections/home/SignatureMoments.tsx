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

const cardWidths = ["340px", "380px", "320px", "360px", "300px"];

interface SignatureMomentsProps {
  moments?: CatalogMediaCard[];
}

export function SignatureMoments({ moments = [] }: SignatureMomentsProps) {
  const t = useTranslations("home.signatureMoments");
  const isArabic = useLocale() === "ar";
  const titleFont = isArabic
    ? "var(--font-heading-ar), 'Alexandria', sans-serif"
    : "var(--font-display), 'Cormorant Garamond', serif";
  const bodyFont = isArabic
    ? "var(--font-heading-ar), 'Alexandria', sans-serif"
    : "var(--font-body), 'Inter', sans-serif";
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

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
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, [items.length]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 50;

        if (isAtEnd) {
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          scrollRef.current.scrollBy({ left: 380, behavior: "smooth" });
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--lux-surface)", paddingTop: "50px", paddingBottom: "60px" }}
    >
      <div className="lux-container mb-8">
        <div className="text-center relative">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lux-eyebrow mb-3"
          >
            {t("eyebrow")}
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lux-heading-lg"
            style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
          >
            {t("title")}
          </motion.h2>

          <div className="hidden md:flex gap-2 absolute right-0 bottom-0">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                canScrollLeft
                  ? "bg-white/10 hover:bg-white/20 border border-white/20"
                  : "bg-white/5 border border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                canScrollRight
                  ? "bg-white/10 hover:bg-white/20 border border-white/20"
                  : "bg-white/5 border border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide"
        style={{
          gap: "16px",
          paddingLeft: "max(24px, calc((100vw - 1440px) / 2 + 80px))",
          paddingRight: "24px",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {items.map((moment, index) => (
          <motion.div
            key={moment.id}
            initial={{ opacity: 0, x: 30 }}
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
            <div className="absolute inset-0" style={{ width: "100%", height: "100%" }}>
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
                  className="text-white leading-tight mb-2 line-clamp-1"
                  style={{
                    fontFamily: titleFont,
                    fontSize: isArabic ? "1.2rem" : "1.35rem",
                    fontWeight: isArabic ? 500 : 400,
                    letterSpacing: isArabic ? "0" : "0.02em",
                    lineHeight: isArabic ? 1.45 : 1.25,
                    minHeight: "1.6rem",
                    textShadow: "0 2px 12px rgba(0,0,0,0.9), 0 1px 3px rgba(0,0,0,0.7)",
                  }}
                >
                  {moment.title}
                </h3>
                <p
                  className="text-white/90 leading-snug line-clamp-2"
                  style={{
                    fontSize: isArabic ? "0.875rem" : "0.9rem",
                    fontFamily: bodyFont,
                    fontWeight: isArabic ? 400 : 400,
                    letterSpacing: isArabic ? "0" : undefined,
                    lineHeight: isArabic ? 1.55 : 1.4,
                    minHeight: "2.7rem",
                    textShadow: "0 1px 8px rgba(0,0,0,0.85)",
                  }}
                >
                  {moment.subtitle || "\u00A0"}
                </p>
              </div>

              <div
                className="mt-4 h-[2px] w-12"
                style={{
                  background: "linear-gradient(90deg, #D4AF37, transparent)",
                }}
              />
            </div>
          </motion.div>
        ))}

        <div style={{ width: "24px", flexShrink: 0 }} />
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
