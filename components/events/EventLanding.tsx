"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowLeft, CalendarDays, Clock3, MapPin, Minus, Plus, Ticket, Users, ShieldCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { createEventBooking, eventQuantitiesValid, getEventAvailability, type EventAvailability, type EventEdition, type EventStatusOnly } from "@/lib/api/events";
import { eventCanPurchase } from "@/lib/api/event-view";
import { eventEstimate, eventMediaUrl } from "@/lib/api/event-media";
import { ApiError } from "@/lib/api/types";
import { sanitizeBookingReference } from "@/components/booking-status/bookingReference";

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
  useEffect(() => { if (retryUntil <= Date.now()) return; const timer = setTimeout(() => setClock(Date.now()), Math.max(0, retryUntil - Date.now()) + 20); return () => clearTimeout(timer); }, [retryUntil]);
  const [refreshing, setRefreshing] = useState(false);
  // Synchronous ownership prevents duplicate availability requests in StrictMode and rapid clicks.
  const availabilityFlight = useRef(false);
  const retryDeadline = useRef(0);
  const [uncertain, setUncertain] = useState(false);
  const lockKey = `event-create-uncertain:${event.slug}`;
  useEffect(() => {
    if (preview) return;
    try {
      if (sessionStorage.getItem(lockKey)) { setUncertain(true); setDisabled(true); }
    } catch {
      setDisabled(true);
      setMessage(ar ? "الحجز غير متاح عند تعطيل التخزين في المتصفح." : "Booking is unavailable when browser storage is disabled.");
    }
  }, [lockKey, preview, ar]);
  async function refreshAvailability() {
    if (availabilityFlight.current || Date.now() < retryDeadline.current) return null;
    availabilityFlight.current = true;
    setRefreshing(true);
    try { const next = await getEventAvailability(event.slug, locale); setAvailability(next); retryDeadline.current = 0; setRetryUntil(0); return next; }
    catch (error) { if (error instanceof ApiError && error.status === 429) { const value = error.retryAfter; const seconds = value && /^\d+$/.test(value) ? Number(value) * 1000 : value ? Date.parse(value) - Date.now() : 30000; retryDeadline.current = Date.now() + Math.min(300000, Math.max(1000, Number.isFinite(seconds) ? seconds : 30000)); setRetryUntil(retryDeadline.current); setClock(Date.now()); } setAvailability(null); setMessage(ar ? "تعذر تحديث التوافر. يرجى المحاولة لاحقاً." : "Unable to refresh availability. Please try again later."); return null; }
    finally { availabilityFlight.current = false; setRefreshing(false); }
  }
  useEffect(() => { if (full && !preview && event.purchase_enabled) void refreshAvailability(); }, [event.slug, locale, preview]);
  const estimate = eventEstimate(packages.map(p => ({ website_price: p.website_price, quantity: quantities[p.id] || 0 })));
  const guests = packages.reduce((sum, p) => sum + (quantities[p.id] || 0) * p.guests_per_package, 0);
  const date = (value: string | null) => value ? new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Cairo" }).format(new Date(value)) : "";
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!valid || inFlight.current) return;
    inFlight.current = true; setBusy(true); setMessage(""); setFieldErrors({});
    let createStarted = false;
    try {
      const form = new FormData(e.currentTarget);
      const latest = await refreshAvailability();
      const latestPackages = packages.map(p => ({ ...p, ...(latest?.packages.find(a => a.id === p.id) ?? { is_purchasable: false }), is_purchasable: p.is_active === true && p.is_purchasable === true && latest?.packages.filter(a => a.id === p.id).length === 1 && latest?.packages.find(a => a.id === p.id)?.is_purchasable === true }));
      if (!latest || latest.sales_enabled !== true || latest.availability_state !== "booking_open" || !eventQuantitiesValid(latestPackages, quantities, latest.remaining_guest_capacity)) { setMessage(ar ? "تغير التوافر. يرجى مراجعة اختيارك." : "Availability changed. Please review your selection."); return; }
      // Persist the uncertainty marker before the mutation; fail closed if storage is unavailable.
      sessionStorage.setItem(lockKey, "1");
      createStarted = true;
      const booking = await createEventBooking({ event_edition_id: event.event_edition_id, packages: Object.entries(quantities).filter(([, q]) => q > 0).map(([id, quantity]) => ({ package_id: Number(id), quantity })), guest_name: String(form.get("name") || "").trim(), guest_email: String(form.get("email") || "").trim(), guest_phone: String(form.get("phone") || "").trim() }, locale);
      const reference = sanitizeBookingReference(booking?.booking_reference);
      if (!reference || booking.product_type !== "event") throw new Error("Invalid booking response");
      // Keep the non-PII lock if the response cannot be recovered.
      sessionStorage.removeItem(lockKey); navigated.current = true;
      router.push(`/${locale}/events/booking/${encodeURIComponent(reference)}`);
    } catch (error) {
      if (!createStarted) {
        setDisabled(true);
        setMessage(ar ? "تعذر بدء الحجز. يرجى إعادة تحميل الصفحة." : "Unable to start booking. Please reload the page.");
      } else if (error instanceof ApiError && error.status === 422) {
        try { sessionStorage.removeItem(lockKey); } catch { setDisabled(true); }
        const safeErrors: Record<string, string[]> = {};
        for (const [key, value] of Object.entries(error.errors || {})) {
          if (["guest_name", "guest_email", "guest_phone", "packages", "event_edition_id", "product_type"].includes(key) && Array.isArray(value)) safeErrors[key] = value.filter((item): item is string => typeof item === "string");
        }
        setFieldErrors(safeErrors);
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
    } finally {
      let locked = createStarted;
      try { locked = Boolean(sessionStorage.getItem(lockKey)); } catch { /* preserve uncertainty */ }
      if (!navigated.current && !locked) { inFlight.current = false; setBusy(false); }
    }
  }
  const labels: Record<string, string> = ar ? { sales_not_open: "الحجز لم يفتح بعد", booking_open: "الحجز متاح", sold_out: "نفدت التذاكر", sales_closed: "أُغلق الحجز", archived: "انتهت الفعالية", cancelled: "أُلغيت الفعالية" } : { sales_not_open: "Sales have not opened", booking_open: "Booking open", sold_out: "Sold out", sales_closed: "Sales closed", archived: "Event archived", cancelled: "Event cancelled" };
  const cover = full ? eventMediaUrl(event.cover_url, preview) : null;
  const gallery = full ? event.gallery.map(image => eventMediaUrl(image.url, preview)).filter((url): url is string => Boolean(url)) : [];
  const description = full ? (ar ? event.description_ar : event.description_en) : null;
  const selected = packages.filter(p => (quantities[p.id] || 0) > 0);
  const hasSelection = Object.values(quantities).some(q => q > 0);
  const canShowBooking = full && !preview && !disabled && event.public_sales_enabled && eventCanPurchase(event);
  const localizedDay = full && event.event_starts_at ? new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Africa/Cairo" }).format(new Date(event.event_starts_at)) : null;
  const time = (value: string | null) => value ? new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { hour: "numeric", minute: "2-digit", timeZone: "Africa/Cairo" }).format(new Date(value)) : "";
  const changeQuantity = (id: number, value: number) => setQuantities(previous => ({ ...previous, [id]: value }));
  return (
    <main className="event-landing">
      <header className={`event-landing-hero${cover ? " event-landing-hero--media" : ""}${full ? "" : " event-landing-hero--status"}`}>
        {cover && <img className="event-landing-hero__image" src={cover} alt="" referrerPolicy="no-referrer" fetchPriority="high" />}
        <div className="event-landing-hero__shade" aria-hidden="true" />
        <div className="event-landing-container event-landing-hero__inner">
          {!preview && <Link href="/" className="event-landing-back"><ArrowLeft size={17} className="rtl:-scale-x-100" aria-hidden="true"/>{ar ? "العودة إلى زالينا" : "Back to Zalina"}</Link>}
          {preview && <p className="event-preview-notice">{ar ? "معاينة فقط — الحجز غير متاح" : "Preview only — booking is disabled"}</p>}
          <div className="event-landing-hero__copy">
            <div className="event-eyebrow"><span aria-hidden="true"/>{ar ? "فعاليات زالينا" : "Zalina experiences"}</div>
            <p role="status" className="event-landing-status">{labels[event.availability_state]}</p>
            <h1>{ar ? event.name_ar : event.name_en}</h1>
            {full && <>
              <div className="event-landing-hero__details">
                {localizedDay && <span><CalendarDays size={19} aria-hidden="true"/>{localizedDay}</span>}
                {event.event_starts_at && <span><Clock3 size={19} aria-hidden="true"/>{time(event.event_starts_at)}{event.event_ends_at && ` – ${time(event.event_ends_at)}`}</span>}
                <span><MapPin size={19} aria-hidden="true"/>{ar ? "زالينا، الأقصر، مصر" : "Zalina, Luxor, Egypt"}</span>
              </div>
              {canShowBooking && <a href="#event-packages" className="event-landing-primary event-hero-cta">{ar ? "اختر باقتك" : "Explore packages"}<ArrowDown size={18} aria-hidden="true"/></a>}
            </>}
          </div>
        </div>
      </header>
      {uncertain && <div className="event-landing-container event-landing-alert" role="alert">{ar ? "قد يكون الحجز قد أُنشئ. تواصل معنا قبل إعادة المحاولة." : "A booking may have been created. Contact us before trying again."}</div>}
      {full && <div className="event-landing-container event-landing-body">
        <section className="event-overview" aria-labelledby="event-overview-title">
          <div className="event-overview__copy">
            <div className="event-eyebrow"><span aria-hidden="true"/>{ar ? "التجربة" : "The experience"}</div>
            <h2 id="event-overview-title">{ar ? "عن الفعالية" : "About the event"}</h2>
            {description && <p>{description}</p>}
          </div>
          <div className="event-info-panel">
            <div className="event-info-row"><CalendarDays aria-hidden="true"/><div><strong>{ar ? "موعد الفعالية" : "Event schedule"}</strong><p>{event.event_starts_at ? date(event.event_starts_at) : (ar ? "لم يحدد بعد" : "To be announced")}{event.event_ends_at && <><br/>{ar ? "حتى " : "Until "}{date(event.event_ends_at)}</>}</p></div></div>
            {event.admission_opens_at && <div className="event-info-row"><Clock3 aria-hidden="true"/><div><strong>{ar ? "الدخول" : "Admission"}</strong><p>{date(event.admission_opens_at)}{event.admission_closes_at && <><br/>{ar ? "حتى " : "Until "}{date(event.admission_closes_at)}</>}</p></div></div>}
            <div className="event-info-row"><MapPin aria-hidden="true"/><div><strong>{ar ? "المكان" : "Location"}</strong><p>{ar ? "قرية زالينا العربية، الأقصر، مصر" : "Zalina Arabian Village, Luxor, Egypt"}</p></div></div>
          </div>
        </section>
        {gallery.length > 0 && <section className="event-gallery-section" aria-labelledby="event-gallery-title">
          <div className="event-eyebrow"><span aria-hidden="true"/>{ar ? "لحظات من زالينا" : "A glimpse of Zalina"}</div>
          <h2 id="event-gallery-title">{ar ? "معرض الفعالية" : "Event gallery"}</h2>
          <div className="event-gallery-grid">{gallery.map((src, index) => <img key={index} src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer"/>)}</div>
        </section>}
        <form id="event-packages" onSubmit={submit} className="event-booking-form" aria-busy={busy}>
          <div className="event-booking-intro">
            <div className="event-eyebrow"><span aria-hidden="true"/>{ar ? "احجز تجربتك" : "Your experience"}</div>
            <h2>{ar ? "اختر باقاتك" : "Choose your packages"}</h2>
            <p>{ar ? "اختر باقة واحدة أو أكثر وحدد الكميات المناسبة لمجموعتك." : "Choose one or more packages and select the quantities for your group."}</p>
          </div>
          <div className={`event-booking-grid${allowed ? " event-booking-grid--checkout" : ""}`}>
            <div className="event-package-list">
              {packages.filter(p => p.is_active).map(p => {
                const name = ar ? p.name_ar : p.name_en;
                const image = eventMediaUrl(p.image_url, preview);
                const quantity = quantities[p.id] || 0;
                const nextValid = eventQuantitiesValid(packages.map(item => ({ ...item, is_purchasable: item.is_active && item.is_purchasable })), { ...quantities, [p.id]: quantity + 1 }, capacity);
                const canSelect = allowed && (p.is_purchasable || quantity > 0);
                return <article key={p.id} className={`event-package-card${quantity > 0 ? " event-package-card--selected" : ""}${image ? " event-package-card--media" : ""}`}>
                  {image && <div className="event-package-image"><img src={image} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer"/></div>}
                  <div className="event-package-content">
                    <div className="event-package-top"><span className="event-package-kicker"><Ticket size={14} aria-hidden="true"/>{ar ? "باقة دخول" : "Event package"}</span>{allowed && !p.is_purchasable && <span className="event-package-unavailable">{ar ? "غير متاحة" : "Unavailable"}</span>}</div>
                    <h3>{name}</h3>
                    {(ar ? p.description_ar : p.description_en) && <p className="event-package-description">{ar ? p.description_ar : p.description_en}</p>}
                    <div className="event-package-guests"><Users size={17} aria-hidden="true"/>{p.guests_per_package} {ar ? "ضيف لكل باقة" : p.guests_per_package === 1 ? "guest per package" : "guests per package"}</div>
                    <div className="event-package-bottom">
                      <div className="event-package-price"><strong>{p.website_price}</strong> <span>{event.currency}</span><small>{ar ? "لكل باقة" : "per package"}</small></div>
                      {canSelect && <div className="event-quantity-group">
                        <span>{ar ? "الكمية" : "Quantity"}</span>
                        <div className="event-quantity-stepper">
                          <button type="button" disabled={busy || quantity <= 0} aria-label={(ar ? "تقليل كمية " : "Decrease quantity for ") + name} onClick={() => changeQuantity(p.id, Math.max(0, quantity - 1))}><Minus size={17} aria-hidden="true"/></button>
                          <input type="number" min="0" step="1" inputMode="numeric" disabled={busy} aria-label={(ar ? "كمية " : "Quantity for ") + name} value={quantity} onChange={e => changeQuantity(p.id, Number(e.target.value))}/>
                          <button type="button" disabled={busy || !nextValid} aria-label={(ar ? "زيادة كمية " : "Increase quantity for ") + name} onClick={() => changeQuantity(p.id, quantity + 1)}><Plus size={17} aria-hidden="true"/></button>
                        </div>
                      </div>}
                    </div>
                  </div>
                </article>;
              })}
              {!packages.some(p => p.is_active) && <p className="event-empty-selection">{ar ? "لا توجد باقات متاحة للعرض حالياً." : "There are no packages to display at the moment."}</p>}
              {!preview && event.purchase_enabled && !availability && <button type="button" disabled={refreshing || clock < retryUntil} onClick={() => void refreshAvailability()} className="event-availability-refresh">{ar ? "تحديث التوافر" : "Refresh availability"}</button>}
            </div>
            {allowed && <aside className="event-order-panel" aria-label={ar ? "ملخص الحجز" : "Booking summary"}>
              <div className="event-eyebrow"><span aria-hidden="true"/>{ar ? "حجزك" : "Your reservation"}</div>
              <h3>{ar ? "ملخص الحجز" : "Booking summary"}</h3>
              {selected.length > 0 ? <div className="event-order-lines">{selected.map(p => <div key={p.id}><span>{quantities[p.id]} × {ar ? p.name_ar : p.name_en}</span><strong>{eventEstimate([{website_price:p.website_price,quantity:quantities[p.id]}]) ?? "—"} {event.currency}</strong></div>)}</div> : <p className="event-empty-selection">{ar ? "لم تختر أي باقات بعد." : "No packages selected yet."}</p>}
              {hasSelection && !valid && <p role="alert" className="event-inline-error">{ar ? "يرجى تعديل الكميات حسب السعة المتاحة." : "Please adjust quantities to fit the available capacity."}</p>}
              <p aria-live="polite" className="event-order-estimate">{ar ? "تقدير الضيوف" : "Estimated guests"}: {guests} · {ar ? "الإجمالي التقديري" : "Estimated total"}: {estimate ?? "—"} {event.currency}</p>
              <p className="event-order-note">{ar ? "الأسعار تقديرية؛ المبلغ النهائي يؤكده الحجز." : "Prices are estimates; your booking confirms the final total."}</p>
              <div className="event-guest-fields">
                <h4>{ar ? "بيانات التواصل" : "Guest details"}</h4>
                {[[ "name", ar ? "الاسم" : "Name", "text"],["email", ar ? "البريد الإلكتروني" : "Email", "email"],["phone", ar ? "الهاتف" : "Phone", "tel"]].map(([name, label, type]) => <label key={name}>{label}<input required name={name} type={type} aria-invalid={Boolean(fieldErrors[`guest_${name}`]?.length)} aria-describedby={fieldErrors[`guest_${name}`]?.length ? `event-guest-${name}-errors` : undefined} autoComplete={name === "name" ? "name" : name === "email" ? "email" : "tel"} disabled={busy} />{!!fieldErrors[`guest_${name}`]?.length && <span id={`event-guest-${name}-errors`} className="event-inline-error">{fieldErrors[`guest_${name}`].map((error, index) => <span key={index} className="block">{error}</span>)}</span>}</label>)}
              </div>
              <button disabled={!valid || busy} className="event-landing-primary event-order-submit">{busy ? (ar ? "جارٍ الحجز…" : "Booking…") : (ar ? "احجز الآن" : "Book now")}</button>
              <p className="event-order-reassurance"><ShieldCheck size={16} aria-hidden="true"/>{ar ? "يتم تأكيد التوافر والسعر قبل إتمام الحجز" : "Availability and price confirmed at booking"}</p>
            </aside>}
          </div>
          {message && <p role="alert" className="event-landing-alert">{message}</p>}
        </form>
      </div>}
      <footer className="event-landing-footer"><span>ZALINA ARABIAN VILLAGE</span><span>{ar ? "الأقصر، مصر" : "Luxor, Egypt"}</span></footer>
    </main>
  );
}
