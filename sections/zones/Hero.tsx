"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { NEUTRAL_MEDIA_FALLBACK } from "@/lib/media";
import { useMarkHeroReady } from "@/components/media/HeroRevealGate";
import {
  HERO_BLUR_DATA_URL,
  HERO_IMAGE_QUALITY,
} from "@/components/media/heroImage";

export function Hero() {
  const t = useTranslations("zones");
  const prefersReduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  const markHeroReady = useMarkHeroReady();

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden flex items-center justify-center"
      aria-label={t("hero.ariaLabel")}
    >
      <motion.div
        className="absolute inset-0"
        initial={!prefersReduced ? { scale: 1.08 } : undefined}
        animate={!prefersReduced ? { scale: 1 } : undefined}
        transition={{ duration: 12, ease: "easeOut" }}
      >
        <Image
          src={NEUTRAL_MEDIA_FALLBACK}
          alt={t("hero.imageAlt")}
          fill
          className="object-cover"
          priority
          fetchPriority="high"
          quality={HERO_IMAGE_QUALITY}
          sizes="100vw"
          placeholder="blur"
          blurDataURL={HERO_BLUR_DATA_URL}
          onLoadingComplete={markHeroReady}
        />
      </motion.div>

      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 35%, rgba(5,5,5,0.6) 100%),
            linear-gradient(180deg, rgba(5,5,5,0.35) 0%, rgba(5,5,5,0.08) 45%, rgba(5,5,5,0.5) 100%)
          `,
        }}
      />

      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(200,155,82,0.12) 0%, transparent 70%)",
        }}
      />

      <div
        className="exp-hero-stars absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      <div
        className="exp-hero-mist absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      {!isMobile && !prefersReduced && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {[
            { top: "22%", left: "15%", delay: "0s" },
            { top: "38%", left: "80%", delay: "3s" },
            { top: "65%", left: "25%", delay: "5s" },
          ].map((p, i) => (
            <span
              key={i}
              className="exp-particle"
              style={{ top: p.top, left: p.left, animationDelay: p.delay }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-5 sm:px-8 pt-28 md:pt-0 max-w-[700px] mx-auto">
        <motion.span
          className="block text-xs md:text-[11px] font-medium tracking-[0.28em] uppercase mb-5"
          style={{ color: "var(--zones-gold)" }}
          initial={!prefersReduced ? { opacity: 0, y: 18 } : undefined}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          {t("hero.eyebrow")}
        </motion.span>

        <motion.div
          className="mb-5"
          aria-hidden="true"
          style={{
            width: "48px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, var(--zones-gold), transparent)",
          }}
          initial={!prefersReduced ? { opacity: 0, scaleX: 0 } : undefined}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />

        <motion.h1
          className="zones-hero-title mb-4"
          style={{ fontSize: "clamp(2.25rem, 5.5vw, 3.5rem)" }}
          initial={
            !prefersReduced ? { opacity: 0, y: 24, filter: "blur(6px)" } : undefined
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.5 }}
        >
          {t("hero.title")}
        </motion.h1>

        <motion.p
          className="zones-body mb-7 max-w-[500px]"
          style={{ fontSize: "clamp(0.9375rem, 1.2vw, 1rem)" }}
          initial={!prefersReduced ? { opacity: 0, y: 16 } : undefined}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={!prefersReduced ? { opacity: 0, y: 14 } : undefined}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <Link
            href="#main-zones"
            className="zones-btn-gold zones-radius-pill flex items-center justify-center text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--zones-bg)]"
            style={{ height: "44px", paddingInline: "28px" }}
          >
            {t("hero.ctaPrimary")}
          </Link>
          <Link
            href="/book-now"
            className="flex items-center justify-center text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:border-[var(--zones-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--zones-bg)]"
            style={{
              height: "44px",
              paddingInline: "28px",
              background: "rgba(17, 21, 28, 0.65)",
              color: "var(--zones-text-light)",
              borderRadius: "999px",
              border: "1px solid var(--zones-border)",
              backdropFilter: "blur(8px)",
            }}
          >
            {t("hero.ctaSecondary")}
          </Link>
        </motion.div>
      </div>

      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
        initial={!prefersReduced ? { opacity: 0 } : undefined}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
      >
        <span
          className="text-[10px] tracking-[0.2em] uppercase"
          style={{ color: "var(--zones-text-muted)" }}
        >
          {t("hero.scroll")}
        </span>
        <ChevronDown
          size={18}
          className="exp-scroll-indicator"
          style={{ color: "var(--zones-gold)" }}
        />
      </motion.div>
    </section>
  );
}
