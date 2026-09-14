"use client";

import type { CSSProperties } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Plus } from "lucide-react";
import { useTranslations } from "next-intl";
import type { DayUseProduct } from "@/lib/api";
import type { BookingState } from "./types";
import {
  formatMoneyAmount,
  localizedName,
  parseMoney,
} from "./bookingMedia";

const GOLD = "rgba(212,175,55,0.9)";
const TEXT_PRIMARY = "#F8F2E7";
const TEXT_MUTED = "rgba(248,242,231,0.55)";

interface StepDayUseProductProps {
  state: BookingState;
  products: DayUseProduct[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  locale: "en" | "ar";
  onReload: () => void;
  onSelectProduct: (productId: number) => void;
}

export function StepDayUseProduct({
  state,
  products,
  status,
  error,
  locale,
  onReload,
  onSelectProduct,
}: StepDayUseProductProps) {
  const t = useTranslations("bookNow");
  const reduceMotion = useReducedMotion();
  // null (hydration) or true → no fade-from-zero; otherwise cards stay opacity:0 forever
  const enterFrom =
    reduceMotion === false ? { opacity: 0, y: 10 } : false;

  if (status === "loading" || status === "idle") {
    return (
      <div aria-busy="true" aria-live="polite">
        <StepHeading t={t} />
        <div style={panelStyle}>{t("dayUseProduct.loading")}</div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div>
        <StepHeading t={t} />
        <div
          role="alert"
          style={{
            borderRadius: "14px",
            border: "1px solid rgba(220,160,100,0.35)",
            background: "rgba(220,160,100,0.06)",
            padding: "24px",
          }}
        >
          <p style={{ color: TEXT_PRIMARY, marginBottom: "10px" }}>
            {error ?? t("dayUseProduct.errorFallback")}
          </p>
          <button type="button" onClick={onReload} style={ghostButtonStyle}>
            {t("dayUseProduct.tryAgain")}
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div>
        <StepHeading t={t} />
        <div role="status" style={panelStyle}>
          {t("dayUseProduct.empty")}
        </div>
      </div>
    );
  }

  return (
    <div>
      <StepHeading t={t} />
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "14px",
          color: TEXT_MUTED,
          marginBottom: "28px",
          maxWidth: "480px",
          lineHeight: 1.7,
        }}
      >
        {t("dayUseProduct.subtitle")}
      </p>

      <div className="grid gap-4">
        {products.map((product, index) => {
          const selected = state.dayUse.productId === product.id;
          const amount = parseMoney(product.price_per_guest);
          const priceLabel =
            amount == null
              ? product.price_per_guest
              : formatMoneyAmount(amount, product.currency, locale);

          return (
            <motion.button
              key={product.id}
              type="button"
              initial={enterFrom}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: reduceMotion === false ? index * 0.05 : 0,
              }}
              onClick={() => onSelectProduct(product.id)}
              aria-pressed={selected}
              className="text-left transition-all duration-300"
              style={{
                padding: "22px 20px",
                borderRadius: "16px",
                border: selected
                  ? "1px solid rgba(212,175,55,0.55)"
                  : "1px solid rgba(255,255,255,0.08)",
                background: selected
                  ? "linear-gradient(160deg, rgba(212,175,55,0.12), rgba(255,255,255,0.02))"
                  : "rgba(255,255,255,0.02)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div className="min-w-0">
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "22px",
                    color: TEXT_PRIMARY,
                    marginBottom: "8px",
                    fontWeight: 400,
                  }}
                >
                  {localizedName(product, locale)}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "18px",
                    color: GOLD,
                    fontWeight: 500,
                    marginBottom: "2px",
                  }}
                >
                  {priceLabel}
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "12px",
                    color: TEXT_MUTED,
                    letterSpacing: "0.06em",
                  }}
                >
                  {t("dayUseProduct.perGuest")}
                </p>
              </div>
              <span
                aria-hidden
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "999px",
                  flexShrink: 0,
                  display: "grid",
                  placeItems: "center",
                  border: selected
                    ? "1px solid rgba(212,175,55,0.7)"
                    : "1px solid rgba(255,255,255,0.14)",
                  background: selected
                    ? "rgba(212,175,55,0.9)"
                    : "transparent",
                  color: selected ? "#0D0B08" : TEXT_MUTED,
                }}
              >
                <Plus size={16} strokeWidth={2.2} />
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function StepHeading({
  t,
}: {
  t: ReturnType<typeof useTranslations<"bookNow">>;
}) {
  return (
    <>
      <p
        style={{
          fontFamily: "var(--font-body)",
          fontSize: "11px",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: GOLD,
          fontWeight: 500,
          marginBottom: "10px",
        }}
      >
        {t("dayUseProduct.eyebrow")}
      </p>
      <h2
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(24px, 3vw, 36px)",
          fontWeight: 400,
          color: TEXT_PRIMARY,
          marginBottom: "12px",
        }}
      >
        {t("dayUseProduct.title")}
      </h2>
    </>
  );
}

const panelStyle: CSSProperties = {
  borderRadius: "14px",
  border: "1px solid rgba(255,255,255,0.06)",
  padding: "28px",
  color: TEXT_MUTED,
  fontFamily: "var(--font-body)",
  fontSize: "14px",
  lineHeight: 1.7,
};

const ghostButtonStyle: CSSProperties = {
  fontFamily: "var(--font-body)",
  fontSize: "12px",
  letterSpacing: "0.08em",
  textTransform: "uppercase",
  color: TEXT_PRIMARY,
  background: "transparent",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: "9px",
  padding: "10px 16px",
  cursor: "pointer",
};
