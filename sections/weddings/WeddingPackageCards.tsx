"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { WeddingPackage } from "@/lib/api";
import {
  formatMoneyAmount,
  localizedName,
  parseMoney,
} from "@/components/book-now/bookingMedia";
import { useBookingLocale } from "@/components/book-now/useBookingLocale";
import { WEDDING_COPY } from "./content/weddingCopy";
import { pickLocale } from "./content/locale";
import { getPackagePositioning } from "./content/packagePositioning";
import { isSignaturePackageSlug } from "./content/weddingMedia";

interface WeddingPackageCardsProps {
  packages: WeddingPackage[];
  selectedId: number | null;
  onSelect: (pkg: WeddingPackage) => void;
}

export function WeddingPackageCards({
  packages,
  selectedId,
  onSelect,
}: WeddingPackageCardsProps) {
  const locale = useBookingLocale();
  const prefersReduced = useReducedMotion();

  return (
    <section
      id="packages"
      className="zones-section scroll-mt-24"
      aria-labelledby="wedding-packages-title"
    >
      <div className="zones-container">
        <div className="max-w-2xl mb-12">
          <p
            className="text-[11px] tracking-[0.28em] uppercase mb-4"
            style={{ color: "var(--zones-gold)" }}
          >
            {pickLocale(locale, WEDDING_COPY.packagesEyebrow)}
          </p>
          <h2
            id="wedding-packages-title"
            className="zones-section-title mb-4"
            style={{ color: "#F8F2E7" }}
          >
            {pickLocale(locale, WEDDING_COPY.packagesHeadline)}
          </h2>
          <p className="zones-body" style={{ color: "rgba(248,242,231,0.7)" }}>
            {pickLocale(locale, WEDDING_COPY.packagesSupport)}
          </p>
        </div>

        {packages.length === 0 ? (
          <p role="status" style={{ color: "rgba(248,242,231,0.65)" }}>
            {pickLocale(locale, WEDDING_COPY.planCatalogEmpty)}
          </p>
        ) : (
          <div className="grid gap-5 lg:grid-cols-3 items-stretch">
            {packages.map((pkg, index) => {
              const positioning = getPackagePositioning(pkg.slug);
              const isSignature = isSignaturePackageSlug(pkg.slug);
              const selected = selectedId === pkg.id;
              const amount = parseMoney(pkg.price_per_guest);
              const priceLabel =
                amount == null
                  ? pkg.price_per_guest
                  : formatMoneyAmount(amount, pkg.currency);

              return (
                <motion.button
                  key={pkg.id}
                  type="button"
                  onClick={() => onSelect(pkg)}
                  className="text-start relative flex flex-col p-6 md:p-7"
                  style={{
                    borderRadius: "4px",
                    border: selected
                      ? "1px solid rgba(212,175,55,0.7)"
                      : isSignature
                        ? "1px solid rgba(212,175,55,0.45)"
                        : "1px solid rgba(255,255,255,0.1)",
                    background: isSignature
                      ? "linear-gradient(165deg, rgba(36,28,16,0.95), rgba(10,8,6,0.98))"
                      : "rgba(255,255,255,0.03)",
                    transform: isSignature && !prefersReduced ? "scale(1.02)" : undefined,
                    boxShadow: isSignature
                      ? "0 24px 60px rgba(0,0,0,0.35)"
                      : undefined,
                    outline: selected ? "2px solid rgba(212,175,55,0.35)" : undefined,
                    outlineOffset: "2px",
                  }}
                  initial={!prefersReduced ? { opacity: 0, y: 24 } : undefined}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  aria-pressed={selected}
                >
                  {positioning.badge ? (
                    <span
                      className="absolute top-4 end-4 text-[10px] tracking-[0.18em] uppercase px-3 py-1"
                      style={{
                        color: "#0c0906",
                        background: "rgba(212,175,55,0.92)",
                        borderRadius: "999px",
                      }}
                    >
                      {pickLocale(locale, positioning.badge)}
                    </span>
                  ) : null}

                  <h3
                    className="mb-3 pe-16"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: isSignature ? "1.65rem" : "1.4rem",
                      color: "#F8F2E7",
                      fontWeight: 400,
                    }}
                  >
                    {localizedName(pkg, locale)}
                  </h3>
                  <p
                    className="text-[14px] leading-relaxed mb-6 flex-1"
                    style={{ color: "rgba(248,242,231,0.68)" }}
                  >
                    {pickLocale(locale, positioning.short)}
                  </p>
                  <p
                    className="mb-1"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: "1.75rem",
                      color: "var(--zones-gold)",
                    }}
                  >
                    {priceLabel}
                  </p>
                  <p
                    className="text-xs tracking-[0.14em] uppercase mb-4"
                    style={{ color: "rgba(248,242,231,0.5)" }}
                  >
                    {pickLocale(locale, WEDDING_COPY.perGuest)}
                  </p>
                  <p
                    className="text-sm"
                    style={{ color: "rgba(248,242,231,0.62)" }}
                  >
                    {pickLocale(locale, WEDDING_COPY.guestsRange)}:{" "}
                    {pkg.minimum_guests}–{pkg.maximum_guests}
                  </p>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
