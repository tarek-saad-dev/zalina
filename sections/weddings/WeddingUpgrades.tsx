"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useBookingLocale } from "@/components/book-now/useBookingLocale";
import {
  getWeddingConciergeHref,
  isWeddingConciergeConfigured,
} from "@/lib/contact/weddingConcierge";
import { WEDDING_COPY } from "./content/weddingCopy";
import { pickLocale } from "./content/locale";
import { BESPOKE_UPGRADES } from "./content/bespokeUpgrades";

export function WeddingUpgrades() {
  const locale = useBookingLocale();
  const prefersReduced = useReducedMotion();
  const conciergeHref = getWeddingConciergeHref();
  const conciergeReady = isWeddingConciergeConfigured();

  return (
    <section
      className="zones-section"
      aria-labelledby="wedding-upgrades-title"
    >
      <div className="zones-container">
        <div className="max-w-2xl mb-10">
          <p
            className="text-[11px] tracking-[0.28em] uppercase mb-4"
            style={{ color: "var(--zones-gold)" }}
          >
            {pickLocale(locale, WEDDING_COPY.upgradesEyebrow)}
          </p>
          <h2
            id="wedding-upgrades-title"
            className="zones-section-title mb-4"
            style={{ color: "#F8F2E7" }}
          >
            {pickLocale(locale, WEDDING_COPY.upgradesHeadline)}
          </h2>
          <p
            className="zones-body mb-3"
            style={{ color: "rgba(248,242,231,0.7)" }}
          >
            {pickLocale(locale, WEDDING_COPY.upgradesSupport)}
          </p>
          <p
            className="text-sm"
            style={{ color: "rgba(212,175,55,0.85)" }}
          >
            {pickLocale(locale, WEDDING_COPY.upgradesNote)}
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {BESPOKE_UPGRADES.map((item, index) => (
            <motion.div
              key={item.id}
              initial={!prefersReduced ? { opacity: 0, y: 16 } : undefined}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.04 }}
              style={{
                borderTop: "1px solid rgba(212,175,55,0.28)",
                paddingTop: "18px",
              }}
            >
              <h3
                className="mb-2"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.35rem",
                  color: "#F8F2E7",
                  fontWeight: 400,
                }}
              >
                {pickLocale(locale, item.title)}
              </h3>
              <p
                className="text-[14px] leading-relaxed"
                style={{ color: "rgba(248,242,231,0.65)" }}
              >
                {pickLocale(locale, item.body)}
              </p>
            </motion.div>
          ))}
        </div>

        {conciergeReady && conciergeHref ? (
          <a
            href={conciergeHref}
            target={conciergeHref.startsWith("http") ? "_blank" : undefined}
            rel={
              conciergeHref.startsWith("http")
                ? "noopener noreferrer"
                : undefined
            }
            className="zones-btn-gold inline-flex"
          >
            {pickLocale(locale, WEDDING_COPY.contactConcierge)}
          </a>
        ) : null}
      </div>
    </section>
  );
}
