"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useBookingLocale } from "@/components/book-now/useBookingLocale";
import { WEDDING_COPY } from "./content/weddingCopy";
import { pickLocale } from "./content/locale";
import { resolveWeddingMediaSrc, WEDDING_MEDIA } from "./content/weddingMedia";

const PILLARS = [
  {
    title: WEDDING_COPY.pillarSettingTitle,
    body: WEDDING_COPY.pillarSettingBody,
  },
  {
    title: WEDDING_COPY.pillarCelebrationTitle,
    body: WEDDING_COPY.pillarCelebrationBody,
  },
  {
    title: WEDDING_COPY.pillarTableTitle,
    body: WEDDING_COPY.pillarTableBody,
  },
  {
    title: WEDDING_COPY.pillarServiceTitle,
    body: WEDDING_COPY.pillarServiceBody,
  },
] as const;

export function WeddingExperience() {
  const locale = useBookingLocale();
  const prefersReduced = useReducedMotion();
  const src = resolveWeddingMediaSrc("experience");

  return (
    <section
      className="zones-section"
      aria-labelledby="wedding-experience-title"
    >
      <div className="zones-container">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] items-center">
          <motion.div
            className="relative aspect-[3/4] overflow-hidden"
            style={{ borderRadius: "2px" }}
            initial={!prefersReduced ? { opacity: 0, y: 28 } : undefined}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src={src}
              alt={pickLocale(locale, WEDDING_MEDIA.experience.alt)}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 45vw"
            />
          </motion.div>

          <div>
            <p
              className="text-[11px] tracking-[0.28em] uppercase mb-4"
              style={{ color: "var(--zones-gold)" }}
            >
              {pickLocale(locale, WEDDING_COPY.experienceEyebrow)}
            </p>
            <h2
              id="wedding-experience-title"
              className="zones-section-title mb-5"
              style={{ color: "#F8F2E7" }}
            >
              {pickLocale(locale, WEDDING_COPY.experienceHeadline)}
            </h2>
            <p
              className="zones-body mb-10 max-w-xl"
              style={{ color: "rgba(248,242,231,0.7)" }}
            >
              {pickLocale(locale, WEDDING_COPY.experienceSupport)}
            </p>

            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-8">
              {PILLARS.map((pillar) => (
                <div key={pillar.title.en}>
                  <h3
                    className="text-sm tracking-[0.18em] uppercase mb-2"
                    style={{ color: "var(--zones-gold)" }}
                  >
                    {pickLocale(locale, pillar.title)}
                  </h3>
                  <p
                    className="text-[15px] leading-relaxed"
                    style={{ color: "rgba(248,242,231,0.72)" }}
                  >
                    {pickLocale(locale, pillar.body)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
