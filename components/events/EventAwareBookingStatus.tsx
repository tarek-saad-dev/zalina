"use client";
import { BookingStatusPage } from "@/components/booking-status/BookingStatusPage";
export function EventAwareBookingStatus({ reference }: { reference: string; locale: string }) {
  return <BookingStatusPage routeReference={reference} />;
}
