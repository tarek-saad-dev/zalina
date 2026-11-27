"use client";
import { useEffect, useRef, useState } from "react";
import type { EventBooking } from "@/lib/api/events";
import { canPayEventBooking, eventDeadlinePassed } from "@/lib/api/event-view";
import { eventLandingPath } from "@/lib/api/events";
import { initiatePayment } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/types";
import { savePendingPaymentBooking } from "@/components/book-now/paymentHandoffStorage";
import { isSafePaymentUrl, navigateAfterPaymentInitiation } from "@/components/book-now/paymentUrl";

export function EventBookingStatus({ reference, locale, booking, refresh, fresh, inFlight }: { reference: string; locale: string; booking: EventBooking; refresh: () => Promise<unknown>; fresh: boolean; inFlight: React.MutableRefObject<boolean> }) {
  const ar = locale === "ar";
  const [message, setMessage] = useState("");
  const [failedSnapshot, setFailedSnapshot] = useState<EventBooking | null>(null);
  const latestBooking = useRef(booking);
  latestBooking.current = booking;
  // Only an authoritative new snapshot (not a refresh click or failed GET) unlocks retry.
  const paymentError = failedSnapshot !== null;
  useEffect(() => {
    if (failedSnapshot && fresh && booking.booking_reference === reference && booking !== failedSnapshot) {
      setFailedSnapshot(null);
      setMessage("");
    }
  }, [booking, fresh, failedSnapshot, reference]);
  const [busy, setBusy] = useState(false);
  const flight = useRef(false);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  async function pay() {
    if (!booking || booking.booking_reference !== reference || flight.current || inFlight.current || !canPayEventBooking(booking, fresh && !paymentError)) return;
    flight.current = true; setBusy(true);
    let redirecting = false;
    try {
      const session = await initiatePayment(reference, "paymob", locale);
      if (!isSafePaymentUrl(session.payment_url) || (process.env.NODE_ENV === "production" && new URL(session.payment_url).protocol !== "https:")) throw new Error("Invalid payment URL");
      savePendingPaymentBooking(booking);
      navigateAfterPaymentInitiation({ paymentUrl: session.payment_url, bookingReference: reference });
      redirecting = true;
    } catch (error) {
      setFailedSnapshot(latestBooking.current);
      if (error instanceof ApiError && (error.status === 409 || error.status === 422)) void refresh();
      setMessage(ar ? "تعذر بدء الدفع. يرجى تحديث حالة الحجز." : "Payment could not be started. Please refresh your booking status.");
    } finally { if (!redirecting) { flight.current = false; setBusy(false); } }
  }
  const mayPay = now > 0 && booking.booking_reference === reference && canPayEventBooking(booking, fresh && !paymentError);
  const expired = booking.status === "expired" || (booking.status === "pending_payment" && eventDeadlinePassed(booking.hold_expires_at, booking.payment_expires_at));
  const newBookingPath = expired && booking.event_edition && !booking.event_edition.is_cancelled ? eventLandingPath(`/events/${booking.event_edition.slug}`, booking.event_edition.slug) : null;
  return <main className="page-atmosphere min-h-screen px-4 pb-20 pt-24 text-[var(--zalina-text)] sm:px-6 md:pt-32"><div className="mx-auto max-w-3xl space-y-6 rounded-2xl border border-[var(--border-gold-soft)] bg-[var(--bg-surface)] p-5 shadow-xl sm:p-8"><h1 className="text-3xl">{ar ? "حالة الحجز" : "Booking status"}</h1>{!booking && <p>{ar ? "جارٍ تحميل الحجز…" : "Loading booking…"}</p>}{booking && <><p>{ar ? "رقم الحجز" : "Booking reference"}: {booking.booking_reference}</p><p role="status" aria-atomic="true">{ar ? "الحالة" : "Status"}: {({ pending_payment: ar ? "بانتظار الدفع" : "Awaiting payment", paid: ar ? "تم الدفع" : "Paid", confirmed: ar ? "مؤكد" : "Confirmed", expired: ar ? "منتهي" : "Expired", cancelled: ar ? "ملغى" : "Cancelled", failed: ar ? "فشل" : "Failed" } as Record<string, string>)[booking.status] || booking.status}</p><p>{ar ? "الإجمالي المؤكد" : "Confirmed total"}: {booking.total} {booking.currency}</p><p>{ar ? "عدد الضيوف المؤكد" : "Confirmed guests"}: {booking.guests}</p>{booking.event_edition && <><h2 className="text-xl">{ar ? booking.event_edition.name_ar : booking.event_edition.name_en}</h2>{booking.event_edition.event_starts_at && <p>{new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Cairo" }).format(new Date(booking.event_edition.event_starts_at))}</p>}</>}
    {booking.event_edition?.admission_opens_at && <p>{ar ? "الدخول" : "Admission"}: {new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Cairo" }).format(new Date(booking.event_edition.admission_opens_at))}</p>}
    {booking.event_items?.map(item => <p key={item.package_id}>{ar ? item.package_name_ar : item.package_name_en} × {item.quantity_active}</p>)}
    {booking.ticket_fulfillment_status === "failed" && <p role="alert">{ar ? "تعذر إصدار التذاكر. يرجى التواصل مع الدعم." : "Ticket fulfillment failed. Please contact support for help."}</p>}
    {(booking.ticket_fulfillment_status === "pending" || booking.ticket_fulfillment_status === "processing") && <p role="status">{ar ? "جارٍ تجهيز التذاكر." : "Your tickets are being prepared."}</p>}
    {booking.tickets?.map(ticket => <div key={ticket.ticket_code} className="min-w-0 break-words rounded-xl border border-[var(--border-gold-soft)] bg-white/5 p-5 leading-relaxed"><p>{(ar ? ticket.package_name_ar : ticket.package_name_en) ?? (ar ? "تذكرة فعالية" : "Event ticket")}</p><p>{ticket.status === "valid" ? (ar ? "صالحة للدخول" : "Valid for admission") : (ar ? "ملغاة وغير صالحة للدخول" : "Invalidated — not valid for admission")}</p><p>{ticket.ticket_code}</p>{ticket.guests_per_package !== null && <p>{ticket.guests_per_package} {ar ? "ضيوف" : "guests"}</p>}{ticket.valid_from && <p>{ar ? "صالحة من" : "Valid from"}: {new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Cairo" }).format(new Date(ticket.valid_from))}</p>}{ticket.valid_to && <p>{ar ? "حتى" : "Until"}: {new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Cairo" }).format(new Date(ticket.valid_to))}</p>}</div>)}
    {!!booking.tickets?.length && <p>{ar ? "ستجد ملف التذاكر PDF في رسالة البريد الإلكتروني." : "Your ticket PDF is sent as an email attachment."}</p>}
    {expired && <p role="status" className="rounded-lg border border-white/15 p-4">{ar ? "انتهت مهلة الدفع. يمكنك بدء حجز جديد حسب التوافر." : "The payment window has ended. You can start a new booking subject to availability."}</p>}
    {newBookingPath && <a href={`/${locale}${newBookingPath}`} className="inline-flex min-h-12 items-center rounded-lg border border-[var(--zalina-gold)] px-5 py-3 text-[var(--zalina-gold-highlight)]">{ar ? "حجز جديد" : "Start a new booking"}</a>}
    {mayPay && <button disabled={busy} onClick={() => void pay()} className="min-h-12 w-full rounded-lg bg-[var(--zalina-gold)] px-6 py-3 font-semibold text-black hover:bg-[var(--zalina-gold-highlight)] disabled:opacity-40 sm:w-auto">{ar ? "المتابعة للدفع" : "Continue to payment"}</button>}</>}{message && <p role="alert">{message}</p>}<button className="block min-h-12 rounded-lg px-3 underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--zalina-gold)]" disabled={busy} onClick={() => { void refresh(); }}>{ar ? "تحديث" : "Refresh"}</button></div></main>;
}
