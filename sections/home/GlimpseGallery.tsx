"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CmsImage } from "@/components/media/CmsImage";
import {
  NEUTRAL_MEDIA_FALLBACK,
  type CatalogMediaCard,
} from "@/lib/media";

const LAYOUT_SIZES = [
  "tall",
  "wide",
  "hero",
  "wide",
  "tall",
  "square",
  "wide",
] as const;

const GAP_PX = 20;
const AUTO_SPEED_PX_PER_SEC = 34;
const MOBILE_AUTO_SPEED_PX_PER_SEC = 54;
const DRAG_THRESHOLD_PX = 8;
const INERTIA_FRICTION = 0.94;
const INERTIA_MIN_VELOCITY = 0.18;
const MOBILE_BREAKPOINT = 768;

interface GlimpseGalleryProps {
  items?: CatalogMediaCard[];
}

function wrapOffset(offset: number, loopWidth: number) {
  if (loopWidth <= 0) return 0;
  let next = offset % loopWidth;
  if (next > 0) next -= loopWidth;
  return next;
}

function getCardDimensions(size: string, isMobile: boolean) {
  if (isMobile) {
    switch (size) {
      case "hero":
        return { width: "250px", height: "320px" };
      case "tall":
        return { width: "180px", height: "280px" };
      case "wide":
        return { width: "240px", height: "180px" };
      case "square":
        return { width: "200px", height: "200px" };
      default:
        return { width: "200px", height: "250px" };
    }
  }

  switch (size) {
    case "hero":
      return { width: "420px", height: "520px" };
    case "tall":
      return { width: "280px", height: "420px" };
    case "wide":
      return { width: "380px", height: "280px" };
    case "square":
      return { width: "320px", height: "320px" };
    default:
      return { width: "300px", height: "380px" };
  }
}

function getBorderRadius(size: string) {
  return size === "tall" ? "180px 180px 8px 8px" : "8px";
}

function GlimpseCard({
  item,
  size,
  isMobile,
}: {
  item: CatalogMediaCard;
  size: (typeof LAYOUT_SIZES)[number];
  isMobile: boolean;
}) {
  const dims = getCardDimensions(size, isMobile);
  const borderRadius = getBorderRadius(size);
  const alt = item.alt || item.title;

  return (
    <div
      className="relative flex-shrink-0 group"
      style={{ width: dims.width, height: dims.height }}
    >
      <div
        className="relative w-full h-full overflow-hidden"
        style={{
          borderRadius,
          border: "1px solid rgba(212, 175, 55, 0.3)",
          boxShadow:
            size === "hero"
              ? "0 8px 40px rgba(0,0,0,0.4)"
              : "0 4px 20px rgba(0,0,0,0.2)",
        }}
      >
        <CmsImage
          src={item.image}
          alt={alt}
          fill
          sizes={dims.width}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 pointer-events-none"
          draggable={false}
        />

        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)",
            opacity: 0.6,
          }}
        />

        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            boxShadow:
              "inset 0 0 0 2px rgba(212,175,55,0.5), 0 0 30px rgba(212,175,55,0.2)",
            borderRadius,
          }}
        />

        <div
          className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
          }}
        >
          <p
            className="text-white font-medium tracking-wide"
            style={{
              fontFamily: "var(--font-display, serif)",
              fontSize: isMobile ? "0.8rem" : undefined,
            }}
          >
            {alt}
          </p>
        </div>
      </div>
    </div>
  );
}

function GallerySet({
  items,
  hidden,
  loopRef,
  isMobile,
}: {
  items: CatalogMediaCard[];
  hidden?: boolean;
  loopRef?: React.Ref<HTMLDivElement>;
  isMobile: boolean;
}) {
  return (
    <div
      ref={loopRef}
      className="flex flex-shrink-0 items-center"
      style={{ gap: GAP_PX }}
      aria-hidden={hidden || undefined}
    >
      {items.map((item, index) => (
        <GlimpseCard
          key={`${item.id}-${index}`}
          item={item}
          size={LAYOUT_SIZES[index % LAYOUT_SIZES.length]}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}

export function GlimpseGallery({ items = [] }: GlimpseGalleryProps) {
  const prefersReduced = useReducedMotion();
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const loopRef = useRef<HTMLDivElement>(null);

  const offsetRef = useRef(0);
  const loopWidthRef = useRef(0);
  const draggingRef = useRef(false);
  const pointerActiveRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const startOffsetRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const inViewRef = useRef(true);
  const pageVisibleRef = useRef(true);
  const rafRef = useRef<number>(0);

  const [isDragging, setIsDragging] = useState(false);
  const [copyCount, setCopyCount] = useState(2);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  const galleryItems = useMemo(
    () =>
      items.length > 0
        ? items
        : [
            {
              id: "neutral",
              title: "Zalina Arabian Village",
              image: NEUTRAL_MEDIA_FALLBACK,
              alt: "Zalina Arabian Village",
            },
          ],
    [items]
  );

  const applyTransform = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
  }, []);

  const measure = useCallback(() => {
    const loop = loopRef.current;
    const viewport = viewportRef.current;
    if (!loop || !viewport) return;

    const setWidth = loop.offsetWidth;
    loopWidthRef.current = setWidth + GAP_PX;

    if (setWidth > 0) {
      const needed = Math.max(
        2,
        Math.ceil((viewport.clientWidth * 2) / setWidth) + 1
      );
      setCopyCount((current) => (current === needed ? current : needed));
    }

    offsetRef.current = wrapOffset(offsetRef.current, loopWidthRef.current);
    applyTransform();
  }, [applyTransform]);

  useEffect(() => {
    if (isMobile) return;
    measure();
    const viewport = viewportRef.current;
    const loop = loopRef.current;
    if (!viewport || !loop || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(viewport);
    observer.observe(loop);
    return () => observer.disconnect();
  }, [measure, items, copyCount, isMobile]);

  useEffect(() => {
    if (isMobile) return;
    const viewport = viewportRef.current;
    if (!viewport || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        inViewRef.current = Boolean(entry?.isIntersecting);
      },
      { threshold: 0.12 }
    );
    observer.observe(viewport);
    return () => observer.disconnect();
  }, [isMobile]);

  useEffect(() => {
    const onVisibility = () => {
      pageVisibleRef.current = document.visibilityState === "visible";
    };
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  useEffect(() => {
    if (prefersReduced || isMobile) return;

    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - last, 48);
      last = now;

      if (
        !draggingRef.current &&
        inViewRef.current &&
        pageVisibleRef.current &&
        loopWidthRef.current > 0
      ) {
        if (Math.abs(velocityRef.current) > INERTIA_MIN_VELOCITY) {
          offsetRef.current += velocityRef.current * dt;
          velocityRef.current *= Math.pow(INERTIA_FRICTION, dt / 16.67);
          if (Math.abs(velocityRef.current) <= INERTIA_MIN_VELOCITY) {
            velocityRef.current = 0;
          }
        } else {
          offsetRef.current -=
            (isMobile ? MOBILE_AUTO_SPEED_PX_PER_SEC : AUTO_SPEED_PX_PER_SEC) *
            (dt / 1000);
        }

        offsetRef.current = wrapOffset(
          offsetRef.current,
          loopWidthRef.current
        );
        applyTransform();
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [applyTransform, prefersReduced, isMobile]);

  const endPointer = useCallback(
    (pointerId?: number) => {
      const viewport = viewportRef.current;
      if (viewport && pointerId != null) {
        try {
          viewport.releasePointerCapture(pointerId);
        } catch {
          /* already released */
        }
      }

      pointerActiveRef.current = false;
      draggingRef.current = false;
      setIsDragging(false);
    },
    []
  );

  const onPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) return;

      pointerActiveRef.current = true;
      draggingRef.current = false;
      startXRef.current = event.clientX;
      startYRef.current = event.clientY;
      startOffsetRef.current = offsetRef.current;
      lastXRef.current = event.clientX;
      lastTimeRef.current = performance.now();
      velocityRef.current = 0;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    []
  );

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!pointerActiveRef.current) return;

      const dx = event.clientX - startXRef.current;
      const dy = event.clientY - startYRef.current;

      if (!draggingRef.current) {
        if (Math.abs(dx) < DRAG_THRESHOLD_PX && Math.abs(dy) < DRAG_THRESHOLD_PX) {
          return;
        }
        if (Math.abs(dy) > Math.abs(dx)) {
          endPointer(event.pointerId);
          return;
        }
        draggingRef.current = true;
        setIsDragging(true);
        velocityRef.current = 0;
      }

      event.preventDefault();

      const now = performance.now();
      const elapsed = now - lastTimeRef.current;
      if (elapsed > 0) {
        velocityRef.current = (event.clientX - lastXRef.current) / elapsed;
      }
      lastXRef.current = event.clientX;
      lastTimeRef.current = now;

      offsetRef.current = wrapOffset(
        startOffsetRef.current + dx,
        loopWidthRef.current
      );
      applyTransform();
    },
    [applyTransform, endPointer]
  );

  const onPointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      endPointer(event.pointerId);
    },
    [endPointer]
  );

  const extraCopies = Math.max(0, copyCount - 1);

  return (
    <section
      className="relative overflow-hidden py-16"
      style={{ background: "var(--lux-surface)" }}
      aria-labelledby="glimpse-gallery-title"
    >
      <div className="lux-container mb-10">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lux-eyebrow mb-3"
            style={{ color: "var(--lux-gold)" }}
          >
            VISUAL JOURNEY
          </motion.p>
          <motion.h2
            id="glimpse-gallery-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lux-heading-lg mb-4"
            style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}
          >
            A Glimpse Into Zalina
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lux-body max-w-2xl mx-auto"
            style={{ fontSize: "0.95rem", opacity: 0.8 }}
          >
            Discover the atmosphere, architecture, and unforgettable moments that
            define the Zalina experience.
          </motion.p>
        </div>
      </div>

      <div className="relative">
        <div
          className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{
            width: isMobile ? "44px" : "120px",
            background:
              "linear-gradient(to right, var(--lux-surface) 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{
            width: isMobile ? "44px" : "120px",
            background:
              "linear-gradient(to left, var(--lux-surface) 0%, transparent 100%)",
          }}
        />

        <div
          ref={viewportRef}
          className={`relative overflow-hidden select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            touchAction: prefersReduced ? "pan-x" : "pan-y",
          }}
          onPointerDown={prefersReduced ? undefined : onPointerDown}
          onPointerMove={prefersReduced ? undefined : onPointerMove}
          onPointerUp={prefersReduced ? undefined : onPointerUp}
          onPointerCancel={prefersReduced ? undefined : onPointerUp}
          onDragStart={(event) => event.preventDefault()}
          role="region"
          aria-roledescription="gallery"
          aria-label="A glimpse into Zalina"
        >
          {prefersReduced ? (
            <div
              className="flex items-center overflow-x-auto scrollbar-hide"
              style={{ gap: GAP_PX }}
            >
              <GallerySet items={galleryItems} isMobile={isMobile} />
            </div>
          ) : (
            <div
              ref={trackRef}
              className="flex w-max items-center will-change-transform"
              style={{ gap: GAP_PX }}
            >
              <GallerySet
                items={galleryItems}
                loopRef={loopRef}
                isMobile={isMobile}
              />
              {Array.from({ length: extraCopies }, (_, copyIndex) => (
                <GallerySet
                  key={`copy-${copyIndex}`}
                  items={galleryItems}
                  hidden
                  isMobile={isMobile}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default GlimpseGallery;
