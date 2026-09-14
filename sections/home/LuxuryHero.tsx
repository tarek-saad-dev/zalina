"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { NEUTRAL_MEDIA_FALLBACK } from "@/lib/media";
import { useMarkHeroReady } from "@/components/media/HeroRevealGate";
import {
  HERO_BLUR_DATA_URL,
  HERO_IMAGE_QUALITY,
} from "@/components/media/heroImage";

const STARS = [
  { top: "8%", left: "12%", size: 2, delay: "0s", dur: "3.2s" },
  { top: "14%", left: "28%", size: 1.5, delay: "1.1s", dur: "4.5s" },
  { top: "6%", left: "52%", size: 2.5, delay: "0.4s", dur: "2.8s" },
  { top: "19%", left: "73%", size: 1.5, delay: "2.0s", dur: "5.1s" },
  { top: "11%", left: "88%", size: 2, delay: "0.8s", dur: "3.7s" },
  { top: "32%", left: "5%", size: 1, delay: "1.6s", dur: "4.0s" },
  { top: "25%", left: "42%", size: 1.5, delay: "0.2s", dur: "3.5s" },
  { top: "7%", left: "65%", size: 2, delay: "1.9s", dur: "4.2s" },
  { top: "40%", left: "95%", size: 1, delay: "0.6s", dur: "5.5s" },
  { top: "22%", left: "18%", size: 1, delay: "2.3s", dur: "3.0s" },
  { top: "15%", left: "80%", size: 2.5, delay: "1.4s", dur: "4.8s" },
  { top: "30%", left: "58%", size: 1, delay: "0.9s", dur: "3.3s" },
];

const RAIL_KEYS = [
  { num: "01", key: "dining", href: "#experiences" },
  { num: "02", key: "gatherings", href: "#experiences" },
  { num: "03", key: "evenings", href: "#experiences" },
  { num: "04", key: "weddings", href: "#weddings" },
] as const;

export function LuxuryHero() {
  const t = useTranslations("home.hero");
  const isArabic = useLocale() === "ar";
  const containerRef = useRef<HTMLDivElement>(null);
  const markHeroReady = useMarkHeroReady();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  const leadFont = isArabic
    ? "var(--font-body-ar), 'Alexandria', sans-serif"
    : "var(--font-display), 'Cormorant Garamond', serif";
  const accentFont = isArabic
    ? "var(--font-laxr), 'LAXR', 'Alexandria', sans-serif"
    : "var(--font-display), 'Cormorant Garamond', serif";
  const uiFont = isArabic
    ? "var(--font-body-ar), 'Alexandria', sans-serif"
    : "var(--font-body), 'Inter', sans-serif";

  const leadPhrase = t("headlineLead");
  const accentPhrase = t("headlineLine3");

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100vh", background: "transparent" }}
    >
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

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,5,5,0.78) 0%, rgba(5,5,5,0.18) 28%, transparent 55%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 42%, rgba(5,5,5,0.7) 78%, #050505 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to right, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.42) 34%, rgba(5,5,5,0.08) 58%, transparent 72%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none rtl:hidden"
        aria-hidden
        style={{
          background:
            "linear-gradient(90deg, rgba(5,5,5,0.55) 0%, transparent 48%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none hidden rtl:block"
        aria-hidden
        style={{
          background:
            "linear-gradient(270deg, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.35) 38%, transparent 62%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(5,5,5,0.55) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 42% at 50% 58%, rgba(212,175,55,0.09) 0%, transparent 72%)",
          animation: "hero-glow-pulse 7s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none hero-mist"
        style={{
          background:
            "linear-gradient(to top, rgba(212,175,55,0.04) 0%, transparent 100%)",
        }}
      />

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

      <motion.div
        className="relative z-10 flex flex-col justify-center min-h-screen px-5 sm:px-8 md:px-12 lg:px-20 pt-[calc(var(--zalina-nav-height)+3rem)] pb-[13.5rem] sm:pb-[12.5rem]"
        style={{ opacity: fadeOut }}
      >
        <div className="w-full max-w-7xl mx-auto">
          <div className="lux-hero-copy mt-6 md:mt-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, delay: 0.08 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{
                marginBottom: "var(--space-4)",
                background: "rgba(212,175,55,0.06)",
                border: "1px solid rgba(212,175,55,0.18)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#D4AF37" }}
              />
              <span
                className="text-[10px] tracking-[0.2em] uppercase"
                style={{ color: "rgba(212,175,55,0.88)", fontFamily: uiFont }}
              >
                {t("badge")}
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.95, delay: 0.28 }}
              className="lux-hero-headline"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                gap: "var(--space-4)",
              }}
            >
              {/* Lead: في قلب الأقصر. / In the Heart of Luxor. */}
              <span
                className="block"
                style={{
                  fontFamily: leadFont,
                  /* Desktop scale restored from 817ae38 */
                  fontSize: "clamp(1.85rem, 3.6vw, 3.15rem)",
                  fontWeight: 400,
                  lineHeight: isArabic ? 1.35 : 1.12,
                  color: "rgba(248,245,237,0.92)",
                  letterSpacing: isArabic ? "0" : "-0.01em",
                  maxWidth: "100%",
                }}
              >
                {leadPhrase}
              </span>

              {/* Accent: على ضفاف النيل. / Along the Nile. */}
              <span
                className={
                  isArabic ? "lux-laxr lux-laxr--hero" : "lux-laxr--hero"
                }
                style={{
                  fontFamily: accentFont,
                  fontSize: isArabic
                    ? undefined
                    : "clamp(2.65rem, 6.4vw, 5.1rem)",
                  fontWeight: 400,
                  lineHeight: isArabic ? undefined : 0.96,
                  color: "#D4AF37",
                  fontStyle: isArabic ? "normal" : "italic",
                  letterSpacing: isArabic ? "0" : "-0.02em",
                  maxWidth: "100%",
                }}
              >
                {accentPhrase}
              </span>
            </motion.h1>

            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.95, delay: 0.82 }}
              className="lux-divider"
              style={{
                marginTop: "var(--space-5)",
                marginBottom: "var(--space-4)",
                transformOrigin: isArabic ? "right" : "left",
                maxWidth: "7.5rem",
                opacity: 0.8,
              }}
            />

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.95 }}
              style={{
                fontFamily: uiFont,
                fontSize: "clamp(0.8125rem, 0.35vw + 0.75rem, 0.9375rem)",
                fontWeight: 300,
                color: "rgba(248,245,237,0.5)",
                lineHeight: 1.8,
                maxWidth: "100%",
              }}
            >
              {t("supporting")}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 1.1 }}
              className="relative z-30 flex flex-col sm:flex-row sm:items-center"
              style={{
                gap: "var(--space-4)",
                marginTop: "var(--space-6)",
              }}
            >
              <Link
                href="/book-now"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-[11px] font-medium uppercase transition-all duration-300 sm:w-auto w-full"
                style={{
                  fontFamily: uiFont,
                  background: "linear-gradient(135deg, #D4AF37 0%, #B8963E 100%)",
                  color: "#050505",
                  borderRadius: "2px",
                  letterSpacing: isArabic ? "0.04em" : "0.14em",
                  boxShadow: "0 8px 24px rgba(212,175,55,0.2)",
                }}
              >
                {t("ctaPrimary")}
              </Link>

              <Link
                href="/experiences"
                className="hidden sm:inline-flex items-center gap-2 group text-[12px] transition-colors duration-300"
                style={{
                  fontFamily: uiFont,
                  color: "rgba(248,245,237,0.58)",
                  letterSpacing: isArabic ? "0.01em" : "0.06em",
                }}
              >
                <span className="group-hover:text-[#D4AF37] transition-colors duration-300">
                  {t("ctaSecondary")}
                </span>
                <ArrowUpRight
                  size={14}
                  className="opacity-50 group-hover:opacity-100 group-hover:text-[#D4AF37] transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 rtl:-scale-x-100"
                />
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 right-0 z-20 px-5 sm:px-8 md:px-12 lg:px-20 pb-6 sm:pb-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/[0.07] border border-white/[0.08]">
          {RAIL_KEYS.map((item) => (
            <Link
              key={item.num}
              href={item.href}
              className="group bg-black/25 backdrop-blur-sm px-4 sm:px-5 py-3.5 sm:py-4 hover:bg-black/45 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="text-[10px] text-[#D4AF37]/55 mt-0.5">
                  {item.num}
                </span>
                <div>
                  <p
                    className="text-xs text-white/75 group-hover:text-[#D4AF37] transition-colors"
                    style={{ fontFamily: uiFont }}
                  >
                    {t(`rail.${item.key}.label`)}
                  </p>
                  <p
                    className="text-[10px] text-white/40 mt-1 hidden sm:block"
                    style={{ fontFamily: uiFont }}
                  >
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
