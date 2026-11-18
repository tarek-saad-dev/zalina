"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CmsImage } from "@/components/media/CmsImage";
import { NEUTRAL_MEDIA_FALLBACK, type CatalogMediaCard } from "@/lib/media";
import { selectSignatureMomentCards, signedCarouselDistance } from "./signatureMomentsLayout";

interface SignatureMomentsProps {
  moments?: CatalogMediaCard[];
}

const GOLD = "#D5AC62";
const CREAM = "#F9F0DF";

/**
 * Curated vertical 3D deck. The photography lives on a dimensional stack while
 * all meaningful copy is in a readable panel, outside the images.
 * Navigation is intentional (no autoplay or hijacking vertical page scroll).
 */
export function SignatureMoments({ moments = [] }: SignatureMomentsProps) {
  const t = useTranslations("home.signatureMoments");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const titleFont = isArabic
    ? "var(--font-body-ar), 'Alexandria', sans-serif"
    : "var(--font-display), 'Cormorant Garamond', serif";
  const bodyFont = isArabic
    ? "var(--font-body-ar), 'Alexandria', sans-serif"
    : "var(--font-body), 'Inter', sans-serif";
  const DirectionArrow = isArabic ? ArrowLeft : ArrowRight;

  const items = selectSignatureMomentCards(moments, {
    id: "neutral",
    title: t("fallbackTitle"),
    subtitle: t("fallbackSubtitle"),
    image: NEUTRAL_MEDIA_FALLBACK,
    alt: t("fallbackAlt"),
  });
  const count = items.length;
  const currentIndex = Math.min(activeIndex, count - 1);
  const active = items[currentIndex];

  useEffect(() => {
    setActiveIndex((index) => (index < count ? index : 0));
  }, [count]);

  const navigate = useCallback((direction: -1 | 1) => {
    setActiveIndex((index) => (index + direction + count) % count);
  }, [count]);

  const select = (index: number) => {
    if (index >= 0 && index < count) setActiveIndex(index);
  };

  return (
    <section
      className="lux-section-compact relative isolate overflow-hidden"
      aria-labelledby="signature-moments-heading"
      style={{ background: "var(--lux-surface)" }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 46% 57% at 17% 50%, rgba(172,115,45,0.105) 0%,transparent 75%)",
        }}
        aria-hidden="true"
      />
      <div className="lux-container relative z-10">
        <div className="mx-auto max-w-[700px] text-center">
          <p className="lux-eyebrow mb-3">{t("eyebrow")}</p>
          <h2
            id="signature-moments-heading"
            className="lux-heading-lg"
            style={{ fontSize: isArabic ? "clamp(1.8rem,3.5vw,2.7rem)" : "clamp(2.1rem,3.7vw,3.2rem)" }}
          >
            {t("title")}
          </h2>
          <p
            className="mx-auto mt-4 max-w-[550px] text-sm leading-[1.9] sm:text-[15px]"
            style={{ color: "rgba(249,240,223,0.67)", fontFamily: bodyFont }}
          >
            {t("intro")}
          </p>
        </div>

        <div className="mt-6 grid items-center gap-4 lg:mt-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-x-16">
          <div
            className="relative isolate mx-auto h-[465px] w-full max-w-[670px] sm:h-[560px] lg:h-[600px]"
            style={{ perspective: "1100px" }}
            role="region"
            aria-roledescription="carousel"
            aria-label={t("carouselAria")}
            tabIndex={count > 1 ? 0 : undefined}
            onKeyDown={(event) => {
              if (count <= 1) return;
              if (event.key === "ArrowUp") {
                event.preventDefault();
                navigate(-1);
              } else if (event.key === "ArrowDown") {
                event.preventDefault();
                navigate(1);
              }
            }}
          >
            <div
              className="pointer-events-none absolute inset-y-[14%] start-[6%] w-[58%] rounded-full blur-[70px]"
              style={{
                background: "radial-gradient(ellipse,rgba(237,178,87,0.29),rgba(181,114,36,0.08) 55%,transparent 77%)",
              }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 top-0 z-[25] h-[15%]"
              style={{ background: "linear-gradient(to bottom,var(--lux-surface),transparent)" }}
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 z-[25] h-[15%]"
              style={{ background: "linear-gradient(to top,var(--lux-surface),transparent)" }}
              aria-hidden="true"
            />

            {items.map((item, index) => {
              const offset = signedCarouselDistance(index, currentIndex, count);
              const distance = Math.abs(offset);
              const selected = offset === 0;
              const light = isArabic
                ? "linear-gradient(255deg,rgba(239,186,91,0.27),transparent 46%,rgba(4,3,2,0.35) 100%)"
                : "linear-gradient(105deg,rgba(239,186,91,0.27),transparent 46%,rgba(4,3,2,0.35) 100%)";
              const directionalShadow = isArabic
                ? "18px 18px 55px rgba(232,175,85,0.23)"
                : "-18px 18px 55px rgba(232,175,85,0.23)";

              return (
                <div
                  key={item.id}
                  className="pointer-events-none absolute inset-0 flex items-center justify-center"
                  aria-hidden="true"
                  style={{ zIndex: selected ? 20 : distance === 1 ? 12 : 5 }}
                >
                  <motion.div
                    className="relative h-[260px] w-[82%] max-w-[465px] overflow-hidden rounded-[22px] border sm:h-[315px] lg:h-[370px]"
                    initial={false}
                    animate={reduceMotion ? {
                      y: offset * 165,
                      scale: selected ? 1 : distance === 1 ? 0.80 : 0.63,
                      opacity: selected ? 1 : distance === 1 ? 0.65 : 0.2,
                    } : {
                      y: offset * 168,
                      z: selected ? 70 : distance === 1 ? -90 : -180,
                      rotateX: selected ? 0 : offset < 0 ? 14 : -14,
                      rotateY: isArabic ? -4 : 4,
                      scale: selected ? 1 : distance === 1 ? 0.84 : 0.69,
                      opacity: selected ? 1 : distance === 1 ? 0.74 : 0.22,
                    }}
                    transition={reduceMotion ? { duration: 0.01 } : {
                      type: "spring",
                      stiffness: 130,
                      damping: 23,
                      mass: 0.85,
                    }}
                    style={{
                      borderColor: selected ? "rgba(244,205,135,0.72)" : "rgba(221,179,104,0.34)",
                      boxShadow: selected
                        ? `0 32px 70px rgba(0,0,0,0.77),${directionalShadow}, inset 0 0 25px rgba(229,163,65,0.16)`
                        : "0 18px 46px rgba(0,0,0,0.7)",
                      background: "#14100B",
                      backfaceVisibility: "hidden",
                    }}
                  >
                    <CmsImage
                      src={item.image}
                      alt={item.alt || item.title}
                      fill
                      sizes="(max-width: 639px) 82vw, (max-width: 1023px) 470px, 480px"
                      className="object-cover"
                      fadeIn={false}
                      priority={index === 0}
                    />
                    <div className="pointer-events-none absolute inset-0" style={{ background: light }} />
                    <div
                      className="absolute start-4 top-4 rounded-full border px-3 py-1.5 text-[10px] font-semibold tracking-[0.14em]"
                      style={{
                        color: CREAM,
                        borderColor: "rgba(255,245,230,0.4)",
                        background: "rgba(9,8,7,0.63)",
                        backdropFilter: "blur(8px)",
                      }}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    {!selected && <div className="absolute inset-0 bg-black/25" />}
                  </motion.div>
                </div>
              );
            })}
          </div>

          <div className="relative mx-auto w-full max-w-[570px] pb-5 pt-1 lg:pb-0 lg:pt-0" dir={isArabic ? "rtl" : "ltr"}>
            <div className="mb-5 flex items-center gap-3" style={{ color: GOLD }}>
              <Sparkles size={18} aria-hidden="true"/>
              <span className="text-[11px] font-semibold tracking-[0.16em]" style={{ fontFamily: bodyFont }}>
                {t("feature")}
              </span>
              <span className="ms-auto text-xs tabular-nums" style={{ color: "rgba(249,240,223,0.5)" }}>
                {String(currentIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
              </span>
            </div>

            <div aria-live="polite" aria-atomic="true" className="min-h-[140px]">
              <motion.div
                key={active.id}
                initial={reduceMotion ? false : { opacity: 0, y: 13 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.32 }}
              >
                <h3
                  className="text-[clamp(1.55rem,2.8vw,2.5rem)] leading-[1.48]"
                  style={{ fontFamily: titleFont, fontWeight: isArabic ? 600 : 400, color: CREAM, overflowWrap: "anywhere" }}
                >
                  {active.title}
                </h3>
                {active.subtitle?.trim() && (
                  <p
                    className="mt-4 text-[14px] leading-[1.95] sm:text-[15px]"
                    style={{ fontFamily: bodyFont, color: "rgba(249,240,223,0.72)", overflowWrap: "anywhere" }}
                  >
                    {active.subtitle}
                  </p>
                )}
              </motion.div>
            </div>

            <Link
              href={active.href || "/experiences"}
              aria-label={t("cardAria", { title: active.title })}
              className="mt-7 inline-flex min-h-[48px] items-center gap-3 rounded-full border px-6 text-[13px] font-semibold transition-colors hover:border-[#EBCB8C] hover:bg-[#B8833E]/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EBCB8C]"
              style={{
                borderColor: "rgba(226,183,102,0.6)",
                color: "#F2DBA8",
                fontFamily: bodyFont,
              }}
            >
              {t("discover")} <DirectionArrow size={16} aria-hidden="true" />
            </Link>

            {count > 1 && (
              <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t pt-5" style={{ borderColor: "rgba(223,180,105,0.19)" }}>
                <div className="flex items-center gap-2" role="group" aria-label={t("navigationAria")}>
                  <button
                    type="button"
                    onClick={() => navigate(-1)}
                    aria-label={t("previousAria")}
                    className="flex h-12 w-12 items-center justify-center rounded-full border transition-all hover:border-[#D5AC62] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EBCB8C]"
                    style={{ color: CREAM, borderColor: "rgba(249,240,223,0.25)" }}
                  >
                    <ChevronUp size={22} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(1)}
                    aria-label={t("nextAria")}
                    className="flex h-12 w-12 items-center justify-center rounded-full border transition-all hover:border-[#D5AC62] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EBCB8C]"
                    style={{ color: CREAM, borderColor: "rgba(249,240,223,0.25)" }}
                  >
                    <ChevronDown size={22} aria-hidden="true" />
                  </button>
                  <span className="ms-2 text-[11px]" style={{ color: "rgba(249,240,223,0.48)", fontFamily: bodyFont }}>
                    {t("navigateHint")}
                  </span>
                </div>
                <div className="flex items-center gap-2" role="group" aria-label={t("pickMomentAria")}>
                  {items.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => select(index)}
                      aria-label={t("showMomentAria", { title: item.title })}
                      aria-pressed={index === currentIndex}
                      className="flex h-10 w-10 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EBCB8C]"
                    >
                      <span
                        className="block h-[5px] rounded-full transition-all"
                        style={{
                          width: index === currentIndex ? "22px" : "7px",
                          background: index === currentIndex ? GOLD : "rgba(249,240,223,0.27)",
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Link
              href="/experiences"
              className="mt-5 inline-flex min-h-10 items-center gap-2 text-[12px] transition-colors hover:text-[#F3D69B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EBCB8C]"
              style={{ color: "rgba(247,226,186,0.73)", fontFamily: bodyFont }}
            >
              {t("exploreAll")} <DirectionArrow size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
