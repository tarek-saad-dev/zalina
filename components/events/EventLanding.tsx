"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createEventBooking, eventQuantitiesValid, getEventAvailability, type EventAvailability, type EventEdition, type EventStatusOnly } from "@/lib/api/events";
import { eventCanPurchase } from "@/lib/api/event-view";
import { ApiError } from "@/lib/api/types";

export function EventLanding({ event, locale, preview }: { event: EventEdition | EventStatusOnly; locale: string; preview: boolean }) {
  const ar = locale === "ar";
  const router = useRouter();
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [availability, setAvailability] = useState<EventAvailability | null>(null);
  const [disabled, setDisabled] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const inFlight = useRef(false);
  const full = "packages" in event;
  const packages = full ? event.packages.map(p => ({ ...p, ...(availability?.packages.find(a => a.id === p.id) ?? (availability ? { is_purchasable: false } : {})) })) : [];
  const capacity = availability ? availability.remaining_guest_capacity : full ? event.remaining_guest_capacity : null;
  const allowed = full && !preview && !disabled && eventCanPurchase(event) && (!availability || (availability.sales_enabled && availability.availability_state === "booking_open"));
  const valid = allowed && eventQuantitiesValid(packages, quantities, capacity);
  const date = (value: string | null) => value ? new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Cairo" }).format(new Date(value)) : "";
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || inFlight.current) return;
    inFlight.current = true; setBusy(true); setMessage("");
    const form = new FormData(e.currentTarget);
    try {
      const booking = await createEventBooking({ event_edition_id: event.event_edition_id, packages: Object.entries(quantities).filter(([, q]) => q > 0).map(([id, quantity]) => ({ package_id: Number(id), quantity })), guest_name: String(form.get("name") || "").trim(), guest_email: String(form.get("email") || "").trim(), guest_phone: String(form.get("phone") || "").trim() }, locale);
      router.push(`/${locale}/events/booking/${encodeURIComponent(booking.booking_reference)}`);
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        if (error.errors?.product_type) setDisabled(true);
        if (error.errors?.event_edition_id) router.refresh();
        if (error.errors?.packages) {
          try { setAvailability(await getEventAvailability(event.slug, locale)); setQuantities({}); } catch { setDisabled(true); }
        }
        setMessage(ar ? "تغير التوافر أو توجد بيانات غير صحيحة. يرجى المراجعة." : "Availability changed or some details are invalid. Please review your selection.");
      } else {
        // An uncertain create must not be repeated automatically.
        setDisabled(true);
        setMessage(ar ? "تعذر تأكيد الحجز. يرجى التواصل معنا قبل المحاولة مجدداً." : "We could not confirm whether the booking was created. Please contact us before trying again.");
      }
    } finally { inFlight.current = false; setBusy(false); }
  }
  const labels: Record<string, string> = ar ? { sales_not_open: "الحجز لم يفتح بعد", booking_open: "الحجز متاح", sold_out: "نفدت التذاكر", sales_closed: "أُغلق الحجز", archived: "انتهت الفعالية", cancelled: "أُلغيت الفعالية" } : { sales_not_open: "Sales have not opened", booking_open: "Booking open", sold_out: "Sold out", sales_closed: "Sales closed", archived: "Event archived", cancelled: "Event cancelled" };
  return <main className="page-atmosphere min-h-screen px-6 py-16 text-[#f8f2e7]"><div className="mx-auto max-w-5xl space-y-8">
    {preview && <p className="text-[#d4af37]">{ar ? "معاينة فقط — الحجز غير متاح" : "Preview only — booking is disabled"}</p>}
    <h1 className="text-4xl md:text-5xl">{ar ? event.name_ar : event.name_en}</h1><p role="status" className="text-[#d4af37]">{labels[event.availability_state]}</p>
    {full && <><p className="whitespace-pre-line opacity-80">{ar ? event.description_ar : event.description_en}</p><p>{date(event.event_starts_at)}{event.event_ends_at && ` — ${date(event.event_ends_at)}`}</p>
      <form onSubmit={submit} className="space-y-6"><div className="grid gap-4 md:grid-cols-2">{packages.filter(p => p.is_active).map(p => <div key={p.id} className="rounded-xl border border-white/15 p-5"><h2 className="text-xl">{ar ? p.name_ar : p.name_en}</h2><p className="mt-2 opacity-75">{ar ? p.description_ar : p.description_en}</p><p className="mt-2">{p.website_price} {event.currency} · {p.guests_per_package} {ar ? "ضيوف" : "guests"}</p>{allowed && p.is_purchasable && <label className="mt-4 block">{ar ? "الكمية" : "Quantity"}<input className="ml-3 w-24 rounded bg-white/10 p-2" type="number" min="0" step="1" value={quantities[p.id] || 0} onChange={e => setQuantities({ ...quantities, [p.id]: Number(e.target.value) })} /></label>}</div>)}</div>
      {allowed && <><p className="opacity-70">{ar ? "الأسعار تقديرية؛ المبلغ النهائي يؤكده الحجز." : "Prices are estimates; your booking confirms the final total."}</p><div className="grid gap-4 md:grid-cols-3">{[["name", ar ? "الاسم" : "Name", "text"], ["email", ar ? "البريد الإلكتروني" : "Email", "email"], ["phone", ar ? "الهاتف" : "Phone", "tel"]].map(([name, label, type]) => <label key={name}>{label}<input required name={name} type={type} className="mt-2 block w-full rounded border border-white/20 bg-white/10 p-3" /></label>)}</div><button disabled={!valid || busy} className="rounded bg-[#d4af37] px-6 py-3 text-black disabled:opacity-40">{busy ? (ar ? "جارٍ الحجز…" : "Booking…") : (ar ? "احجز الآن" : "Book now")}</button></>}{message && <p role="alert">{message}</p>}</form></>}
  </div></main>;
}
