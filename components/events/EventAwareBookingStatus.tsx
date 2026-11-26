"use client";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api/client";
import { BookingStatusPage } from "@/components/booking-status/BookingStatusPage";
import { EventBookingStatus } from "./EventBookingStatus";

export function EventAwareBookingStatus({ reference, locale }: { reference: string; locale: string }) {
  const [type, setType] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    apiFetch<{ product_type: string }>(`/bookings/${encodeURIComponent(reference)}`, { locale, cache: "no-store" }).then(result => { if (active) setType(result.product_type); }).catch(() => { if (active) setType("error"); });
    return () => { active = false; };
  }, [reference, locale]);
  if (!type) return <main className="page-atmosphere min-h-screen" />;
  if (type === "error") return <main className="page-atmosphere min-h-screen p-8 text-white"><p>{locale === "ar" ? "تعذر تحميل الحجز. يرجى إعادة تحميل الصفحة." : "Unable to load the booking. Please reload the page."}</p></main>;
  return type === "event" ? <EventBookingStatus reference={reference} locale={locale} /> : <BookingStatusPage routeReference={reference} />;
}
