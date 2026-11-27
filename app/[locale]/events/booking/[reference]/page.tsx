import { setRequestLocale } from "next-intl/server";
import { BookingStatusPage } from "@/components/booking-status/BookingStatusPage";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default function Page({ params }: { params: { locale: string; reference: string } }) {
  setRequestLocale(params.locale);
  return <BookingStatusPage routeReference={params.reference} />;
}
