"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import type { EventBooking } from "@/lib/api/events";
import { canPayEventBooking, shouldPollEventBooking } from "@/lib/api/event-view";
import { initiatePayment } from "@/lib/api/payments";
import { ApiError } from "@/lib/api/types";
import { isSafePaymentUrl, navigateAfterPaymentInitiation } from "@/components/book-now/paymentUrl";

export function EventBookingStatus({ reference, locale }: { reference: string; locale: string }) {
  const ar = locale === "ar";
  const [booking, setBooking] = useState<EventBooking | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [delay, setDelay] = useState(5000);
  const flight = useRef(false);
  const refreshing = useRef(false);
  const [fresh, setFresh] = useState(false);
  const [pollRevision, setPollRevision] = useState(0);
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, []);
  const refresh = useCallback(async () => {
    if (refreshing.current) return;
    refreshing.current = true;
    setFresh(false);
    try {
      const result = await apiFetch<EventBooking>(`/bookings/${encodeURIComponent(reference)}`, { locale, cache: "no-store" });
      if (result.product_type !== "event") throw new Error("Invalid booking");
      setBooking(result); setFresh(true); setMessage(""); setDelay(5000);
    } catch (error) {
      setFresh(false);
      if (error instanceof ApiError && error.status === 429) setDelay(30000);
      setMessage(ar ? "تعذر تحديث الحجز. يرجى المحاولة لاحقاً." : "Unable to refresh booking. Please try again later.");
    } finally { refreshing.current = false; setPollRevision(value => value + 1); }
  }, [reference, locale, ar]);
  useEffect(() => { void refresh(); }, [refresh]);
  useEffect(() => {
    if (!shouldPollEventBooking(booking)) return;
    const timer = setTimeout(() => void refresh(), delay); return () => clearTimeout(timer);
  }, [booking, delay, refresh, pollRevision]);
  async function pay() {
    if (!booking || refreshing.current || flight.current || !canPayEventBooking(booking, fresh)) return;
    flight.current = true; setBusy(true);
    try {
      const session = await initiatePayment(reference, "paymob", locale);
      if (!isSafePaymentUrl(session.payment_url) || (process.env.NODE_ENV === "production" && new URL(session.payment_url).protocol !== "https:")) throw new Error("Invalid payment URL");
      navigateAfterPaymentInitiation({ paymentUrl: session.payment_url, bookingReference: reference });
    } catch (error) {
      setFresh(false);
      if (error instanceof ApiError && (error.status === 409 || error.status === 422)) void refresh();
      setMessage(ar ? "تعذر بدء الدفع. يرجى تحديث حالة الحجز." : "Payment could not be started. Please refresh your booking status.");
    } finally { flight.current = false; setBusy(false); }
  }
  const mayPay = now > 0 && canPayEventBooking(booking, fresh);
  return <main className="page-atmosphere min-h-screen px-6 py-16 text-[#f8f2e7]"><div className="mx-auto max-w-3xl space-y-6"><h1 className="text-3xl">{ar ? "حالة الحجز" : "Booking status"}</h1>{!booking && <p>{ar ? "جارٍ تحميل الحجز…" : "Loading booking…"}</p>}{booking && <><p>{ar ? "رقم الحجز" : "Booking reference"}: {booking.booking_reference}</p><p>{ar ? "الحالة" : "Status"}: {({ pending_payment: ar ? "بانتظار الدفع" : "Awaiting payment", paid: ar ? "تم الدفع" : "Paid", confirmed: ar ? "مؤكد" : "Confirmed", expired: ar ? "منتهي" : "Expired", cancelled: ar ? "ملغى" : "Cancelled", failed: ar ? "فشل" : "Failed" } as Record<string, string>)[booking.status] || booking.status}</p><p>{ar ? "الإجمالي المؤكد" : "Confirmed total"}: {booking.total} {booking.currency}</p>{booking.event_edition && <><h2 className="text-xl">{ar ? booking.event_edition.name_ar : booking.event_edition.name_en}</h2>{booking.event_edition.event_starts_at && <p>{new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Cairo" }).format(new Date(booking.event_edition.event_starts_at))}</p>}</>}
    {booking.event_edition?.admission_opens_at && <p>{ar ? "الدخول" : "Admission"}: {new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Cairo" }).format(new Date(booking.event_edition.admission_opens_at))}</p>}
    {booking.event_items?.map(item => <p key={item.package_id}>{ar ? item.package_name_ar : item.package_name_en} × {item.quantity_active}</p>)}
    {booking.ticket_fulfillment_status === "failed" && <p role="alert">{ar ? "تعذر إصدار التذاكر. يرجى التواصل مع الدعم." : "Ticket fulfillment failed. Please contact support for help."}</p>}
    {(booking.ticket_fulfillment_status === "pending" || booking.ticket_fulfillment_status === "processing") && <p>{ar ? "جارٍ تجهيز التذاكر." : "Your tickets are being prepared."}</p>}
    {booking.tickets?.map(ticket => <div key={ticket.ticket_code} className="rounded border border-white/20 p-4"><p>{ar ? ticket.package_name_ar : ticket.package_name_en}</p><p>{ticket.status === "valid" ? (ar ? "صالحة للدخول" : "Valid for admission") : (ar ? "ملغاة وغير صالحة للدخول" : "Invalidated — not valid for admission")}</p><p>{ticket.ticket_code}</p><p>{ticket.guests_per_package} {ar ? "ضيوف" : "guests"}</p>{ticket.valid_from && <p>{ar ? "صالحة من" : "Valid from"}: {new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Cairo" }).format(new Date(ticket.valid_from))}</p>}{ticket.valid_to && <p>{ar ? "حتى" : "Until"}: {new Intl.DateTimeFormat(ar ? "ar-EG" : "en-GB", { dateStyle: "long", timeStyle: "short", timeZone: "Africa/Cairo" }).format(new Date(ticket.valid_to))}</p>}</div>)}
    {!!booking.tickets?.length && <p>{ar ? "ستجد ملف التذاكر PDF في رسالة البريد الإلكتروني." : "Your ticket PDF is sent as an email attachment."}</p>}
    {mayPay && <button disabled={busy} onClick={() => void pay()} className="rounded bg-[#d4af37] px-6 py-3 text-black disabled:opacity-40">{ar ? "المتابعة للدفع" : "Continue to payment"}</button>}</>}{message && <p role="alert">{message}</p>}<button className="block underline" onClick={() => void refresh()}>{ar ? "تحديث" : "Refresh"}</button></div></main>;
}
