"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type TouchEvent as ReactTouchEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Heart,
  HandHeart,
} from "lucide-react";
import {
  filterGalleryItems,
  galleryItemAlt,
  galleryItemTitle,
  getSafeGalleryFilterId,
  selectDisplayUrl,
  type GalleryFilterId,
  type GalleryItem,
} from "@/lib/media";
import { NEUTRAL_MEDIA_FALLBACK } from "@/lib/media";
import {
  GALLERY_FILTER_OPTIONS,
  GALLERY_I18N_KEYS,
  GALLERY_REASONS,
} from "./gallery.data";

const sectionTitleStyle = { fontSize: "clamp(1.75rem, 4vw, 2.5rem)" };

const gallerySpans = {
  wide: "md:col-span-2 md:row-span-1",
  portrait: "md:col-span-1 md:row-span-2",
  square: "md:col-span-1 md:row-span-1",
  tall: "md:col-span-1 md:row-span-3",
} as const;

const CATEGORY_LABEL: Record<Exclude<GalleryFilterId, "all">, string> = {
  experiences: "Experiences",
  zones: "Zones",
  bubbles: "Bubble Stays",
};

interface GalleryPageContentProps {
  items: GalleryItem[];
  availableFilters: GalleryFilterId[];
}

export function GalleryPageContent({
  items,
  availableFilters,
}: GalleryPageContentProps) {
  const prefersReduced = useReducedMotion();
  const initialFilter: GalleryFilterId =
    availableFilters.includes("all")
      ? "all"
      : availableFilters[0] ?? "all";
  const [selectedCategory, setSelectedCategory] =
    useState<GalleryFilterId>(initialFilter);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const lightboxCloseButtonRef = useRef<HTMLButtonElement | null>(null);
  const lastFocusedElementRef = useRef<HTMLElement | null>(null);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    const updateMobile = () => setIsMobile(window.innerWidth < 768);
    updateMobile();
    window.addEventListener("resize", updateMobile, { passive: true });
    return () => window.removeEventListener("resize", updateMobile);
  }, []);

  const filters = useMemo(
    () =>
      GALLERY_FILTER_OPTIONS.filter((option) =>
        availableFilters.includes(option.id)
      ),
    [availableFilters]
  );

  const visibleItems = useMemo(
    () => filterGalleryItems(items, selectedCategory),
    [items, selectedCategory]
  );

  const selectedLightboxItem = selectedKey
    ? visibleItems.find((item) => item.key === selectedKey) ?? null
    : null;

  const galleryLayoutClass =
    visibleItems.length === 1
      ? "mx-auto max-w-[560px] grid-cols-1 auto-rows-[320px]"
      : visibleItems.length === 2
        ? "mx-auto max-w-4xl grid-cols-1 auto-rows-[280px] gap-4 sm:grid-cols-2 sm:auto-rows-[300px]"
        : "grid-cols-1 auto-rows-[260px] gap-4 sm:grid-cols-2 sm:auto-rows-[180px] lg:grid-cols-4 lg:auto-rows-[150px]";

  const galleryItemSpan =
    visibleItems.length <= 2 ? "md:col-span-1 md:row-span-1" : undefined;

  useEffect(() => {
    if (!selectedKey) return;
    if (!selectedLightboxItem) {
      setSelectedKey(null);
      return;
    }
    const focusFrame = window.requestAnimationFrame(() => {
      lightboxCloseButtonRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(focusFrame);
  }, [selectedLightboxItem, selectedKey]);

  useEffect(() => {
    if (!selectedLightboxItem) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      const index = visibleItems.findIndex(
        (item) => item.key === selectedLightboxItem.key
      );
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowRight" && visibleItems.length > 1) {
        setSelectedKey(visibleItems[(index + 1) % visibleItems.length].key);
      }
      if (event.key === "ArrowLeft" && visibleItems.length > 1) {
        setSelectedKey(
          visibleItems[
            (index - 1 + visibleItems.length) % visibleItems.length
          ].key
        );
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedLightboxItem, visibleItems]);

  const closeLightbox = () => {
    setSelectedKey(null);
    requestAnimationFrame(() => lastFocusedElementRef.current?.focus());
  };

  const openLightbox = (key: string, element: HTMLButtonElement) => {
    lastFocusedElementRef.current = element;
    setSelectedKey(key);
  };

  const chooseCategory = (category: string) => {
    setSelectedCategory(getSafeGalleryFilterId(category));
    setSelectedKey(null);
  };

  const navigateLightbox = (direction: 1 | -1) => {
    if (!selectedLightboxItem || visibleItems.length < 2) return;
    const index = visibleItems.findIndex(
      (item) => item.key === selectedLightboxItem.key
    );
    setSelectedKey(
      visibleItems[
        (index + direction + visibleItems.length) % visibleItems.length
      ].key
    );
  };

  const onTouchStart = (event: ReactTouchEvent) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const onTouchEnd = (event: ReactTouchEvent) => {
    if (touchStartX.current == null) return;
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current;
    const delta = endX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 48) return;
    navigateLightbox(delta < 0 ? 1 : -1);
  };

  return (
    <main className="zones-page min-h-screen [overflow-x:clip]">
      {/* Hero — GALLERY HERO PAGE MEDIA CONTRACT GAP: no CMS page owner; neutral only */}
      <section
        className="relative flex min-h-screen items-center justify-center overflow-hidden"
        aria-label="Gallery hero"
      >
        <motion.div
          className="absolute inset-0"
          initial={!prefersReduced ? { scale: 1.08 } : undefined}
          animate={!prefersReduced ? { scale: 1 } : undefined}
          transition={{ duration: 14, ease: "easeOut" }}
        >
          <Image
            src={NEUTRAL_MEDIA_FALLBACK}
            alt="Zalina Arabian Village"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        </motion.div>
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 22%, rgba(5,5,5,0.72) 100%), linear-gradient(180deg, rgba(5,5,5,0.42), rgba(5,5,5,0.1) 44%, rgba(5,5,5,0.64))",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(ellipse 54% 42% at 50% 48%, rgba(200,155,82,0.14), transparent 70%)",
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
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            {[
              { top: "19%", left: "13%", delay: "0s" },
              { top: "44%", left: "85%", delay: "4s" },
              { top: "74%", left: "18%", delay: "7s" },
            ].map((particle, index) => (
              <span
                key={index}
                className="exp-particle"
                style={{
                  top: particle.top,
                  left: particle.left,
                  animationDelay: particle.delay,
                }}
              />
            ))}
          </div>
        )}
        <div className="relative z-10 mx-auto flex max-w-[760px] flex-col items-center px-5 pt-32 text-center sm:px-8 sm:pt-28 md:pt-0">
          <motion.span
            className="mb-5 block text-[11px] font-medium tracking-[0.3em] uppercase"
            style={{ color: "var(--zones-gold)" }}
            initial={!prefersReduced ? { opacity: 0, y: 18 } : undefined}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
          >
            THE VISUAL STORY
          </motion.span>
          <motion.div
            className="mb-5 h-px w-14"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--zones-gold), transparent)",
            }}
            initial={!prefersReduced ? { opacity: 0, scaleX: 0 } : undefined}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.35 }}
          />
          <motion.h1
            className="zones-hero-title mb-4"
            style={{ fontSize: "clamp(2.3rem, 5.6vw, 3.85rem)" }}
            initial={
              !prefersReduced
                ? { opacity: 0, y: 24, filter: "blur(6px)" }
                : undefined
            }
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.85, delay: 0.45 }}
          >
            Moments That Define Zalina
          </motion.h1>
          <motion.p
            className="zones-body mb-8 max-w-[590px]"
            style={{ fontSize: "clamp(0.94rem, 1.2vw, 1.06rem)" }}
            initial={!prefersReduced ? { opacity: 0, y: 16 } : undefined}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            A living gallery of experiences, zones, and bubble stays — curated
            from the Zalina CMS and refreshed as new moments are added.
          </motion.p>
          <motion.div
            className="flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row sm:gap-4"
            initial={!prefersReduced ? { opacity: 0, y: 14 } : undefined}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.95 }}
          >
            <a
              href="#gallery-wall"
              className="zones-btn-gold zones-radius-pill flex h-11 w-full items-center justify-center px-7 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--zones-bg)] sm:w-auto"
            >
              Explore the Gallery
            </a>
            <Link
              href="/book-now"
              className="flex h-11 w-full items-center justify-center rounded-full border text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--zones-bg)] sm:w-auto"
              style={{
                paddingInline: "28px",
                borderColor: "var(--zones-border)",
                background: "rgba(5,7,12,0.6)",
                color: "var(--zones-text-light)",
              }}
            >
              Book Now
            </Link>
          </motion.div>
        </div>
        <motion.div
          className="absolute bottom-8 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2"
          aria-hidden="true"
          initial={!prefersReduced ? { opacity: 0 } : undefined}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
        >
          <span
            className="text-[10px] tracking-[0.2em] uppercase"
            style={{ color: "var(--zones-text-muted)" }}
          >
            Scroll
          </span>
          <ChevronDown
            size={18}
            className="exp-scroll-indicator"
            style={{ color: "var(--zones-gold)" }}
          />
        </motion.div>
      </section>

      <section
        id="gallery-wall"
        className="zones-section relative scroll-mt-20 overflow-hidden"
        style={{ background: "var(--zones-surface)" }}
        aria-labelledby="gallery-wall-title"
      >
        <div className="zones-container relative z-10">
          <div className="mb-8 text-center">
            <span
              className="mb-4 block text-[11px] font-medium tracking-[0.28em] uppercase"
              style={{ color: "var(--zones-gold)" }}
            >
              THE MEMORY WALL
            </span>
            <h2
              id="gallery-wall-title"
              className="zones-section-title mb-4"
              style={sectionTitleStyle}
            >
              Scenes Made to Be Remembered
            </h2>
            <p
              className="zones-body mx-auto max-w-[540px]"
              style={{ fontSize: "15px", lineHeight: "1.75" }}
            >
              Browse real moments from experiences, zones, and bubble stays —
              updated whenever the CMS gallery changes.
            </p>
          </div>

          {filters.length > 0 && (
            <div
              className="-mx-5 mb-8 flex gap-2 overflow-x-auto px-5 pb-2 sm:mx-0 sm:justify-center sm:px-0 scrollbar-hide"
              role="tablist"
              aria-label="Gallery filters"
            >
              {filters.map((category) => {
                const active = selectedCategory === category.id;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => chooseCategory(category.id)}
                    className="relative flex-shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)]"
                    style={{
                      color: active
                        ? "var(--zones-gold)"
                        : "var(--zones-text-secondary)",
                      background: active
                        ? "rgba(200,155,82,0.08)"
                        : "transparent",
                    }}
                    aria-pressed={active}
                    data-i18n-key={category.labelKey}
                  >
                    {category.label}
                    {active && (
                      <span
                        className="absolute bottom-0 left-4 right-4 h-px"
                        aria-hidden="true"
                        style={{
                          background: "var(--zones-gold)",
                          boxShadow: "0 0 12px rgba(200,155,82,0.45)",
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {visibleItems.length > 0 && (
            <p
              className="mb-7 text-center text-xs"
              aria-live="polite"
              style={{ color: "var(--zones-text-muted)" }}
            >
              {visibleItems.length}{" "}
              {visibleItems.length === 1 ? "moment" : "moments"}
            </p>
          )}

          <AnimatePresence mode="wait">
            {visibleItems.length ? (
              <motion.div
                key={selectedCategory}
                className={"grid " + galleryLayoutClass}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                {visibleItems.map((item, index) => {
                  const thumb =
                    selectDisplayUrl(item.media, true) || item.media.url;
                  const alt = galleryItemAlt(item);
                  const title = galleryItemTitle(item);
                  return (
                    <motion.button
                      key={item.key}
                      type="button"
                      onClick={(event) =>
                        openLightbox(item.key, event.currentTarget)
                      }
                      className={`group relative min-h-[280px] overflow-hidden rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] sm:min-h-0 ${galleryItemSpan ?? gallerySpans[item.aspect]}`}
                      style={{
                        border: "1px solid var(--zones-border)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
                      }}
                      initial={
                        !prefersReduced ? { opacity: 0, y: 18 } : undefined
                      }
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.45,
                        delay: Math.min(index * 0.045, 0.25),
                      }}
                      whileHover={!prefersReduced ? { y: -3 } : undefined}
                    >
                      <Image
                        src={thumb}
                        alt={alt}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                        loading="lazy"
                      />
                      <div
                        className="absolute inset-0"
                        aria-hidden="true"
                        style={{
                          background:
                            "linear-gradient(180deg, transparent 42%, rgba(5,5,5,0.72))",
                        }}
                      />
                      <div
                        className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                        aria-hidden="true"
                        style={{
                          boxShadow:
                            "inset 0 0 0 1px rgba(200,155,82,0.38), 0 0 35px rgba(200,155,82,0.07)",
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <span
                          className="mb-1 block text-[10px] font-medium tracking-[0.16em] uppercase"
                          style={{ color: "var(--zones-gold)" }}
                        >
                          {CATEGORY_LABEL[item.category]}
                        </span>
                        <span
                          className="block text-sm font-medium"
                          style={{ color: "var(--zones-text-light)" }}
                        >
                          {title}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <div
                className="mx-auto max-w-lg rounded-xl px-6 py-14 text-center"
                style={{
                  background: "rgba(9,12,20,0.7)",
                  border: "1px solid var(--zones-border)",
                }}
                data-i18n-key={GALLERY_I18N_KEYS.empty}
              >
                <h3
                  className="mb-2"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: "var(--zones-text-light)",
                  }}
                >
                  No moments in the gallery yet
                </h3>
                <p
                  className="mb-5 text-sm"
                  style={{ color: "var(--zones-text-secondary)" }}
                >
                  When media is added in the CMS, it will appear here
                  automatically.
                </p>
                {availableFilters.includes("all") && (
                  <button
                    type="button"
                    onClick={() => chooseCategory("all")}
                    className="zones-btn-gold zones-radius-pill h-9 px-5 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)]"
                  >
                    View All Moments
                  </button>
                )}
              </div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section
        className="zones-section-md relative overflow-hidden"
        style={{ background: "transparent" }}
        aria-labelledby="gallery-reasons-title"
      >
        <div className="zones-container relative z-10">
          <div className="mb-8 text-center">
            <span
              className="mb-4 block text-[11px] font-medium tracking-[0.28em] uppercase"
              style={{ color: "var(--zones-gold)" }}
            >
              WHY IT MATTERS
            </span>
            <h2
              id="gallery-reasons-title"
              className="zones-section-title"
              style={sectionTitleStyle}
            >
              Gallery Experience
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {GALLERY_REASONS.map((reason, index) => {
              const Icon = [Sparkles, Heart, HandHeart][index];
              return (
                <div
                  key={reason.title}
                  className="group rounded-xl p-6 text-center transition-transform duration-300 hover:-translate-y-1"
                  style={{
                    background: "rgba(9,12,20,0.7)",
                    border: "1px solid var(--zones-border)",
                  }}
                >
                  <Icon
                    className="mx-auto mb-4"
                    size={19}
                    strokeWidth={1.4}
                    style={{ color: "var(--zones-gold)" }}
                  />
                  <h3
                    className="mb-2"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.08rem",
                      color: "var(--zones-text-light)",
                    }}
                  >
                    {reason.title}
                  </h3>
                  <p
                    className="text-[13px] leading-relaxed"
                    style={{ color: "var(--zones-text-secondary)" }}
                  >
                    {reason.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="zones-section relative overflow-hidden"
        style={{ background: "transparent" }}
        aria-labelledby="gallery-cta-title"
      >
        <div className="zones-container relative z-10">
          <motion.div
            className="relative overflow-hidden rounded-2xl px-6 py-14 text-center md:py-16"
            style={{
              border: "1px solid rgba(200,155,82,0.2)",
              boxShadow: "0 28px 70px rgba(0,0,0,0.4)",
            }}
            initial={!prefersReduced ? { opacity: 0, y: 28 } : undefined}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Image
              src={NEUTRAL_MEDIA_FALLBACK}
              alt=""
              fill
              sizes="100vw"
              className="object-cover"
              loading="lazy"
            />
            <div
              className="absolute inset-0"
              aria-hidden="true"
              style={{
                background:
                  "linear-gradient(135deg, rgba(5,7,12,0.8), rgba(44,33,19,0.7))",
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
              style={{
                background:
                  "radial-gradient(ellipse 48% 70% at 50% 50%, rgba(200,155,82,0.12), transparent 72%)",
              }}
            />
            <div className="relative z-10 mx-auto max-w-[600px]">
              <h2
                id="gallery-cta-title"
                className="mb-4"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.75rem, 4vw, 2.5rem)",
                  fontWeight: 500,
                  color: "var(--zones-text-light)",
                }}
              >
                See the Story. Live the Experience.
              </h2>
              <p
                className="mb-7"
                style={{ color: "var(--zones-text-secondary)", fontSize: "15px" }}
              >
                Explore the moments, then step into the world behind them.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/book-now"
                  className="zones-btn-gold zones-radius-pill flex h-11 w-full items-center justify-center px-7 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] sm:w-auto"
                >
                  Book Now
                </Link>
                <Link
                  href="/experiences"
                  className="flex h-11 w-full items-center justify-center rounded-full border px-7 text-sm font-medium transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] sm:w-auto"
                  style={{
                    borderColor: "var(--zones-border)",
                    color: "var(--zones-text-light)",
                  }}
                >
                  Explore Experiences
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {selectedLightboxItem && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 md:p-8"
            role="dialog"
            aria-modal="true"
            aria-label={`${galleryItemTitle(selectedLightboxItem)} image preview`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) closeLightbox();
            }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <button
              type="button"
              onClick={closeLightbox}
              ref={lightboxCloseButtonRef}
              className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] md:right-7 md:top-7"
              aria-label="Close image preview"
              data-i18n-key={GALLERY_I18N_KEYS.close}
              style={{
                background: "rgba(5,7,12,0.86)",
                border: "1px solid rgba(200,155,82,0.3)",
                color: "var(--zones-text-light)",
              }}
            >
              <X size={20} />
            </button>
            <button
              type="button"
              onClick={() => navigateLightbox(-1)}
              className="absolute left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] sm:flex"
              aria-label="Previous image"
              data-i18n-key={GALLERY_I18N_KEYS.previous}
              style={{
                background: "rgba(5,7,12,0.86)",
                border: "1px solid rgba(200,155,82,0.3)",
                color: "var(--zones-text-light)",
              }}
            >
              <ChevronLeft />
            </button>
            <div className="relative flex h-full max-h-[82vh] w-full max-w-5xl flex-col">
              <div
                className="relative min-h-0 flex-1 overflow-hidden rounded-xl"
                style={{ border: "1px solid rgba(200,155,82,0.25)" }}
              >
                <Image
                  src={selectedLightboxItem.media.url}
                  alt={galleryItemAlt(selectedLightboxItem)}
                  fill
                  sizes="90vw"
                  className="object-contain"
                  priority
                />
              </div>
              <div className="flex items-center justify-between gap-4 px-1 pt-4">
                <div>
                  <span
                    className="mb-1 block text-[10px] font-medium tracking-[0.18em] uppercase"
                    style={{ color: "var(--zones-gold)" }}
                  >
                    {CATEGORY_LABEL[selectedLightboxItem.category]}
                    {" · "}
                    {selectedLightboxItem.sourceName}
                  </span>
                  <p
                    className="text-sm"
                    style={{ color: "var(--zones-text-light)" }}
                  >
                    {galleryItemTitle(selectedLightboxItem)}
                  </p>
                  {(selectedLightboxItem.caption ||
                    selectedLightboxItem.media.caption) && (
                    <p
                      className="mt-1 text-xs"
                      style={{ color: "var(--zones-text-secondary)" }}
                    >
                      {selectedLightboxItem.caption ||
                        selectedLightboxItem.media.caption}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 sm:hidden">
                  <button
                    type="button"
                    onClick={() => navigateLightbox(-1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    aria-label="Previous image"
                    style={{
                      border: "1px solid rgba(200,155,82,0.3)",
                      color: "var(--zones-text-light)",
                    }}
                  >
                    <ChevronLeft />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateLightbox(1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full"
                    aria-label="Next image"
                    style={{
                      border: "1px solid rgba(200,155,82,0.3)",
                      color: "var(--zones-text-light)",
                    }}
                  >
                    <ChevronRight />
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigateLightbox(1)}
              className="absolute right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] sm:flex"
              aria-label="Next image"
              data-i18n-key={GALLERY_I18N_KEYS.next}
              style={{
                background: "rgba(5,7,12,0.86)",
                border: "1px solid rgba(200,155,82,0.3)",
                color: "var(--zones-text-light)",
              }}
            >
              <ChevronRight />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
