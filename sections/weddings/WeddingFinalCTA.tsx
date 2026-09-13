"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useBookingLocale } from "@/components/book-now/useBookingLocale";
import { WEDDING_COPY } from "./content/weddingCopy";
import { pickLocale } from "./content/locale";
import { resolveWeddingMediaSrc, WEDDING_MEDIA } from "./content/weddingMedia";

function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function WeddingFinalCTA() {
  const locale = useBookingLocale();
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="relative zones-section overflow-hidden"
      aria-labelledby="wedding-final-title"
    >
      <div className="absolute inset-0">
        <Image
          src={resolveWeddingMediaSrc("finalCta")}
          alt={pickLocale(locale, WEDDING_MEDIA.finalCta.alt)}
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,5,5,0.72) 0%, rgba(5,5,5,0.78) 100%)",
          }}
        />
      </div>

      <div className="zones-container relative z-10 text-center py-8 md:py-16">
        <motion.div
          initial={!prefersReduced ? { opacity: 0, y: 20 } : undefined}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mx-auto"
        >
          <h2
            id="wedding-final-title"
            className="zones-section-title mb-4"
            style={{ color: "#F8F2E7" }}
          >
            {pickLocale(locale, WEDDING_COPY.finalHeadline)}
          </h2>
          <p
            className="mb-8 text-lg"
            style={{ color: "rgba(248,242,231,0.75)" }}
          >
            {pickLocale(locale, WEDDING_COPY.finalSupport)}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              type="button"
              className="zones-btn-gold zones-radius-pill inline-flex items-center justify-center h-11 px-7 text-[12px] font-medium tracking-[0.14em] uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--zones-bg)]"
              onClick={() => scrollToId("plan")}
            >
              {pickLocale(locale, WEDDING_COPY.ctaCheckDate)}
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center h-11 px-7 text-[12px] font-medium tracking-[0.14em] uppercase transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(248,242,231,0.45)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--zones-bg)]"
              style={{
                borderRadius: "999px",
                border: "1px solid rgba(248,242,231,0.35)",
                color: "#F8F2E7",
                background: "rgba(0,0,0,0.25)",
              }}
              onClick={() => scrollToId("packages")}
            >
              {pickLocale(locale, WEDDING_COPY.ctaExplorePackages)}
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
