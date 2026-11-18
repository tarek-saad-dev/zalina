"use client";

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CmsImage } from "@/components/media/CmsImage";
import { NEUTRAL_MEDIA_FALLBACK, type CatalogMediaCard } from "@/lib/media";
import { getMomentDeckPose, momentDeckXShift, selectSignatureMomentCards, signedCarouselDistance } from "./signatureMomentsLayout";

interface SignatureMomentsProps {
  moments?: CatalogMediaCard[];
}

const GOLD = "#D5AC62";
const CREAM = "#F9F0DF";
const PREVIEW_CHARS = 148;

/**
 * Portrait 3D coverflow, inspired by the user's reference: one dominant front
 * card, smaller tilted side cards receding in Z, and directional golden light.
 * Do not block vertical page scrolling; horizontal swipes navigate on touch.
 */
export function SignatureMoments({ moments = [] }: SignatureMomentsProps) {
  const t = useTranslations("home.signatureMoments");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const titleFont = isArabic
    ? "var(--font-body-ar), 'Alexandria', sans-serif"
    : "var(--font-display), 'Cormorant Garamond', serif";
  const bodyFont = isArabic
    ? "var(--font-body-ar), 'Alexandria', sans-serif"
    : "var(--font-body), 'Inter', sans-serif";
  const PrevIcon = isArabic ? ChevronRight : ChevronLeft;
  const NextIcon = isArabic ? ChevronLeft : ChevronRight;
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
  const detail = active.subtitle?.trim() || "";
  const canExpand = detail.length > PREVIEW_CHARS;
  const visibleDetail = canExpand && !expanded
    ? detail.slice(0, PREVIEW_CHARS).trimEnd() + "…"
    : detail;

  useEffect(() => {
    setActiveIndex((index) => index < count ? index : 0);
  }, [count]);

  const select = useCallback((index: number) => {
    if (index < 0 || index >= count) return;
    setActiveIndex(index);
    setExpanded(false);
  }, [count]);

  const navigate = useCallback((direction: -1 | 1) => {
    if (count < 2) return;
    setActiveIndex((index) => (index + direction + count) % count);
    setExpanded(false);
  }, [count]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
  };
  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStart.current;
    touchStart.current = null;
    const touch = event.changedTouches[0];
    if (!start || !touch || count < 2) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    // Never intercept a natural vertical page scroll.
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      navigate((dx * (isArabic ? -1 : 1) < 0 ? 1 : -1));
    }
  };

  return (
    <section
      className="signature-moments-section lux-section-compact relative isolate overflow-hidden"
      aria-labelledby="signature-moments-heading"
      style={{ background: "var(--lux-surface)", paddingBlock: "clamp(18px, 2.5vh, 30px)" }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{
        background: "radial-gradient(ellipse 45% 60% at 18% 54%, rgba(187,119,47,0.13),transparent 72%)",
      }} />
      <div className="lux-container relative z-10">
        <header className="mx-auto max-w-[760px] text-center">
          <p className="lux-eyebrow mb-1.5 sm:mb-2">{t("eyebrow")}</p>
          <h2 id="signature-moments-heading" className="lux-heading-lg" style={{
            fontSize: isArabic ? "clamp(1.55rem,2.8vw,2.25rem)" : "clamp(1.95rem,3.2vw,2.75rem)",
            lineHeight: 1.25,
          }}>{t("title")}</h2>
          <p className="mx-auto mt-2 hidden max-w-[600px] text-[13px] leading-[1.6] sm:block" style={{
            color: "rgba(249,240,223,0.64)", fontFamily: bodyFont,
          }}>{t("intro")}</p>
        </header>

        <div
          className="signature-moments-stage relative mt-2 w-full sm:mt-3"
          style={{ perspective: "1250px", transformStyle: "preserve-3d" }}
          role="region"
          aria-roledescription="carousel"
          aria-label={t("carouselAria")}
          tabIndex={count > 1 ? 0 : undefined}
          onKeyDown={(event) => {
            if (count < 2) return;
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              navigate(isArabic ? 1 : -1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              navigate(isArabic ? -1 : 1);
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div className="signature-moments-aura pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true" />
          <div className="signature-moments-ground pointer-events-none absolute bottom-[1%] left-1/2" aria-hidden="true" />

          {items.map((item, index) => {
            const offset = signedCarouselDistance(index, currentIndex, count);
            const visualOffset = offset * (isArabic ? -1 : 1);
            const pose = getMomentDeckPose(visualOffset);
            const selected = offset === 0;
            const transform = [
              "translate(-50%, -50%)",
              "translate3d(" + momentDeckXShift(visualOffset) + ", 0px, " + (reduceMotion ? 0 : pose.depth) + "px)",
              "rotateY(" + (reduceMotion ? 0 : pose.rotateY) + "deg)",
              "scale(" + (reduceMotion ? (selected ? 1 : 0.8) : pose.scale) + ")",
            ].join(" ");

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => select(index)}
                aria-label={t("showMomentAria", { title: item.title })}
                aria-pressed={selected}
                tabIndex={pose.visible ? 0 : -1}
                className="signature-moments-card absolute left-1/2 top-1/2 block cursor-pointer overflow-hidden rounded-[19px] border bg-[#100D0A] p-0 text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EBCB8C]"
                style={{
                  width: "var(--moment-card-width)",
                  height: "var(--moment-card-height)",
                  zIndex: pose.zIndex,
                  transform,
                  opacity: pose.visible ? (selected ? 1 : pose.opacity) : 0,
                  filter: selected ? "brightness(1.06)" : "brightness(0.72)",
                  boxShadow: selected
                    ? "0 30px 65px rgba(0,0,0,0.85), -22px 12px 58px rgba(206,143,58,0.28), inset 3px 0 15px rgba(233,173,78,0.22)"
                    : "0 24px 45px rgba(0,0,0,0.82), -9px 3px 22px rgba(184,112,43,0.14)",
                  borderColor: selected ? "rgba(238,192,112,0.76)" : "rgba(213,172,98,0.27)",
                  pointerEvents: pose.visible ? "auto" : "none",
                  transition: reduceMotion ? "none" :
                    "transform 670ms cubic-bezier(.22,1,.36,1), opacity 480ms ease, filter 550ms ease, box-shadow 500ms ease",
                  backfaceVisibility: "hidden",
                }}
              >
                <CmsImage
                  src={item.image}
                  alt={item.alt || item.title}
                  fill
                  sizes="(max-width: 639px) 56vw, (max-width: 1023px) 280px, 320px"
                  className="object-cover"
                  fadeIn={false}
                  priority={index === 0}
                />
                <div className="pointer-events-none absolute inset-0" style={{
                  background: "linear-gradient(110deg,rgba(249,186,91,0.25),rgba(236,173,67,0.04) 34%,transparent 56%,rgba(4,3,3,0.48)),linear-gradient(to top,rgba(6,5,4,0.8),transparent 42%)",
                }}/>
                <div className="absolute start-3 top-3 rounded-full border px-2.5 py-1 text-[10px] font-semibold tracking-[0.1em]" style={{
                  background: "rgba(8,7,6,0.67)", color: CREAM, borderColor: "rgba(244,222,178,0.4)",
                }}>
                  {String(index + 1).padStart(2, "0")}
                </div>
                <div className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-7" style={{ background: "linear-gradient(to top,rgba(5,4,3,0.73),transparent)" }}>
                  <span className="block text-[12px] leading-[1.5] sm:text-sm" style={{ color: CREAM, fontFamily: titleFont, overflowWrap: "anywhere" }}>
                    {item.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mx-auto mt-1 flex w-full max-w-[1100px] flex-col items-center gap-2 lg:mt-0">
          <div className="flex w-full items-start justify-between gap-3 sm:items-center">
            <div className="min-w-0" dir={isArabic ? "rtl" : "ltr"}>
              <p className="inline-flex items-center gap-2 text-[10px] font-semibold tracking-[0.15em]" style={{ color: GOLD, fontFamily: bodyFont }}>
                <Sparkles size={14} aria-hidden="true" />{t("feature")}
                <span className="ms-2 tabular-nums" style={{ color: "rgba(249,240,223,0.45)" }}>
                  {String(currentIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
                </span>
              </p>
              <motion.div
                key={active.id}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduceMotion ? 0 : 0.25 }}
                aria-live="polite"
                aria-atomic="true"
              >
                <h3 className="mt-1 text-[clamp(1.2rem,2.1vw,1.85rem)] leading-[1.3]" style={{
                  color: CREAM, fontFamily: titleFont, fontWeight: isArabic ? 600 : 400, overflowWrap: "anywhere",
                }}>{active.title}</h3>
                {detail && <p className="mt-1 max-w-[680px] text-[12px] leading-[1.75] sm:text-[13px]" style={{
                  color: "rgba(249,240,223,0.69)", fontFamily: bodyFont, overflowWrap: "anywhere",
                }}>{visibleDetail}</p>}
                {canExpand && <button type="button" onClick={() => setExpanded((value) => !value)} className="mt-1 text-[12px] underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EBCB8C]" style={{ color: "#E6C786", fontFamily: bodyFont }}>
                  {expanded ? t("readLess") : t("readMore")}
                </button>}
              </motion.div>
            </div>
            {count > 1 && (
              <div className="hidden shrink-0 gap-2 sm:flex" role="group" aria-label={t("navigationAria")}>
                <button type="button" aria-label={t("previousAria")} onClick={() => navigate(-1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-[#D5AC62] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EBCB8C]">
                  <PrevIcon size={20} aria-hidden="true" />
                </button>
                <button type="button" aria-label={t("nextAria")} onClick={() => navigate(1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-[#D5AC62] hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EBCB8C]">
                  <NextIcon size={20} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>

          <div className="mt-1 flex w-full flex-wrap items-center justify-between gap-2 border-t pt-3" style={{ borderColor: "rgba(213,172,98,0.2)" }}>
            <div className="flex min-w-0 items-center gap-3">
              <Link href={active.href || "/experiences"} aria-label={t("cardAria",{title:active.title})}
                className="inline-flex min-h-[40px] items-center gap-2 rounded-full border px-4 text-[12px] font-semibold transition-colors hover:bg-[#D5AC62]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EBCB8C]" style={{
                borderColor: "rgba(213,172,98,0.5)", color: "#F2DBA8", fontFamily: bodyFont,
              }}>{t("discover")} <DirectionArrow size={14} aria-hidden="true"/></Link>
              <Link href="/experiences" className="hidden text-[12px] hover:text-[#F3D69B] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EBCB8C] md:inline" style={{
                color: "rgba(247,226,186,0.65)", fontFamily: bodyFont,
              }}>{t("exploreAll")}</Link>
            </div>
            {count > 1 && (
              <div className="flex items-center gap-1" role="group" aria-label={t("pickMomentAria")}>
                <button type="button" onClick={() => navigate(-1)} aria-label={t("previousAria")}
                  className="flex h-10 w-9 items-center justify-center rounded-full text-white sm:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EBCB8C]">
                  <PrevIcon size={18} aria-hidden="true"/>
                </button>
                {items.map((item,index) => (
                  <button key={item.id} type="button" onClick={() => select(index)}
                    aria-label={t("showMomentAria",{title:item.title})}
                    aria-pressed={index === currentIndex}
                    className="flex h-10 w-7 items-center justify-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EBCB8C]">
                    <span className="block h-[5px] rounded-full transition-all" style={{
                      width: index === currentIndex ? 20 : 6,
                      background: index === currentIndex ? GOLD : "rgba(249,240,223,0.3)",
                    }}/>
                  </button>
                ))}
                <button type="button" onClick={() => navigate(1)} aria-label={t("nextAria")}
                  className="flex h-10 w-9 items-center justify-center rounded-full text-white sm:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EBCB8C]">
                  <NextIcon size={18} aria-hidden="true"/>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
