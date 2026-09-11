"use client";

import { useMemo, useState, Fragment } from "react";
import type { WeddingPackage } from "@/lib/api";
import { localizedName } from "@/components/book-now/bookingMedia";
import { useBookingLocale } from "@/components/book-now/useBookingLocale";
import { WEDDING_COPY } from "./content/weddingCopy";
import { pickLocale } from "./content/locale";
import { PACKAGE_COMPARISON } from "./content/packageComparison";
import {
  isRoyalPackageSlug,
  isSignaturePackageSlug,
} from "./content/weddingMedia";

interface WeddingPackageComparisonProps {
  packages: WeddingPackage[];
}

type ColumnKey = "wedding" | "signature" | "royal";

function resolveColumns(packages: WeddingPackage[]): {
  key: ColumnKey;
  pkg: WeddingPackage | null;
  label: string;
}[] {
  const wedding =
    packages.find((p) => !isSignaturePackageSlug(p.slug) && !isRoyalPackageSlug(p.slug)) ??
    packages[0] ??
    null;
  const signature =
    packages.find((p) => isSignaturePackageSlug(p.slug)) ?? packages[1] ?? null;
  const royal =
    packages.find((p) => isRoyalPackageSlug(p.slug)) ?? packages[2] ?? null;
  return [
    { key: "wedding", pkg: wedding, label: wedding?.name_en ?? "Wedding" },
    { key: "signature", pkg: signature, label: signature?.name_en ?? "Signature" },
    { key: "royal", pkg: royal, label: royal?.name_en ?? "Royal" },
  ];
}

export function WeddingPackageComparison({
  packages,
}: WeddingPackageComparisonProps) {
  const locale = useBookingLocale();
  const columns = useMemo(() => resolveColumns(packages), [packages]);
  const [mobileCol, setMobileCol] = useState<ColumnKey>("signature");
  const [openCategory, setOpenCategory] = useState<string>(
    PACKAGE_COMPARISON[0]?.id ?? "venue"
  );

  return (
    <section
      className="zones-section"
      aria-labelledby="wedding-comparison-title"
    >
      <div className="zones-container">
        <div className="max-w-2xl mb-10">
          <p
            className="text-[11px] tracking-[0.28em] uppercase mb-4"
            style={{ color: "var(--zones-gold)" }}
          >
            {pickLocale(locale, WEDDING_COPY.comparisonEyebrow)}
          </p>
          <h2
            id="wedding-comparison-title"
            className="zones-section-title"
            style={{ color: "#F8F2E7" }}
          >
            {pickLocale(locale, WEDDING_COPY.comparisonHeadline)}
          </h2>
        </div>

        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full border-collapse text-start">
            <thead>
              <tr>
                <th
                  className="py-4 pe-4 text-[11px] tracking-[0.18em] uppercase font-medium"
                  style={{ color: "rgba(248,242,231,0.45)", width: "28%" }}
                >
                  {pickLocale(locale, WEDDING_COPY.comparisonFeature)}
                </th>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="py-4 px-3 text-[13px] font-medium"
                    style={{
                      color:
                        col.key === "signature"
                          ? "var(--zones-gold)"
                          : "#F8F2E7",
                      background:
                        col.key === "signature"
                          ? "rgba(212,175,55,0.06)"
                          : undefined,
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {col.pkg
                      ? localizedName(col.pkg, locale)
                      : col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PACKAGE_COMPARISON.map((category) => (
                <Fragment key={category.id}>
                  <tr>
                    <td
                      colSpan={4}
                      className="pt-8 pb-3 text-[11px] tracking-[0.22em] uppercase"
                      style={{ color: "var(--zones-gold)" }}
                    >
                      {pickLocale(locale, category.title)}
                    </td>
                  </tr>
                  {category.rows.map((row) => (
                    <tr key={row.id}>
                      <td
                        className="py-3 pe-4 text-sm"
                        style={{
                          color: "rgba(248,242,231,0.62)",
                          borderBottom: "1px solid rgba(255,255,255,0.05)",
                        }}
                      >
                        {pickLocale(locale, row.label)}
                      </td>
                      {columns.map((col) => (
                        <td
                          key={col.key}
                          className="py-3 px-3 text-sm"
                          style={{
                            color: "#F8F2E7",
                            background:
                              col.key === "signature"
                                ? "rgba(212,175,55,0.05)"
                                : undefined,
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                          }}
                        >
                          {pickLocale(locale, row[col.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile: package tabs + category accordions */}
        <div className="lg:hidden">
          <div
            role="tablist"
            aria-label={pickLocale(locale, WEDDING_COPY.comparisonEyebrow)}
            className="flex gap-2 mb-6 overflow-x-auto pb-1"
          >
            {columns.map((col) => (
              <button
                key={col.key}
                type="button"
                role="tab"
                aria-selected={mobileCol === col.key}
                onClick={() => setMobileCol(col.key)}
                className="shrink-0 px-4 py-2 text-[11px] tracking-[0.14em] uppercase"
                style={{
                  borderRadius: "999px",
                  border:
                    mobileCol === col.key
                      ? "1px solid rgba(212,175,55,0.65)"
                      : "1px solid rgba(255,255,255,0.12)",
                  color:
                    mobileCol === col.key
                      ? "var(--zones-gold)"
                      : "rgba(248,242,231,0.7)",
                  background:
                    mobileCol === col.key
                      ? "rgba(212,175,55,0.1)"
                      : "transparent",
                }}
              >
                {col.pkg ? localizedName(col.pkg, locale) : col.label}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {PACKAGE_COMPARISON.map((category) => {
              const open = openCategory === category.id;
              return (
                <div
                  key={category.id}
                  style={{
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "4px",
                  }}
                >
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-3 text-start"
                    aria-expanded={open}
                    onClick={() =>
                      setOpenCategory(open ? "" : category.id)
                    }
                  >
                    <span
                      className="text-[12px] tracking-[0.16em] uppercase"
                      style={{ color: "var(--zones-gold)" }}
                    >
                      {pickLocale(locale, category.title)}
                    </span>
                    <span style={{ color: "rgba(248,242,231,0.5)" }}>
                      {open ? "−" : "+"}
                    </span>
                  </button>
                  {open ? (
                    <ul className="px-4 pb-4 space-y-3">
                      {category.rows.map((row) => (
                        <li key={row.id}>
                          <p
                            className="text-xs mb-1"
                            style={{ color: "rgba(248,242,231,0.5)" }}
                          >
                            {pickLocale(locale, row.label)}
                          </p>
                          <p
                            className="text-sm"
                            style={{ color: "#F8F2E7" }}
                          >
                            {pickLocale(locale, row[mobileCol])}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
