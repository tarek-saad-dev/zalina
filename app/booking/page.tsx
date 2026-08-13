import type { Metadata } from "next";
import { BookingRecoveryPage } from "@/components/booking-status/BookingRecoveryPage";

export const metadata: Metadata = {
  title: "Booking Recovery | Zalina Arabian Village",
  description: "Recover your Zalina booking after payment.",
  robots: { index: false, follow: false },
};

/**
 * Generic payment-return landing when Paymob/backend redirects without
 * embedding booking_reference in the path.
 * Recovers from zalina.booking.payment.v2 then redirects to /booking/{reference}.
 *
 * Backend/Paymob should prefer redirecting to /booking/{booking_reference}.
 * Frontend does not send return_url on POST /pay.
 */
export default function BookingIndexPage() {
  return <BookingRecoveryPage />;
}
