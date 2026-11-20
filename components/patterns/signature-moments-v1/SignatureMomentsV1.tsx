"use client";

import * as React from "react";
import { useCallback, useEffect, useId, useRef, useState, type PointerEvent, type TouchEvent } from "react";
import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { CmsImage } from "@/components/media/CmsImage";
import { type CatalogMediaCard } from "@/lib/media";
import "./signature-moments-v1.css";
import { canAutoAdvanceMoments, getMomentDeckPose, momentDeckXShift, selectSignatureMomentCards, signedCarouselDistance, tokenizeMomentDescription } from "./signatureMomentsLayout";

export interface SignatureMomentsV1Props {
  cards: CatalogMediaCard[];
  fallback: CatalogMediaCard;
  locale: "ar" | "en";
  labels: {
    title: string;
    carouselAria: string;
    navigateHint: string;
    discover: string;
    cardAria: (title: string) => string;
    showMomentAria: (title: string) => string;
  };
  defaultHref: string;
}

const CREAM = "#F9F0DF";
const AUTO_ADVANCE_MS = 3500;

/** Preserved portrait coverflow; content and translations are supplied by the caller. */
export function SignatureMomentsV1({ cards, fallback, locale, labels, defaultHref }: SignatureMomentsV1Props) {
  const isArabic = locale === "ar";
  const headingId = useId();
  const hintId = useId();
  const reduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const mouseStart = useRef<{ x: number; y: number } | null>(null);
  // Only suppress the immediate synthetic pointer click following a swipe, never a keyboard activation.
  const suppressPointerClickUntil = useRef(0);
  const carouselStageRef = useRef<HTMLDivElement | null>(null);
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

  const items = selectSignatureMomentCards(cards, fallback);
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
    // Watching the stage (not the whole section) works even with very long CMS descriptions.
    const stage = carouselStageRef.current;
    if (!stage || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => setIsInView(Boolean(entries[0]?.isIntersecting)),
      { threshold: 0.45 }
    );
    observer.observe(stage);
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
    suppressPointerClickUntil.current = 0;
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
      suppressPointerClickUntil.current = Date.now() + 550;
      navigate((dx * (isArabic ? -1 : 1) < 0 ? 1 : -1));
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    mouseStart.current = { x: event.clientX, y: event.clientY };
    suppressPointerClickUntil.current = 0;
  };
  // Window-level pointer release covers dragging beyond the carousel bounds.
  // Unlike capture on pointer-down, this preserves normal clicks on side cards.
  useEffect(() => {
    const onRelease = (event: globalThis.PointerEvent) => {
      const start = mouseStart.current;
      mouseStart.current = null;
      if (!start || event.pointerType !== "mouse") return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4) {
        suppressPointerClickUntil.current = Date.now() + 550;
        navigate((dx * (isArabic ? -1 : 1) < 0 ? 1 : -1));
      }
    };
    const cancel = () => { mouseStart.current = null; };
    window.addEventListener("pointerup", onRelease);
    window.addEventListener("pointercancel", cancel);
    return () => {
      window.removeEventListener("pointerup", onRelease);
      window.removeEventListener("pointercancel", cancel);
    };
  }, [navigate, isArabic]);

  return (
    <section
      dir={isArabic ? "rtl" : "ltr"}
      onPointerEnter={(event) => { if (event.pointerType === "mouse") setIsHovered(true); }}
      onPointerLeave={(event) => { if (event.pointerType === "mouse") setIsHovered(false); }}
      onFocusCapture={() => setHasFocusWithin(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setHasFocusWithin(false); }}
      className="signature-moments-v1-section lux-section-compact relative isolate overflow-hidden"
      aria-labelledby={headingId}
      style={{ background: "var(--lux-surface)", paddingBlock: "clamp(12px, 1.6vh, 20px)" }}
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden="true" style={{
        background: "radial-gradient(ellipse 45% 60% at 18% 54%, rgba(187,119,47,0.13),transparent 72%)",
      }} />
      <div className="lux-container relative z-10">
        <header className="relative z-20 mx-auto max-w-[760px] text-center">
          <h2
            id={headingId}
            className="lux-heading-lg"
            style={{
              fontSize: isArabic ? "clamp(1.8rem,3.2vw,2.6rem)" : "clamp(2.15rem,3.5vw,3rem)",
              lineHeight: 1.2,
            }}
          >
            {labels.title}
          </h2>
        </header>

        <div
          ref={carouselStageRef}
          className="signature-moments-v1-stage group relative z-0 mt-5 w-full cursor-grab select-none sm:mt-6 active:cursor-grabbing"
          style={{ perspective: "1250px", transformStyle: "preserve-3d" }}
          role="region"
          aria-roledescription="carousel"
          aria-label={labels.carouselAria}
          aria-describedby={hintId}
          tabIndex={count > 1 ? 0 : undefined}
          onKeyDown={(event) => {
            if (count < 2) return;
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              event.currentTarget.focus();
              navigate(isArabic ? 1 : -1);
            } else if (event.key === "ArrowRight") {
              event.preventDefault();
              event.currentTarget.focus();
              navigate(isArabic ? -1 : 1);
            }
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onPointerDown={handlePointerDown}
          onDragStart={(event) => event.preventDefault()}
        >
          <span
            id={hintId}
            className="pointer-events-none absolute bottom-0 left-1/2 z-[40] -translate-x-1/2 whitespace-nowrap rounded-full border border-[#D5AC62]/30 bg-black/75 px-3 py-1.5 text-[11px] text-[#F3DCAD] opacity-0 transition-opacity group-focus-within:opacity-100"
          >
            {labels.navigateHint}
          </span>
          <div className="signature-moments-v1-aura pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true" />
          <div className="signature-moments-v1-ground pointer-events-none absolute bottom-[1%] left-1/2" aria-hidden="true" />

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
              <div
                key={item.id}
                role="group"
                aria-roledescription="slide"
                aria-label={item.title}
                aria-hidden={!pose.visible}
                data-distance={distance}
                className="signature-moments-v1-card absolute left-1/2 top-1/2 block overflow-hidden rounded-[19px] border bg-[#100D0A] p-0 text-start"
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
                  sizes="(max-width: 767px) 56vw, (max-width: 1199px) 340px, 400px"
                  className="object-cover"
                  fadeIn={false}
                  draggable={false}
                  priority={index === 0}
                />
                <div className="pointer-events-none absolute inset-0" style={{
                  background: "linear-gradient(110deg,rgba(249,186,91,0.25),rgba(236,173,67,0.04) 34%,transparent 56%,rgba(4,3,3,0.48)),linear-gradient(to top,rgba(6,5,4,0.8),transparent 42%)",
                }}/>
                <div
                  className="absolute inset-x-0 bottom-0 z-10 px-4 pb-4 pt-14 sm:px-5 sm:pb-5"
                  style={{ background: "linear-gradient(to top,rgba(5,4,3,0.96),rgba(6,4,3,0.74) 52%,transparent)" }}
                >
                  <span
                    className="line-clamp-2 block text-[13px] font-semibold leading-[1.48] tracking-[0.01em] sm:text-[15px]"
                    style={{ color: CREAM, fontFamily: titleFont, overflowWrap: "anywhere", textShadow: "0 1px 12px rgba(0,0,0,0.75)" }}
                  >
                    {item.title}
                  </span>
                  {selected && (
                    <Link
                      href={item.href || defaultHref}
                      aria-label={labels.cardAria(item.title)}
                      onClick={(event) => {
                        const blocked = event.detail > 0 && Date.now() < suppressPointerClickUntil.current;
                        suppressPointerClickUntil.current = 0;
                        if (blocked) event.preventDefault();
                      }}
                      className="group mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2.5 rounded-xl border border-[#F2DCB4]/45 bg-white/[0.13] px-3 py-2 text-[12px] font-semibold text-[#FFF5E4] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_8px_24px_rgba(0,0,0,0.3)] backdrop-blur-[14px] transition-all duration-300 hover:border-[#F4D499]/80 hover:bg-[#E5BE79]/25 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_8px_30px_rgba(0,0,0,0.3)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F1D399]"
                    >
                      <span>{labels.discover}</span>
                      <DirectionArrow size={15} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"/>
                    </Link>
                  )}
                </div>
                {!selected && pose.visible && (
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-label={labels.showMomentAria(item.title)}
                    onClick={(event) => {
                      const blocked = event.detail > 0 && Date.now() < suppressPointerClickUntil.current;
                      suppressPointerClickUntil.current = 0;
                      if (!blocked) select(index);
                    }}
                    className="absolute inset-0 z-20 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#F1D399]"
                    style={{ background: "transparent" }}
                  />
                )}
              </div>
            );
          })}
        </div>


        <div className="relative mx-auto mt-2 flex w-full max-w-[900px] flex-col items-center gap-3 text-center" dir={isArabic ? "rtl" : "ltr"}>
          <div
            className="signature-moments-v1-copy-panel relative w-full overflow-hidden rounded-[18px] border px-5 py-4 sm:px-8 sm:py-5"
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
                      className={`signature-moments-v1-typing-word ${isArabic ? "signature-moments-v1-typing-rtl" : "signature-moments-v1-typing-ltr"} ${token.highlight ? "font-bold" : ""}`}
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

        </div>
      </div>
    </section>
  );
}
