"use client";

import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X } from "lucide-react";
import type { WeddingPackage } from "@/lib/api";
import { useBookingLocale } from "@/components/book-now/useBookingLocale";
import { useSmoothScroll } from "@/components/motion/SmoothScrollProvider";
import { WEDDING_COPY } from "./content/weddingCopy";
import { pickLocale } from "./content/locale";
import { WeddingPlanner } from "./WeddingPlanner";

interface WeddingBookingModalProps {
  open: boolean;
  onClose: () => void;
  packages: WeddingPackage[];
  selectedPackageId: number | null;
}

export function WeddingBookingModal({
  open,
  onClose,
  packages,
  selectedPackageId,
}: WeddingBookingModalProps) {
  const locale = useBookingLocale();
  const prefersReduced = useReducedMotion();
  const titleId = useId();
  const { lenis } = useSmoothScroll();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Lenis steals wheel events — pause it while the modal owns scroll.
    lenis?.stop();
    return () => {
      document.body.style.overflow = prev;
      lenis?.start();
    };
  }, [open, lenis]);

  useEffect(() => {
    if (!open) return;
    scrollRef.current?.scrollTo({ top: 0 });
  }, [open, selectedPackageId]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="wedding-booking-overlay"
          className="fixed inset-0 z-[10000] flex items-end sm:items-center justify-center p-0 sm:p-6"
          initial={prefersReduced ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={prefersReduced ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <button
            type="button"
            aria-label={pickLocale(locale, WEDDING_COPY.planClose)}
            className="absolute inset-0"
            style={{ background: "rgba(5,5,5,0.78)" }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            data-lenis-prevent
            className="relative z-10 flex w-full min-h-0 max-h-[92vh] flex-col overflow-hidden rounded-t-xl sm:max-w-3xl sm:rounded-xl"
            style={{
              background: "var(--zones-bg, #0c0a07)",
              border: "1px solid rgba(212,175,55,0.28)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.55)",
            }}
            initial={
              prefersReduced ? false : { opacity: 0, y: 36, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              prefersReduced ? undefined : { opacity: 0, y: 24, scale: 0.98 }
            }
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            onWheel={(event) => event.stopPropagation()}
          >
            <div
              className="flex shrink-0 items-start justify-between gap-4 px-5 sm:px-7 pt-5 pb-4"
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.08)",
                background:
                  "linear-gradient(180deg, rgba(36,28,16,0.45), transparent)",
              }}
            >
              <div className="min-w-0 pe-2">
                <p
                  className="text-[11px] tracking-[0.28em] uppercase mb-2"
                  style={{ color: "var(--zones-gold)" }}
                >
                  {pickLocale(locale, WEDDING_COPY.planEyebrow)}
                </p>
                <h2
                  id={titleId}
                  className="m-0"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.35rem, 3.5vw, 1.75rem)",
                    color: "#F8F2E7",
                    fontWeight: 400,
                    lineHeight: 1.2,
                  }}
                >
                  {pickLocale(locale, WEDDING_COPY.planBookingTitle)}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="shrink-0 w-11 h-11 inline-flex items-center justify-center touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.55)]"
                style={{
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,0.16)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#F8F2E7",
                }}
                aria-label={pickLocale(locale, WEDDING_COPY.planClose)}
              >
                <X size={18} />
              </button>
            </div>

            <div
              ref={scrollRef}
              data-lenis-prevent
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 sm:px-7 py-5 sm:py-6"
              style={{ WebkitOverflowScrolling: "touch" }}
              onWheel={(event) => {
                // Keep wheel scrolling inside the modal panel (Lenis / page).
                event.stopPropagation();
              }}
            >
              <WeddingPlanner
                packages={packages}
                selectedPackageId={selectedPackageId}
                variant="embedded"
                onChangeExperience={onClose}
              />
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
