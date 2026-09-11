"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useBookingLocale } from "@/components/book-now/useBookingLocale";
import { WEDDING_COPY } from "./content/weddingCopy";
import { pickLocale } from "./content/locale";
import { SIGNATURE_SPOTLIGHT_GROUPS } from "./content/packageComparison";
import { resolveWeddingMediaSrc, WEDDING_MEDIA } from "./content/weddingMedia";

export function SignatureSpotlight() {
  const locale = useBookingLocale();
  const prefersReduced = useReducedMotion();
  const src = resolveWeddingMediaSrc("signature");

  return (
    <section
      className="zones-section"
      aria-labelledby="signature-spotlight-title"
    >
      <div className="zones-container">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-start">
          <div>
            <p
              className="text-[11px] tracking-[0.28em] uppercase mb-4"
              style={{ color: "var(--zones-gold)" }}
            >
              {pickLocale(locale, WEDDING_COPY.signatureEyebrow)}
            </p>
            <h2
              id="signature-spotlight-title"
              className="zones-section-title mb-10"
              style={{ color: "#F8F2E7" }}
            >
              {pickLocale(locale, WEDDING_COPY.signatureHeadline)}
            </h2>

            <div className="grid sm:grid-cols-2 gap-8">
              {SIGNATURE_SPOTLIGHT_GROUPS.map((group) => (
                <div key={group.id}>
                  <h3
                    className="text-[12px] tracking-[0.18em] uppercase mb-3"
                    style={{ color: "var(--zones-gold)" }}
                  >
                    {pickLocale(locale, group.title)}
                  </h3>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li
                        key={item.en}
                        className="text-[14px] leading-relaxed"
                        style={{ color: "rgba(248,242,231,0.72)" }}
                      >
                        {pickLocale(locale, item)}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <motion.div
            className="relative aspect-[3/4] overflow-hidden lg:sticky lg:top-28"
            style={{ borderRadius: "2px" }}
            initial={!prefersReduced ? { opacity: 0, y: 24 } : undefined}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src={src}
              alt={pickLocale(locale, WEDDING_MEDIA.signature.alt)}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 42vw"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
