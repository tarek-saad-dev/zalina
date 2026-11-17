"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CalendarDays, Check, Minus, Plus, ShieldCheck, Ticket, RefreshCw } from "lucide-react";
import { getEventAvailability } from "@/lib/events/api";
import {
  formattedEventDate,
  formattedEventMoney,
  localized,
  type EventAvailability,
  type EventDetail,
  type EventLocale,
  type EventPackage,
} from "@/lib/events/domain";

type AvailabilityState =
  | { state: "idle" | "loading" | "error"; data: null }
  | { state: "ready"; data: EventAvailability };

const words = {
  en: {
    packages: "Choose your experience",
    session: "Select your evening",
    includes: "What's included",
    one: "per person", pack: "per package",
    sold: "Sold out", upcoming: "Bookings open soon", closed: "Reservations closed",
    cancelled: "Cancelled", availability: "Live availability",
    error: "Could not check availability. Please retry.",
    retry: "Check again", checking: "Checking available places...",
    quantity: "Number of packages", total: "Estimated total",
    people: "Guests", confirm: "Your selection", book: "Proceed to booking",
    pending: "Continue to booking. The final amount is confirmed by the booking server.",
    note: "Final availability and total are confirmed by the booking API before payment.",
    missing: "No packages have been published for this event.",
    choose: "Choose an available date and package to review your selection.",
    preview: "Development preview — no real reservation or payment",
  },
  ar: {
    packages: "اختار تجربتك",
    session: "حدد موعد الأمسية",
    includes: "تشمل الباقة",
    one: "للفرد", pack: "للباقة",
    sold: "اكتمل العدد", upcoming: "الحجز يفتح قريبًا", closed: "الحجز مغلق",
    cancelled: "تم إلغاء المناسبة", availability: "التوافر الحالي",
    error: "تعذر التأكد من الأماكن المتاحة. حاول مرة أخرى.",
    retry: "إعادة المحاولة", checking: "جارٍ التحقق من الأماكن المتاحة...",
    quantity: "عدد الباقات", total: "الإجمالي التقديري",
    people: "عدد الضيوف", confirm: "اختيارك", book: "استكمل الحجز",
    pending: "استكمل الحجز، والسيرفر هيأكد السعر النهائي قبل الدفع.",
    note: "يُعتمد التوافر والسعر النهائي من سيرفر الحجز قبل الدفع.",
    missing: "لم تُنشر باقات لهذه المناسبة بعد.",
    choose: "اختر موعدًا وباقة متاحة لمراجعة اختيارك.",
    preview: "معاينة تطوير — بدون حجز أو دفع حقيقي",
  },
} as const;

function pricePer(unit: EventPackage, locale: EventLocale) {
  const copy = words[locale];
  return unit.pricing_mode === "per_package" ? copy.pack : copy.one;
}

export function EventPackageSelector({ event, isDemo }: { event: EventDetail; isDemo: boolean }) {
  const locale = (useLocale() === "ar" ? "ar" : "en") as EventLocale;
  const t = words[locale];
  const [occurrenceId, setOccurrenceId] = useState<number | null>(
    event.occurrences.find((o) => o.booking_status === "open")?.id ?? event.occurrences[0]?.id ?? null
  );
  const [packageId, setPackageId] = useState<number | null>(event.packages[0]?.id ?? null);
  const [quantity, setQuantity] = useState(event.packages[0]?.min_quantity ?? 1);
  const [availability, setAvailability] = useState<AvailabilityState>({ state: "idle", data: null });
  const [retryNonce, setRetryNonce] = useState(0);

  const occurrence = event.occurrences.find((item) => item.id === occurrenceId) ?? null;
  const bookable = event.booking_status === "open" && occurrence?.booking_status === "open";

  useEffect(() => {
    if (!occurrenceId || !bookable) {
      setAvailability({ state: "idle", data: null });
      return;
    }
    const controller = new AbortController();
    setAvailability({ state: "loading", data: null });
    void getEventAvailability(event.slug, occurrenceId, locale, isDemo, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) setAvailability({ state: "ready", data: result });
      })
      .catch(() => {
        if (!controller.signal.aborted) setAvailability({ state: "error", data: null });
      });
    return () => controller.abort();
  }, [event.slug, occurrenceId, locale, isDemo, bookable, retryNonce]);

  const selected = event.packages.find((item) => item.id === packageId) ?? null;
  const availabilityLine = availability.state === "ready" && selected
    ? availability.data.packages.find((line) => line.package_id === selected.id) ?? null
    : null;
  const maxQuantity = selected && availabilityLine
    ? Math.min(selected.max_quantity, availabilityLine.remaining_units)
    : selected?.max_quantity ?? 1;
  const eligible = bookable && availability.state === "ready"
    && availabilityLine?.available === true && selected != null
    && quantity >= selected.min_quantity && quantity <= maxQuantity;
  const estimate = useMemo(() => {
    if (!availabilityLine || !selected) return null;
    return (Number(availabilityLine.unit_price) * quantity).toFixed(2);
  }, [availabilityLine, selected, quantity]);
  const guests = selected ? selected.guests_per_unit * quantity : 0;

  function choosePackage(pkg: EventPackage) {
    setPackageId(pkg.id);
    setQuantity(pkg.min_quantity);
  }

  return (
    <section id="event-packages" aria-labelledby="event-package-heading" className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 sm:py-20 lg:px-12">
      <div className="mb-10">
        <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#C9A35C]">
          ZALINA COLLECTION
        </span>
        <h2 id="event-package-heading" className="mt-3 text-[clamp(2rem,4vw,3.6rem)] text-[#F6F0E8]">{t.packages}</h2>
      </div>

      {event.occurrences.length > 0 ? (
        <div className="mb-10">
          <h3 className="mb-4 flex items-center gap-2 text-lg text-[#F6F0E8]">
            <CalendarDays size={20} className="text-[#C9A35C]" aria-hidden="true" /> {t.session}
          </h3>
          <div className="flex flex-wrap gap-3">
            {event.occurrences.map((slot) => {
              const disabled = slot.booking_status !== "open" || event.booking_status !== "open";
              return (
                <button
                  key={slot.id}
                  type="button"
                  onClick={() => setOccurrenceId(slot.id)}
                  aria-pressed={occurrenceId === slot.id}
                  className={`min-h-[58px] min-w-[170px] rounded-sm border px-5 py-3 text-start transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C9A35C] ${occurrenceId === slot.id
                    ? "border-[#C9A35C] bg-[#C9A35C]/[0.09]"
                    : "border-[#C9A35C]/20 bg-[#100e0c] hover:border-[#C9A35C]/55"}`}
                >
                  <span className="block text-sm text-[#F6F0E8]">{localized(slot, "label", locale) || formattedEventDate(slot.starts_at, locale)}</span>
                  <span className="mt-1 block text-xs text-[#C4BEB6]">
                    {disabled ? slot.booking_status === "sold_out" ? t.sold : slot.booking_status === "upcoming" ? t.upcoming : slot.booking_status === "cancelled" ? t.cancelled : t.closed : formattedEventDate(slot.starts_at, locale)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      {event.packages.length === 0 ? (
        <p className="border border-[#C9A35C]/20 p-8 text-center text-[#C4BEB6]">{t.missing}</p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {event.packages.map((pkg) => {
            const line = availability.state === "ready"
              ? availability.data.packages.find((item) => item.package_id === pkg.id) : null;
            const unavailable = !bookable || (availability.state === "ready" && (!line?.available || line.remaining_units < pkg.min_quantity));
            return (
              <button
                key={pkg.id}
                type="button"
                onClick={() => choosePackage(pkg)}
                aria-pressed={packageId === pkg.id}
                className={`flex h-full flex-col rounded-sm border p-6 text-start transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A35C] ${packageId === pkg.id
                  ? "border-[#C9A35C] bg-[#16120d]"
                  : "border-[#C9A35C]/20 bg-[#0A0908] hover:border-[#C9A35C]/55"}`}
              >
                <div className="flex w-full items-start justify-between gap-3">
                  <h3 className="text-[clamp(1.4rem,2.4vw,1.9rem)] leading-tight text-[#F6F0E8]">{localized(pkg, "name", locale)}</h3>
                  {packageId === pkg.id ? <Check className="shrink-0 text-[#C9A35C]" aria-hidden="true" /> : null}
                </div>
                <p className="mt-3 min-h-[48px] text-sm text-[#C4BEB6]">{localized(pkg, "description", locale)}</p>
                <p className="mt-5 text-xl font-medium text-[#E1BE82]">{formattedEventMoney(line?.unit_price ?? pkg.price, line?.currency ?? pkg.currency, locale)}</p>
                <p className="mt-1 text-xs text-[#C4BEB6]">{pricePer(pkg, locale)}</p>
                <div className="my-6 h-px w-full bg-[#C9A35C]/15" />
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#C9A35C]">{t.includes}</p>
                <ul className="space-y-3">
                  {(locale === "ar" ? pkg.includes_ar : pkg.includes_en).map((inclusion, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-[#C4BEB6]">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#C9A35C]" aria-hidden="true" />
                      {inclusion}
                    </li>
                  ))}
                </ul>
                {unavailable ? <p className="mt-auto pt-6 text-xs font-semibold text-[#E1BE82]">
                  {event.booking_status === "upcoming" ? t.upcoming : event.booking_status === "cancelled" ? t.cancelled : t.sold}
                </p> : null}
              </button>
            );
          })}
        </div>
      )}

      {bookable && availability.state === "loading" ? (
        <div role="status" className="mt-6 flex items-center gap-2 text-sm text-[#C4BEB6]">
          <RefreshCw size={17} className="animate-spin text-[#C9A35C]" aria-hidden="true" /> {t.checking}
        </div>
      ) : null}
      {bookable && availability.state === "error" ? (
        <div role="alert" className="mt-6 flex flex-wrap items-center gap-4 rounded-sm border border-[#C9A35C]/35 bg-[#18120d] p-4 text-sm text-[#F6F0E8]">
          {t.error}
          <button type="button" onClick={() => setRetryNonce((value) => value + 1)} className="inline-flex min-h-[40px] items-center gap-2 border border-[#C9A35C] px-4 text-[#E1BE82]">
            <RefreshCw size={15} aria-hidden="true" /> {t.retry}
          </button>
        </div>
      ) : null}

      {selected ? (
        <div className="mt-10 grid gap-8 rounded-sm border border-[#C9A35C]/25 bg-[#100e0c] p-6 sm:p-8 lg:grid-cols-[1fr_340px] lg:p-10">
          <div>
            <h3 className="flex items-center gap-2 text-2xl text-[#F6F0E8]">
              <Ticket size={21} className="text-[#C9A35C]" aria-hidden="true" /> {t.confirm}
            </h3>
            <p className="mt-3 text-[#C4BEB6]">{localized(selected, "name", locale)}</p>
            {occurrence ? <p className="mt-2 text-sm text-[#C4BEB6]">{formattedEventDate(occurrence.starts_at, locale)}</p> : null}
            <p className="mt-5 text-xs text-[#C4BEB6]">{t.note}</p>
          </div>
          <div>
            <label htmlFor="event-units" className="mb-3 block text-sm text-[#F6F0E8]">{t.quantity}</label>
            <div className="flex items-center justify-between border border-[#C9A35C]/25 bg-[#050505]">
              <button type="button" aria-label={locale === "ar" ? "تقليل العدد" : "Decrease quantity"} disabled={!bookable || quantity <= selected.min_quantity} onClick={() => setQuantity(q => Math.max(selected.min_quantity, q - 1))} className="flex h-12 w-12 items-center justify-center disabled:opacity-30">
                <Minus size={18} aria-hidden="true" />
              </button>
              <output id="event-units" aria-live="polite" className="text-lg text-[#F6F0E8]">{quantity}</output>
              <button type="button" aria-label={locale === "ar" ? "زيادة العدد" : "Increase quantity"} disabled={!bookable || quantity >= maxQuantity} onClick={() => setQuantity(q => Math.min(maxQuantity, q + 1))} className="flex h-12 w-12 items-center justify-center disabled:opacity-30">
                <Plus size={18} aria-hidden="true" />
              </button>
            </div>
            <p className="mt-3 text-xs text-[#C4BEB6]">{t.people}: {guests}</p>
            <div className="mt-5 flex items-end justify-between gap-3 border-t border-[#C9A35C]/20 pt-5">
              <span className="text-sm text-[#C4BEB6]">{t.total}</span>
              <strong className="text-xl font-medium text-[#E1BE82]">{formattedEventMoney(estimate, availabilityLine?.currency ?? selected.currency, locale)}</strong>
            </div>
            {eligible && selected && occurrenceId ? (
              <Link
                href={`/events/${event.slug}/book?occurrence_id=${occurrenceId}&package_id=${selected.id}&quantity=${quantity}`}
                className="mt-5 flex min-h-[50px] w-full items-center justify-center rounded-sm bg-[#C9A35C] px-4 text-center text-sm font-semibold text-[#050505] transition-colors hover:bg-[#E1BE82] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E1BE82]"
              >
                {t.book}
              </Link>
            ) : (
              <button type="button" disabled className="mt-5 flex min-h-[50px] w-full items-center justify-center rounded-sm bg-[#C9A35C] px-4 text-sm font-semibold text-[#050505] opacity-40">
                {t.book}
              </button>
            )}
            <p className="mt-3 text-center text-xs leading-relaxed text-[#C4BEB6]">{isDemo ? t.preview : t.pending}</p>
            {!eligible ? <p className="mt-2 text-center text-xs text-[#C4BEB6]">{t.choose}</p> : null}
          </div>
        </div>
      ) : null}
      <p className="mt-7 flex items-center justify-center gap-2 text-xs text-[#C4BEB6]">
        <ShieldCheck size={17} className="text-[#C9A35C]" aria-hidden="true" /> {t.note}
      </p>
    </section>
  );
}
