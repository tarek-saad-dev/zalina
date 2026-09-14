"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";
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
  selectedId?: number | null;
  onSelect?: (pkg: WeddingPackage) => void;
}

export function WeddingPackageCards({
  packages,
  selectedId = null,
  onSelect,
}: WeddingPackageCardsProps) {
  const locale = useBookingLocale();
  const prefersReduced = useReducedMotion();
  const interactive = typeof onSelect === "function";

  return (
    <section
      id="packages"
      className="zones-section scroll-mt-24"
      aria-labelledby="wedding-packages-title"
      style={{ paddingBottom: "40px" }}
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
                  disabled={!interactive}
                  onClick={() => onSelect?.(pkg)}
                  className={`relative flex flex-col p-6 md:p-7 text-start touch-manipulation transition-[border-color,background,box-shadow,transform] duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(212,175,55,0.55)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--zones-bg)] ${
                    interactive
                      ? "cursor-pointer active:scale-[0.985] hover:border-[rgba(212,175,55,0.5)]"
                      : "cursor-default"
                  }`}
                  style={{
                    borderRadius: "4px",
                    border: selected
                      ? "1px solid rgba(212,175,55,0.78)"
                      : isSignature
                        ? "1px solid rgba(212,175,55,0.42)"
                        : "1px solid rgba(255,255,255,0.14)",
                    background: selected
                      ? "linear-gradient(165deg, rgba(42,32,16,0.98), rgba(12,10,7,0.98))"
                      : isSignature
                        ? "linear-gradient(165deg, rgba(36,28,16,0.95), rgba(10,8,6,0.98))"
                        : "rgba(255,255,255,0.03)",
                    transform:
                      isSignature && !prefersReduced && !selected
                        ? "scale(1.02)"
                        : undefined,
                    boxShadow: selected
                      ? "0 0 0 1px rgba(212,175,55,0.22), 0 20px 48px rgba(0,0,0,0.38)"
                      : isSignature
                        ? "0 24px 60px rgba(0,0,0,0.35)"
                        : "0 12px 32px rgba(0,0,0,0.22)",
                    WebkitTapHighlightColor: "transparent",
                  }}
                  initial={!prefersReduced ? { opacity: 0, y: 24 } : undefined}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, delay: index * 0.08 }}
                  whileTap={
                    interactive && !prefersReduced
                      ? { scale: 0.985 }
                      : undefined
                  }
                  aria-pressed={interactive ? selected : undefined}
                >
                  {positioning.badge ? (
                    <span
                      className="absolute top-4 end-4 text-[10px] tracking-[0.18em] uppercase px-3 py-1 pointer-events-none"
                      style={{
                        color: "#0c0906",
                        background: "rgba(212,175,55,0.92)",
                        borderRadius: "999px",
                      }}
                    >
                      {pickLocale(locale, positioning.badge)}
                    </span>
                  ) : null}

                  {selected ? (
                    <span
                      className="absolute top-4 start-4 text-[10px] tracking-[0.18em] uppercase"
                      style={{ color: "rgba(212,175,55,0.95)" }}
                    >
                      {pickLocale(locale, WEDDING_COPY.selectedExperience)}
                    </span>
                  ) : null}

                  <h3
                    className="mb-3 pe-16"
                    style={{
                      fontFamily: "var(--font-display)",
                      fontSize: isSignature ? "1.65rem" : "1.4rem",
                      color: "#F8F2E7",
                      fontWeight: 400,
                      marginTop: selected ? "18px" : undefined,
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
                    className="text-sm mb-5"
                    style={{ color: "rgba(248,242,231,0.62)" }}
                  >
                    {pickLocale(locale, WEDDING_COPY.guestsRange)}:{" "}
                    {pkg.minimum_guests}–{pkg.maximum_guests}
                  </p>

                  {interactive ? (
                    <span
                      className="mt-auto flex items-center justify-between gap-3 text-[11px] tracking-[0.16em] uppercase"
                      style={{
                        color: selected
                          ? "rgba(212,175,55,0.95)"
                          : "rgba(248,242,231,0.82)",
                        borderTop: "1px solid rgba(255,255,255,0.1)",
                        paddingTop: "14px",
                      }}
                    >
                      <span>
                        {selected
                          ? pickLocale(locale, WEDDING_COPY.selectedExperience)
                          : pickLocale(locale, WEDDING_COPY.chooseThisExperience)}
                      </span>
                      <ChevronRight
                        size={16}
                        className="shrink-0 opacity-80 rtl:rotate-180"
                        aria-hidden
                      />
                    </span>
                  ) : null}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
