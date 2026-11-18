"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent, type TouchEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CmsImage } from "@/components/media/CmsImage";
import { NEUTRAL_MEDIA_FALLBACK, type CatalogMediaCard } from "@/lib/media";
import { canAutoAdvanceMoments, getMomentDeckPose, momentDeckXShift, selectSignatureMomentCards, signedCarouselDistance, tokenizeMomentDescription } from "./signatureMomentsLayout";

interface SignatureMomentsProps {
  moments?: CatalogMediaCard[];
}

const GOLD = "#D5AC62";
const CREAM = "#F9F0DF";
const AUTO_ADVANCE_MS = 5800;

/**
 * Portrait 3D coverflow, inspired by the user's reference: one dominant front
 * card, smaller tilted side cards receding in Z, and directional golden light.
 * Do not block vertical page scrolling; horizontal swipes navigate on touch.
 * Auto-play runs only in view and ends permanently after any manual slide.
 */
export function SignatureMoments({ moments = [] }: SignatureMomentsProps) {
  const t = useTranslations("home.signatureMoments");
  const locale = useLocale();
  const isArabic = locale === "ar";
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const mouseStart = useRef<{ x: number; y: number } | null>(null);
  const suppressCardClick = useRef(false);
  const stageSectionRef = useRef<HTMLElement | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);

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
  const detail = active.subtitle?.trim() || "";
  const detailTokens = tokenizeMomentDescription(detail);

  useEffect(() => {
    setActiveIndex((index) => index < count ? index : 0);
  }, [count]);

  // Every direct interaction opts out of autoplay until this page is reloaded.
  const stopAutoAdvance = useCallback(() => setUserInteracted(true), []);

  const select = useCallback((index: number) => {
    if (index < 0 || index >= count) return;
    stopAutoAdvance();
    setActiveIndex(index);
  }, [count, stopAutoAdvance]);

  const navigate = useCallback((direction: -1 | 1) => {
    if (count < 2) return;
    stopAutoAdvance();
    setActiveIndex((index) => (index + direction + count) % count);
  }, [count, stopAutoAdvance]);

  useEffect(() => {
    const section = stageSectionRef.current;
    if (!section || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => setIsInView(Boolean(entries[0]?.isIntersecting)),
      { threshold: 0.35 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!canAutoAdvanceMoments({ count, isInView, userInteracted, isHovered, hasFocusWithin, reducedMotion: reduceMotion !== false })) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setActiveIndex((index) => (index + 1) % count);
      }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(timer);
  }, [count, isInView, userInteracted, isHovered, hasFocusWithin, reduceMotion]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    suppressCardClick.current = false;
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
      suppressCardClick.current = true;
      navigate((dx * (isArabic ? -1 : 1) < 0 ? 1 : -1));
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    mouseStart.current = { x: event.clientX, y: event.clientY };
    suppressCardClick.current = false;
  };
  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = mouseStart.current;
    mouseStart.current = null;
    if (event.pointerType !== "mouse" || !start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      suppressCardClick.current = true;
      navigate((dx * (isArabic ? -1 : 1) < 0 ? 1 : -1));
    }
  };

  return (
    <section
      ref={stageSectionRef}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setIsHovered(true); }}
      onPointerLeave={(event) => { if (event.pointerType === "mouse") setIsHovered(false); }}
      onFocusCapture={() => setHasFocusWithin(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHasFocusWithin(false); }}
      className="signature-moments-section lux-section-compact relative isolate overflow-hidden"
      aria-labelledby="signature-moments-heading"
      style={{ background: "var(--lux-surface)", paddingBlock: "clamp(18px, 2.5vh, 30px)" }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{
        background: "radial-gradient(ellipse 45% 60% at 18% 54%, rgba(187,119,47,0.13),transparent 72%)",
      }} />
      <div className="lux-container relative z-10">
        <header className="relative z-20 mx-auto max-w-[760px] text-center">
          <h2
            id="signature-moments-heading"
            className="lux-heading-lg"
            style={{
              fontSize: isArabic ? "clamp(1.8rem,3.2vw,2.6rem)" : "clamp(2.15rem,3.5vw,3rem)",
              lineHeight: 1.2,
            }}
          >
            {t("title")}
          </h2>
        </header>

        <div
          className="signature-moments-stage relative z-0 mt-5 w-full cursor-grab select-none sm:mt-6 active:cursor-grabbing"
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
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => { mouseStart.current = null; }}
          onDragStart={(event) => event.preventDefault()}
        >
          <div className="signature-moments-aura pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true" />
          <div className="signature-moments-ground pointer-events-none absolute bottom-[1%] left-1/2" aria-hidden="true" />

          {items.map((item, index) => {
            const offset = signedCarouselDistance(index, currentIndex, count);
            const visualOffset = offset * (isArabic ? -1 : 1);
            const pose = getMomentDeckPose(visualOffset);
            const selected = offset === 0;
            const distance = Math.abs(offset);
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
                onClick={() => {
                  if (suppressCardClick.current) {
                    suppressCardClick.current = false;
                    return;
                  }
                  select(index);
                }}
                aria-label={t("showMomentAria", { title: item.title })}
                aria-pressed={selected}
                tabIndex={selected ? 0 : -1}
                data-distance={distance}
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
                  draggable={false}
                  priority={index === 0}
                />
                <div className="pointer-events-none absolute inset-0" style={{
                  background: "linear-gradient(110deg,rgba(249,186,91,0.25),rgba(236,173,67,0.04) 34%,transparent 56%,rgba(4,3,3,0.48)),linear-gradient(to top,rgba(6,5,4,0.8),transparent 42%)",
                }}/>
                <div
                  className="absolute inset-x-0 bottom-0 px-4 pb-5 pt-10 sm:px-5"
                  style={{ background: "linear-gradient(to top,rgba(5,4,3,0.94),rgba(6,4,3,0.6) 62%,transparent)" }}
                >
                  <span
                    className="line-clamp-2 block text-[13px] font-semibold leading-[1.48] tracking-[0.01em] sm:text-[15px]"
                    style={{ color: CREAM, fontFamily: titleFont, overflowWrap: "anywhere", textShadow: "0 1px 12px rgba(0,0,0,0.75)" }}
                  >
                    {item.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>


        <div className="relative mx-auto mt-2 flex w-full max-w-[900px] flex-col items-center gap-3 text-center" dir={isArabic ? "rtl" : "ltr"}>
          <div
            className="signature-moments-copy-panel relative w-full overflow-hidden rounded-[18px] border px-5 py-4 sm:px-8 sm:py-5"
            style={{
              borderColor: "rgba(213,172,98,0.26)",
              background: "linear-gradient(125deg,rgba(40,31,21,0.88),rgba(17,15,13,0.86))",
              boxShadow: "inset 0 1px 0 rgba(255,237,194,0.06),0 14px 35px rgba(0,0,0,0.22)",
            }}
          >
            <span aria-hidden="true" className="pointer-events-none absolute inset-x-[28%] top-0 h-px"
              style={{ background: "linear-gradient(90deg,transparent,#D5AC62,transparent)" }} />
            <div className="relative" aria-live={userInteracted ? "polite" : "off"} aria-atomic="true">
              {detail && (
                <p
                  key={active.id}
                  className="mx-auto max-w-[820px] text-[13px] leading-[1.95] sm:text-[14px] md:text-[15px]"
                  dir={isArabic ? "rtl" : "ltr"}
                  aria-label={detail}
                  style={{
                    color: "rgba(249,240,223,0.85)",
                    fontFamily: bodyFont,
                    overflowWrap: "anywhere",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {detailTokens.map((token, index) => token.isWord ? (
                    <span
                      key={index}
                      aria-hidden="true"
                      className={`signature-moments-typing-word ${isArabic ? "signature-moments-typing-rtl" : "signature-moments-typing-ltr"} ${token.highlight ? "font-bold" : ""}`}
                      style={{
                        color: token.highlight ? "#EBCB8E" : undefined,
                        animationDelay: `${Math.min(token.wordIndex - 1, 30) * 42}ms`,
                      }}
                    >
                      {token.text}
                    </span>
                  ) : token.text)}
                </p>
              )}
            </div>
          </div>
          <div className="flex w-full flex-wrap items-center justify-center gap-x-7 gap-y-3">
            <Link
              href={active.href || "/experiences"}
              aria-label={t("cardAria", { title: active.title })}
              className="group inline-flex min-h-[44px] items-center justify-center gap-3 rounded-full px-6 text-[13px] font-semibold shadow-[0_10px_28px_rgba(169,115,43,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(169,115,43,0.28)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#EBCB8C]"
              style={{ color: "#20160A", background: "linear-gradient(120deg,#F1D59D 0%,#C9A05A 100%)", fontFamily: bodyFont }}
            >
              {t("discover")}
              <DirectionArrow size={16} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
            </Link>
            <Link
              href="/experiences"
              className="inline-flex min-h-[44px] items-center gap-2 border-b border-transparent text-[13px] font-medium transition-colors hover:border-[#C9A05A]/60 hover:text-[#F1D59D] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#EBCB8C]"
              style={{ color: "rgba(246,229,194,0.7)", fontFamily: bodyFont }}
            >
              {t("exploreAll")}
              <DirectionArrow size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
