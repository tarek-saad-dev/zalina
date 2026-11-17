"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Clock3, Sparkles, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { DayUseProduct } from "@/lib/api";
import { formatMoneyAmount } from "./bookingMedia";
import { PRODUCT_OPTIONS } from "./bookingSteps";
import { productsForTicketChoice } from "./ticketProducts";
import type { BookingState, TicketChoice } from "./types";

const GOLD = "#D9B96C";
const TEXT = "#F9F3E8";

type TicketVisual = {
  src: string;
  alt: string;
  number: string;
  position: string;
};

const VISUALS: Record<TicketChoice, TicketVisual> = {
  day_use: {
    src: "/assets/day-experience.webp",
    alt: "Zalina Arabian Village daytime atmosphere",
    number: "01",
    position: "center",
  },
  observatory_experience: {
    src: "/assets/night-experience.webp",
    alt: "Evening atmosphere at Zalina Arabian Village",
    number: "02",
    position: "center",
  },
  cabin_stay: {
    src: "/assets/night.webp",
    alt: "Nighttime ambience at Zalina Arabian Village",
    number: "03",
    position: "center",
  },
};

interface StepProductProps {
  state: BookingState;
  dayUseProducts: DayUseProduct[];
  onSetTicketChoice: (choice: TicketChoice) => void;
  observatoryAvailable: boolean;
}

/** Never fabricate a price. If currencies differ, don't show a misleading "from" quote. */
export function lowestPublishedPrice(
  products: DayUseProduct[],
  ticket: TicketChoice
): { amount: number; currency: string } | null {
  const eligible = productsForTicketChoice(products, ticket)
    .filter((item) => Number.isFinite(Number(item.price_per_guest)) && Number(item.price_per_guest) >= 0 && item.currency.trim());
  const currencies = new Set(eligible.map((item) => item.currency));
  if (!eligible.length || currencies.size !== 1) return null;
  return {
    amount: Math.min(...eligible.map((item) => Number(item.price_per_guest))),
    currency: eligible[0].currency,
  };
}

export function StepProduct({
  state,
  dayUseProducts,
  onSetTicketChoice,
  observatoryAvailable,
}: StepProductProps) {
  const t = useTranslations("bookNow");
  const locale = useLocale();
  const rtl = locale === "ar";
  const reduceMotion = useReducedMotion();
  const selected = state.ticketChoice ??
    (state.productType === "bubble_stay" ? "cabin_stay" : state.productType);
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  return (
    <section className="zalina-ticket-picker" aria-labelledby="zalina-ticket-title">
      <div className="mx-auto mb-9 max-w-3xl text-center md:mb-12">
        <div className="mb-5 flex items-center justify-center gap-3">
          <span className="h-px w-10" style={{ background: "rgba(217,185,108,0.5)" }} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.25em]" style={{ color: GOLD }}>
            {t("products.collection")}
          </span>
          <span className="h-px w-10" style={{ background: "rgba(217,185,108,0.5)" }} />
        </div>
        <h1
          id="zalina-ticket-title"
          className="text-[clamp(34px,4.5vw,56px)] leading-[1.13]"
          style={{ color: TEXT, fontFamily: "var(--font-display)", fontWeight: 400 }}
        >
          {t("products.title")}
        </h1>
        <p
          className="mx-auto mt-4 max-w-[560px] text-sm leading-7 md:text-base"
          style={{ color: "rgba(249,243,232,0.72)" }}
        >
          {t("products.subtitle")}
        </p>
        <div className="mt-5 inline-flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs" style={{ color: "rgba(249,243,232,0.7)" }}>
          <span className="inline-flex items-center gap-2"><Users size={14} style={{ color: GOLD }} />{t("products.perGuestHint")}</span>
          <span className="inline-flex items-center gap-2"><Check size={14} style={{ color: GOLD }} />{t("products.realTimeHint")}</span>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        {PRODUCT_OPTIONS.map((option, index) => {
          const visual = VISUALS[option.id];
          const soon = Boolean(option.comingSoon || (option.id === "observatory_experience" && !observatoryAvailable));
          const isSelected = selected === option.id;
          const price = soon ? null : lowestPublishedPrice(dayUseProducts, option.id);
          const priceText = price
            ? formatMoneyAmount(price.amount, price.currency, rtl ? "ar" : "en")
            : null;

          const cardContents = (
            <>
              <div className="relative h-[208px] overflow-hidden sm:h-[230px] lg:h-[252px]">
                <Image
                  src={visual.src}
                  alt={visual.alt}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.045]"
                  style={{ objectPosition: visual.position }}
                />
                <div className="absolute inset-0" style={{
                  background: "linear-gradient(180deg,rgba(5,4,3,0.14) 0%,rgba(5,4,3,0.04) 48%,rgba(12,10,8,0.8) 100%)",
                }} />
                <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-full border text-xs font-semibold"
                    style={{ borderColor: "rgba(255,245,223,0.54)", color: "#FFF6E8", background: "rgba(11,10,8,0.32)", backdropFilter: "blur(8px)" }}
                  >
                    {visual.number}
                  </span>
                  {option.id === "observatory_experience" && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.12em]" style={{
                      borderColor: "rgba(217,185,108,0.5)",
                      background: "rgba(16,13,9,0.72)",
                      color: "#F6DC9D",
                      backdropFilter: "blur(8px)",
                    }}>
                      <Sparkles size={12}/>{t("products.signature")}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5 sm:p-6 lg:p-7" style={{ background: "linear-gradient(170deg,#191713 0%,#12110F 100%)" }}>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.21em]" style={{ color: GOLD }}>
                  {t(`products.${option.messageKey}.tag`)}
                </p>
                <h2 className="text-[clamp(26px,2.25vw,34px)] leading-[1.18]" style={{
                  color: TEXT, fontFamily: "var(--font-display)", fontWeight: 400,
                }}>
                  {t(`products.${option.messageKey}.title`)}
                </h2>
                <p className="mt-3 min-h-[56px] text-[13px] leading-[1.75] sm:text-sm" style={{ color: "rgba(249,243,232,0.68)" }}>
                  {t(`products.${option.messageKey}.description`)}
                </p>
                <div className="mt-auto pt-6">
                  {priceText && (
                    <p className="mb-4 text-sm" style={{ color: "#F3E8D0" }}>
                      <span className="text-[11px]" style={{ color: "rgba(249,243,232,0.55)" }}>{t("products.from")} </span>
                      <strong className="text-lg font-medium" style={{ color: GOLD }}>{priceText}</strong>
                      <span className="ms-1 text-xs" style={{ color: "rgba(249,243,232,0.65)" }}>/ {t("dayUseProduct.perGuest")}</span>
                    </p>
                  )}
                  <div
                    className="flex min-h-[52px] items-center justify-between gap-3 rounded-xl px-4 text-sm font-semibold"
                    style={soon ? {
                      border: "1px solid rgba(217,185,108,0.24)",
                      color: "#D9BF8F",
                      background: "rgba(217,185,108,0.06)",
                    } : {
                      color: "#17120B",
                      background: "linear-gradient(115deg,#E5C780,#CBA65D)",
                      boxShadow: "0 8px 25px rgba(196,154,70,0.1)",
                    }}
                  >
                    <span className="inline-flex items-center gap-2">
                      {soon && <Clock3 size={16} />}
                      {soon ? t("products.comingSoon") : t("products.selectTicket")}
                    </span>
                    {!soon && <Arrow size={18} aria-hidden />}
                  </div>
                </div>
              </div>
            </>
          );

          const sharedClass =
            "group relative flex min-w-0 flex-col overflow-hidden rounded-[22px] text-start transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9B96C]";
          const sharedStyle = {
            border: isSelected ? "1px solid #D9B96C" : "1px solid rgba(217,185,108,0.22)",
            boxShadow: isSelected ? "0 15px 45px rgba(217,185,108,0.14)" : "0 15px 40px rgba(0,0,0,0.22)",
          };

          return soon ? (
            <motion.article
              key={option.id}
              initial={reduceMotion === false ? { opacity: 0, y: 14 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.36, delay: reduceMotion === false ? index * 0.07 : 0 }}
              aria-disabled="true"
              className={sharedClass}
              style={sharedStyle}
            >
              {cardContents}
            </motion.article>
          ) : (
            <motion.button
              key={option.id}
              type="button"
              onClick={() => onSetTicketChoice(option.id)}
              initial={reduceMotion === false ? { opacity: 0, y: 14 } : false}
              animate={{ opacity: 1, y: 0 }}
              whileHover={reduceMotion === false ? { y: -4 } : undefined}
              transition={{ duration: 0.36, delay: reduceMotion === false ? index * 0.07 : 0 }}
              aria-label={t("products.chooseTicketAria", { name: t(`products.${option.messageKey}.title`) })}
              aria-pressed={isSelected}
              className={sharedClass}
              style={sharedStyle}
            >
              {cardContents}
            </motion.button>
          );
        })}
      </div>
      <p className="mx-auto mt-7 max-w-xl text-center text-xs leading-6" style={{ color: "rgba(249,243,232,0.52)" }}>
        {t("products.availabilityNote")}
      </p>
    </section>
  );
}
