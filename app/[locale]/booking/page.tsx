import { setRequestLocale } from "next-intl/server";
import { BookingRecoveryPage } from "@/components/booking-status/BookingRecoveryPage";
import { buildPageMetadata } from "@/lib/i18n/metadata";

type Props = {
  params: { locale: string };
};

export async function generateMetadata({ params }: Props) {
  const meta = await buildPageMetadata(params.locale, "booking", "/booking");
  return {
    ...meta,
    robots: { index: false, follow: false },
  };
}

/**
 * Generic payment-return landing when Paymob/backend redirects without
 * embedding booking_reference in the path.
 * Recovers from zalina.booking.payment.v2 then redirects to /booking/{reference}.
 *
 * Backend/Paymob should prefer redirecting to /booking/{booking_reference}.
 * Frontend does not send return_url on POST /pay.
 */
export default function BookingIndexPage({ params }: Props) {
  setRequestLocale(params.locale);
  return <BookingRecoveryPage />;
}
