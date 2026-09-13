"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useBookingLocale } from "@/components/book-now/useBookingLocale";
import { useMarkHeroReady } from "@/components/media/HeroRevealGate";
import { HERO_IMAGE_QUALITY } from "@/components/media/heroImage";
import { WEDDING_COPY } from "./content/weddingCopy";
import { pickLocale } from "./content/locale";
import { resolveWeddingMediaSrc, WEDDING_MEDIA } from "./content/weddingMedia";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function WeddingHero() {
  const locale = useBookingLocale();
  const prefersReduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const markHeroReady = useMarkHeroReady();
  const src = resolveWeddingMediaSrc("hero");
  const alt = pickLocale(locale, WEDDING_MEDIA.hero.alt);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section
      className="relative w-full min-h-[100svh] overflow-hidden flex items-end md:items-center"
      aria-label={pickLocale(locale, WEDDING_COPY.heroEyebrow)}
    >
      <motion.div
        className="absolute inset-0"
        initial={!prefersReduced ? { scale: 1.06 } : undefined}
        animate={!prefersReduced ? { scale: 1 } : undefined}
        transition={{ duration: 14, ease: "easeOut" }}
      >
        <Image
          src={src}
          alt={alt}
          fill
          priority
          fetchPriority="high"
          quality={HERO_IMAGE_QUALITY}
          className="object-cover"
          style={{
            objectPosition: isMobile ? "62% center" : "center center",
          }}
          sizes="100vw"
          onLoadingComplete={markHeroReady}
        />
      </motion.div>

      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background: `
            linear-gradient(90deg, rgba(5,5,5,0.78) 0%, rgba(5,5,5,0.35) 48%, rgba(5,5,5,0.55) 100%),
            linear-gradient(180deg, rgba(5,5,5,0.45) 0%, rgba(5,5,5,0.12) 40%, rgba(5,5,5,0.78) 100%)
          `,
        }}
      />

      <div className="zones-container relative z-10 w-full pb-16 pt-28 md:py-28">
        <motion.div
          className="max-w-3xl"
          initial={!prefersReduced ? { opacity: 0, y: 24 } : undefined}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
        >
          <p
            className="text-[11px] tracking-[0.28em] uppercase mb-5"
            style={{ color: "var(--zones-gold)" }}
          >
            {pickLocale(locale, WEDDING_COPY.heroEyebrow)}
          </p>
          <h1
            className="zones-hero-title mb-6"
            style={{
              fontSize: "clamp(2.1rem, 5.5vw, 4.25rem)",
              lineHeight: 1.08,
              color: "#F8F2E7",
            }}
          >
            {pickLocale(locale, WEDDING_COPY.heroHeadline)}
          </h1>
          <p
            className="zones-body max-w-2xl mb-4"
            style={{ color: "rgba(248,242,231,0.78)", fontSize: "clamp(1rem, 2vw, 1.15rem)" }}
          >
            {pickLocale(locale, WEDDING_COPY.heroSupport)}
          </p>
          <p
            className="mb-8 text-sm tracking-wide"
            style={{ color: "rgba(212,175,55,0.85)" }}
          >
            {pickLocale(locale, WEDDING_COPY.heroLine)}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className="zones-btn-gold zones-radius-pill inline-flex items-center justify-center h-11 px-7 text-[12px] font-medium tracking-[0.14em] uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--zones-bg)]"
              onClick={() => scrollToId("packages")}
            >
              {pickLocale(locale, WEDDING_COPY.ctaExplorePackages)}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center h-11 px-7 text-[12px] font-medium tracking-[0.14em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(248,242,231,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--zones-bg)]"
              style={{
                borderRadius: "999px",
                border: "1px solid rgba(248,242,231,0.35)",
                color: "#F8F2E7",
                background: "rgba(0,0,0,0.25)",
              }}
              onClick={() => scrollToId("plan")}
            >
              {pickLocale(locale, WEDDING_COPY.ctaCheckDate)}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
