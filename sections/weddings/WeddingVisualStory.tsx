"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useBookingLocale } from "@/components/book-now/useBookingLocale";
import { WEDDING_COPY } from "./content/weddingCopy";
import { pickLocale } from "./content/locale";
import { resolveWeddingMediaSrc, WEDDING_MEDIA } from "./content/weddingMedia";

export function WeddingVisualStory() {
  const locale = useBookingLocale();
  const prefersReduced = useReducedMotion();

  return (
    <section
      className="zones-section"
      aria-labelledby="wedding-visual-title"
    >
      <div className="zones-container">
        <div className="max-w-2xl mb-10">
          <p
            className="text-[11px] tracking-[0.28em] uppercase mb-4"
            style={{ color: "var(--zones-gold)" }}
          >
            {pickLocale(locale, WEDDING_COPY.visualEyebrow)}
          </p>
          <h2
            id="wedding-visual-title"
            className="zones-section-title mb-3"
            style={{ color: "#F8F2E7" }}
          >
            {pickLocale(locale, WEDDING_COPY.visualHeadline)}
          </h2>
          <p className="zones-body" style={{ color: "rgba(248,242,231,0.7)" }}>
            {pickLocale(locale, WEDDING_COPY.visualSupport)}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-12 md:grid-rows-2 md:min-h-[640px]">
          <motion.div
            className="relative aspect-[16/10] md:aspect-auto md:col-span-8 md:row-span-2 overflow-hidden"
            initial={!prefersReduced ? { opacity: 0 } : undefined}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
          >
            <Image
              src={resolveWeddingMediaSrc("visualStoryPrimary")}
              alt={pickLocale(locale, WEDDING_MEDIA.visualStoryPrimary.alt)}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 66vw"
            />
          </motion.div>
          <motion.div
            className="relative aspect-[3/4] md:aspect-auto md:col-span-4 md:row-span-2 overflow-hidden"
            initial={!prefersReduced ? { opacity: 0 } : undefined}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.1 }}
          >
            <Image
              src={resolveWeddingMediaSrc("visualStorySecondary")}
              alt={pickLocale(locale, WEDDING_MEDIA.visualStorySecondary.alt)}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
