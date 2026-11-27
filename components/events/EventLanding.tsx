"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createEventBooking, eventQuantitiesValid, getEventAvailability, type EventAvailability, type EventEdition, type EventStatusOnly } from "@/lib/api/events";
import { eventCanPurchase } from "@/lib/api/event-view";
import { eventEstimate, eventMediaUrl } from "@/lib/api/event-media";
import { ApiError } from "@/lib/api/types";

export function EventLanding({ event, locale, preview }: { event: EventEdition | EventStatusOnly; locale: string; preview: boolean }) {
  const ar = locale === "ar";
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [availability, setAvailability] = useState<EventAvailability | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const inFlight = useRef(false);
  const navigated = useRef(false);
  const full = event.availability_state !== "archived" && event.availability_state !== "cancelled" && "packages" in event;
  const packages = full ? event.packages.map(p => {
    if (!availability) return p;
    const matches = availability.packages.filter(a => a.id === p.id);
    return { ...p, ...(matches.length === 1 ? matches[0] : {}), is_purchasable: p.is_purchasable === true && matches.length === 1 && matches[0].is_purchasable === true };
  }) : [];
  const capacity = availability ? availability.remaining_guest_capacity : full ? event.remaining_guest_capacity : null;
  const allowed = full && !preview && !disabled && event.public_sales_enabled === true && eventCanPurchase(event) && availability?.sales_enabled === true && availability.availability_state === "booking_open";
  const valid = allowed && eventQuantitiesValid(packages.map(p => ({ ...p, is_purchasable: p.is_active === true && p.is_purchasable === true })), quantities, capacity);
  const [retryUntil, setRetryUntil] = useState(0);
  const [clock, setClock] = useState(Date.now());
  useEffect(() => { if (retryUntil <= Date.now()) return; const timer = setTimeout(() => setClock(Date.now()), retryUntil - Date.now()); return () => clearTimeout(timer); }, [retryUntil]);
  const [refreshing, setRefreshing] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const lockKey = `event-create-uncertain:${event.slug}`;
  useEffect(() => { if (sessionStorage.getItem(lockKey)) { setUncertain(true); setDisabled(true); } }, [lockKey]);
  async function refreshAvailability() {
    if (refreshing || Date.now() < retryUntil) return null;
    setRefreshing(true);
    try { const next = await getEventAvailability(event.slug, locale); setAvailability(next); return next; }
    catch (error) { if (error instanceof ApiError && error.status === 429) { const value = error.retryAfter; const seconds = value && /^\d+$/.test(value) ? Number(value) * 1000 : value ? Date.parse(value) - Date.now() : 30000; setRetryUntil(Date.now() + Math.min(300000, Math.max(1000, Number.isFinite(seconds) ? seconds : 30000))); setClock(Date.now()); } setAvailability(null); setMessage(ar ? "تعذر تحديث التوافر. يرجى المحاولة لاحقاً." : "Unable to refresh availability. Please try again later."); return null; }
    finally { setRefreshing(false); }
  }
  useEffect(() => { if (full && !preview && event.purchase_enabled) void refreshAvailability(); }, [event.slug, locale, preview]);
  const estimate = eventEstimate(packages.map(p => ({ website_price: p.website_price, quantity: quantities[p.id] || 0 })));
  const guests = packages.reduce((sum, p) => sum + (quantities[p.id] || 0) * p.guests_per_package, 0);
  const date = (value: string | null) => value ? new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Cairo" }).format(new Date(value)) : "";
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || inFlight.current) return;
    inFlight.current = true; setBusy(true); setMessage(""); setFieldErrors({});
    const form = new FormData(e.currentTarget);
    try {
      const latest = await refreshAvailability();
      const latestPackages = packages.map(p => ({ ...p, ...(latest?.packages.find(a => a.id === p.id) ?? { is_purchasable: false }), is_purchasable: p.is_active === true && p.is_purchasable === true && latest?.packages.filter(a => a.id === p.id).length === 1 && latest?.packages.find(a => a.id === p.id)?.is_purchasable === true }));
      if (!latest || latest.sales_enabled !== true || latest.availability_state !== "booking_open" || !eventQuantitiesValid(latestPackages, quantities, latest.remaining_guest_capacity)) { setMessage(ar ? "تغير التوافر. يرجى مراجعة اختيارك." : "Availability changed. Please review your selection."); return; }
      sessionStorage.setItem(lockKey, "1");
      const booking = await createEventBooking({ event_edition_id: event.event_edition_id, packages: Object.entries(quantities).filter(([, q]) => q > 0).map(([id, quantity]) => ({ package_id: Number(id), quantity })), guest_name: String(form.get("name") || "").trim(), guest_email: String(form.get("email") || "").trim(), guest_phone: String(form.get("phone") || "").trim() }, locale);
      sessionStorage.removeItem(lockKey); navigated.current = true;
      router.push(`/${locale}/events/booking/${encodeURIComponent(booking.booking_reference)}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        sessionStorage.removeItem(lockKey); setFieldErrors(error.errors || {});
        if (error.errors?.product_type) setDisabled(true);
        if (error.errors?.event_edition_id) router.refresh();
        if (error.errors?.packages) {
          await refreshAvailability();
        }
        setMessage(ar ? "تغير التوافر أو توجد بيانات غير صحيحة. يرجى المراجعة." : "Availability changed or some details are invalid. Please review your selection.");
      } else {
        // An uncertain create must not be repeated automatically.
        setDisabled(true); setUncertain(true);
        setMessage(ar ? "تعذر تأكيد الحجز. يرجى التواصل معنا قبل المحاولة مجدداً." : "We could not confirm whether the booking was created. Please contact us before trying again.");
      }
    } finally { if (!navigated.current && !sessionStorage.getItem(lockKey)) { inFlight.current = false; setBusy(false); } }
  }
  const labels: Record<string, string> = ar ? { sales_not_open: "الحجز لم يفتح بعد", booking_open: "الحجز متاح", sold_out: "نفدت التذاكر", sales_closed: "أُغلق الحجز", archived: "انتهت الفعالية", cancelled: "أُلغيت الفعالية" } : { sales_not_open: "Sales have not opened", booking_open: "Booking open", sold_out: "Sold out", sales_closed: "Sales closed", archived: "Event archived", cancelled: "Event cancelled" };
  return <main className="page-atmosphere min-h-screen px-4 pb-20 pt-24 text-[var(--zalina-text)] sm:px-6 md:pt-32"><div className="mx-auto max-w-6xl space-y-8 md:space-y-12">
    {preview && <p className="text-[#d4af37]">{ar ? "معاينة فقط — الحجز غير متاح" : "Preview only — booking is disabled"}</p>}
    <header className="space-y-4 border-b border-[var(--border-gold-soft)] pb-7"><p role="status" className="inline-flex rounded-full border border-[var(--border-gold-soft)] bg-[var(--zalina-gold-soft)] px-4 py-2 text-sm text-[var(--zalina-gold-highlight)]">{labels[event.availability_state]}</p><h1 className="text-[length:var(--zalina-text-section)] font-medium leading-tight">{ar ? event.name_ar : event.name_en}</h1></header>
    {uncertain && <p role="alert">{ar ? "قد يكون الحجز قد أُنشئ. تواصل معنا قبل إعادة المحاولة." : "A booking may have been created. Contact us before trying again."}</p>}
    {full && <>{eventMediaUrl(event.cover_url, preview) && <img src={eventMediaUrl(event.cover_url, preview)!} alt="" referrerPolicy="no-referrer" className="aspect-[16/10] max-h-[35rem] w-full rounded-2xl object-cover shadow-2xl md:aspect-[21/9]" />}<p className="max-w-3xl whitespace-pre-line text-[length:var(--zalina-text-body)] leading-relaxed text-[var(--zalina-text-muted)]">{ar ? event.description_ar : event.description_en}</p><p>{date(event.event_starts_at)}{event.event_ends_at && ` — ${date(event.event_ends_at)}`}</p>
      {event.admission_opens_at && <p>{ar ? "الدخول" : "Admission"}: {date(event.admission_opens_at)}{event.admission_closes_at && ` — ${date(event.admission_closes_at)}`}</p>}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">{event.gallery.map((image, i) => { const src = eventMediaUrl(image.url, preview); return src ? <img key={i} src={src} alt="" referrerPolicy="no-referrer" className="aspect-[4/3] w-full rounded-xl object-cover" /> : null; })}</div>
      <form onSubmit={submit} className="space-y-6" aria-busy={busy}><div className="grid gap-4 md:grid-cols-2">{packages.filter(p => p.is_active).map(p => <div key={p.id} className="min-w-0 rounded-2xl border border-[var(--border-gold-soft)] bg-[var(--bg-surface)] p-5 shadow-lg transition-colors hover:border-[var(--zalina-gold)] sm:p-6">{eventMediaUrl(p.image_url, preview) && <img src={eventMediaUrl(p.image_url, preview)!} alt="" referrerPolicy="no-referrer" className="mb-4 aspect-[4/3] w-full rounded-lg object-cover" />}<h2 className="text-xl">{ar ? p.name_ar : p.name_en}</h2><p className="mt-2 opacity-75">{ar ? p.description_ar : p.description_en}</p><p className="mt-2">{p.website_price} {event.currency} · {p.guests_per_package} {ar ? "ضيوف" : "guests"}</p>{allowed && (p.is_purchasable || (quantities[p.id] || 0) > 0) && <label className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">{ar ? "الكمية" : "Quantity"}<input className="min-h-12 w-24 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-center tabular-nums focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--zalina-gold)]" type="number" min="0" step="1" disabled={busy} aria-label={(ar ? "كمية " : "Quantity for ") + (ar ? p.name_ar : p.name_en)} value={quantities[p.id] || 0} onChange={e => setQuantities(previous => ({ ...previous, [p.id]: Number(e.target.value) }))} /></label>}</div>)}</div>
      {!preview && !availability && <button type="button" disabled={refreshing || clock < retryUntil} onClick={() => void refreshAvailability()} className="underline">{ar ? "تحديث التوافر" : "Refresh availability"}</button>}
      {allowed && <>{Object.values(quantities).some(q => q > 0) && !valid && <p role="alert">{ar ? "يرجى تعديل الكميات حسب السعة المتاحة." : "Please adjust quantities to fit the available capacity."}</p>}<p aria-live="polite" className="rounded-xl border border-[var(--border-gold-soft)] bg-[var(--bg-surface)] p-5 text-base font-medium leading-relaxed tabular-nums">{ar ? "تقدير الضيوف" : "Estimated guests"}: {guests} · {ar ? "الإجمالي التقديري" : "Estimated total"}: {estimate ?? "—"} {event.currency}</p><p className="opacity-70">{ar ? "الأسعار تقديرية؛ المبلغ النهائي يؤكده الحجز." : "Prices are estimates; your booking confirms the final total."}</p><div className="grid gap-4 md:grid-cols-3">{[["name", ar ? "الاسم" : "Name", "text"], ["email", ar ? "البريد الإلكتروني" : "Email", "email"], ["phone", ar ? "الهاتف" : "Phone", "tel"]].map(([name, label, type]) => <label key={name}>{label}<input required name={name} type={type} aria-invalid={Boolean(fieldErrors[`guest_${name}`])} autoComplete={name === "name" ? "name" : name === "email" ? "email" : "tel"} disabled={busy} className="mt-2 block min-h-12 w-full rounded-lg border border-white/20 bg-[var(--bg-surface)] p-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--zalina-gold)]" />{fieldErrors[`guest_${name}`]?.map((error, i) => <span key={i} className="block text-sm text-red-300">{error}</span>)}</label>)}</div><button disabled={!valid || busy} className="min-h-12 w-full rounded-lg bg-[var(--zalina-gold)] px-6 py-3 font-semibold text-black transition-colors hover:bg-[var(--zalina-gold-highlight)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--zalina-gold)] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto">{busy ? (ar ? "جارٍ الحجز…" : "Booking…") : (ar ? "احجز الآن" : "Book now")}</button></>}{message && <p role="alert">{message}</p>}</form></>}
  </div></main>;
}
