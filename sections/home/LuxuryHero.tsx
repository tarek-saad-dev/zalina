"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { NEUTRAL_MEDIA_FALLBACK } from "@/lib/media";
import { useMarkHeroReady } from "@/components/media/HeroRevealGate";
import {
  HERO_BLUR_DATA_URL,
  HERO_IMAGE_QUALITY,
} from "@/components/media/heroImage";

const STARS = [
  { top: "8%",  left: "12%", size: 2,   delay: "0s",   dur: "3.2s" },
  { top: "14%", left: "28%", size: 1.5, delay: "1.1s", dur: "4.5s" },
  { top: "6%",  left: "52%", size: 2.5, delay: "0.4s", dur: "2.8s" },
  { top: "19%", left: "73%", size: 1.5, delay: "2.0s", dur: "5.1s" },
  { top: "11%", left: "88%", size: 2,   delay: "0.8s", dur: "3.7s" },
  { top: "32%", left: "5%",  size: 1,   delay: "1.6s", dur: "4.0s" },
  { top: "25%", left: "42%", size: 1.5, delay: "0.2s", dur: "3.5s" },
  { top: "7%",  left: "65%", size: 2,   delay: "1.9s", dur: "4.2s" },
  { top: "40%", left: "95%", size: 1,   delay: "0.6s", dur: "5.5s" },
  { top: "22%", left: "18%", size: 1,   delay: "2.3s", dur: "3.0s" },
  { top: "15%", left: "80%", size: 2.5, delay: "1.4s", dur: "4.8s" },
  { top: "30%", left: "58%", size: 1,   delay: "0.9s", dur: "3.3s" },
];

const RAIL_KEYS = [
  { num: "01", key: "dining", href: "#experiences" },
  { num: "02", key: "gatherings", href: "#experiences" },
  { num: "03", key: "evenings", href: "#experiences" },
  { num: "04", key: "weddings", href: "#weddings" },
] as const;

export function LuxuryHero() {
  const t = useTranslations("home.hero");
  const containerRef = useRef<HTMLDivElement>(null);
  const markHeroReady = useMarkHeroReady();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgY     = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100vh", background: "transparent" }}
    >
      {/* ── LAYER 1: Background Image ─────────────────── */}
      <motion.div className="absolute inset-0" style={{ y: bgY, scale: bgScale }}>
        <Image
          src={NEUTRAL_MEDIA_FALLBACK}
          alt={t("imageAlt")}
          fill
          className="object-cover object-center"
          priority
          fetchPriority="high"
          quality={HERO_IMAGE_QUALITY}
          sizes="100vw"
          placeholder="blur"
          blurDataURL={HERO_BLUR_DATA_URL}
          onLoadingComplete={markHeroReady}
        />
      </motion.div>

      {/* ── LAYER 2: Cinematic Overlays ───────────────── */}
      {/* Top dark gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(5,5,5,0.75) 0%, rgba(5,5,5,0.15) 30%, transparent 58%)",
        }}
      />
      {/* Bottom black fade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, transparent 45%, rgba(5,5,5,0.65) 75%, #050505 100%)",
        }}
      />
      {/* Left side depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, rgba(5,5,5,0.45) 0%, transparent 50%)",
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 42%, rgba(5,5,5,0.5) 100%)",
        }}
      />
      {/* Gold radial glow from palace center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 42% at 50% 58%, rgba(212,175,55,0.11) 0%, transparent 72%)",
          animation: "hero-glow-pulse 7s ease-in-out infinite",
        }}
      />
      {/* Mist drift */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none hero-mist"
        style={{
          background: "linear-gradient(to top, rgba(212,175,55,0.05) 0%, transparent 100%)",
        }}
      />

      {/* ── LAYER 3: Stars ────────────────────────────── */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="hero-star pointer-events-none"
          style={{
            top: s.top,
            left: s.left,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        />
      ))}

      {/* ── LAYER 4: Main Content ─────────────────────── */}
      <motion.div
        className="relative z-10 flex flex-col justify-center min-h-screen px-6 md:px-12 lg:px-20 pt-[100px] pb-[220px] sm:pb-[200px]"
        style={{ opacity: fadeOut }}
      >
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-14">

          {/* ── Left / Main Text ──────────────────────── */}
          <div className="flex-1 max-w-2xl mt-5">

            {/* Location badge */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-7 px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(212,175,55,0.07)",
                border: "1px solid rgba(212,175,55,0.22)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#D4AF37" }} />
              <span
                className="text-[10px] tracking-[0.24em] uppercase"
                style={{ color: "#D4AF37", fontFamily: "var(--font-body, sans-serif)" }}
              >
                {t("badge")}
              </span>
            </motion.div>

            {/* Headline — intentional 3-line break on all viewports */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.38 }}
              style={{
                fontFamily: "var(--font-display, 'Cormorant Garamond', serif)",
                fontSize: "clamp(44px, 6.2vw, 90px)",
                fontWeight: 400,
                lineHeight: 1.04,
                color: "#F8F5ED",
                letterSpacing: "-0.01em",
              }}
            >
              {t("headlineLine1")}
              <br />
              <span className="lux-shimmer" style={{ fontSize: "clamp(42px, 5.8vw, 86px)" }}>
                {t("headlineLine2")}
              </span>
              <br />
              <span style={{ color: "#D4AF37", fontStyle: "italic" }}>
                {t("headlineLine3")}
              </span>
            </motion.h1>

            {/* Gold divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, delay: 0.9 }}
              className="lux-divider mt-6 mb-8"
              style={{ transformOrigin: "left", maxWidth: "180px" }}
            />

            {/* Supporting line — single text block below the headline */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.05 }}
              style={{
                fontFamily: "var(--font-body, sans-serif)",
                fontSize: "clamp(14px, 1.35vw, 17px)",
                color: "rgba(248,245,237,0.68)",
                lineHeight: 1.8,
                maxWidth: "34rem",
              }}
            >
              {t("supporting")}
            </motion.p>

            {/* CTAs — primary Book Now; secondary desktop-only (distinct from booking) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.25 }}
              className="relative z-30 flex flex-col sm:flex-row items-start gap-4 mt-10"
            >
              {/* Primary */}
              <Link
                href="/book-now"
                className="inline-flex items-center justify-center gap-2 px-9 py-4 text-xs font-medium uppercase transition-all duration-300 sm:w-auto w-full"
                style={{
                  fontFamily: "var(--font-body, sans-serif)",
                  background: "linear-gradient(135deg, #D4AF37 0%, #B8963E 100%)",
                  color: "#050505",
                  borderRadius: "2px",
                  letterSpacing: "0.18em",
                  boxShadow: "0 8px 28px rgba(212,175,55,0.28)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 38px rgba(212,175,55,0.44)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(212,175,55,0.28)";
                }}
              >
                {t("ctaPrimary")}
              </Link>

              {/* Secondary — hidden on mobile (avoids duplicate CTAs on small screens) */}
              <Link
                href="/experiences"
                className="hidden sm:inline-flex items-center justify-center gap-2 px-9 py-4 text-xs font-medium uppercase transition-all duration-300"
                style={{
                  fontFamily: "var(--font-body, sans-serif)",
                  background: "transparent",
                  color: "rgba(248,245,237,0.82)",
                  border: "1px solid rgba(212,175,55,0.38)",
                  borderRadius: "2px",
                  letterSpacing: "0.18em",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#D4AF37";
                  (e.currentTarget as HTMLElement).style.color = "#D4AF37";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,175,55,0.38)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(248,245,237,0.82)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                {t("ctaSecondary")}
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* ── Bottom Rail ───────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-20 px-6 md:px-12 lg:px-20 pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/10 border border-white/10">
          {RAIL_KEYS.map((item) => (
            <Link
              key={item.num}
              href={item.href}
              className="group bg-black/30 backdrop-blur-sm px-5 py-4 hover:bg-black/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-[10px] text-[#D4AF37]/60 mt-0.5">{item.num}</span>
                <div>
                  <p className="text-xs text-white/80 group-hover:text-[#D4AF37] transition-colors">
                    {t(`rail.${item.key}.label`)}
                  </p>
                  <p className="text-[10px] text-white/45 mt-1 hidden sm:block">
                    {t(`rail.${item.key}.sub`)}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
