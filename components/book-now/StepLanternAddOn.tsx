"use client";
import { useTranslations } from "next-intl";
import { Sparkles, Check } from "lucide-react";
import type { BookableTicketAddOn } from "@/lib/api";
import type { BookingState } from "./types";
import { formatMoneyAmount } from "./bookingMedia";

export function StepLanternAddOn({state, option, status, locale, onToggle}: {
  state: BookingState;
  option: BookableTicketAddOn | null;
  status: "loading" | "ready" | "error";
  locale: "en" | "ar";
  onToggle: () => void;
}) {
  const t = useTranslations("bookNow");
  const selected = Boolean(option && state.lanternAddOnId === option.id);
  const available = Boolean(option);
  return (
    <section className="mt-8 rounded-2xl border p-5 md:p-6" style={{borderColor: selected ? "rgba(212,175,55,0.5)" : "rgba(212,175,55,0.18)",background:"rgba(212,175,55,0.035)"}} aria-label={t("lantern.title")}>
      <div className="flex items-start gap-4">
        <span className="rounded-xl p-3 flex-shrink-0" style={{background:"rgba(212,175,55,0.12)",color:"#D4AF37"}}><Sparkles size={22}/></span>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap justify-between gap-2 items-baseline">
            <h3 className="text-xl" style={{fontFamily:"var(--font-display)",color:"#F8F2E7"}}>{t("lantern.title")}</h3>
            {option && <strong className="text-sm" style={{color:"#D4AF37"}}>{formatMoneyAmount(Number(option.price_per_guest),option.currency,locale)} · {t("lantern.perGuest")}</strong>}
          </div>
          <p className="text-sm mt-2" style={{color:"rgba(248,242,231,0.64)",lineHeight:1.7}}>{t("lantern.description")}</p>
          {option ? (
            <button type="button" onClick={onToggle} aria-pressed={selected} className="mt-4 inline-flex items-center gap-2 rounded-lg border px-4 py-3 text-sm" style={{color:selected?"#D4AF37":"#F8F2E7",borderColor:"rgba(212,175,55,0.4)",background:selected?"rgba(212,175,55,0.12)":"transparent"}}>
              {selected ? <Check size={16}/> : <Sparkles size={16}/>}
              {t(selected ? "lantern.selected" : "lantern.select",{count:state.dayUse.guests})}
            </button>
          ) : (
            <p className="mt-4 text-xs" role="status" style={{color:"rgba(248,242,231,0.48)"}}>{status === "loading" ? t("lantern.loading") : t("lantern.comingSoon")}</p>
          )}
          {available && <p className="mt-3 text-xs" style={{color:"rgba(248,242,231,0.48)"}}>{t("lantern.note")}</p>}
        </div>
      </div>
    </section>
  );
}
