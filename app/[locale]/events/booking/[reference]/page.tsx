import { EventBookingStatus } from "@/components/events/EventBookingStatus";
export const dynamic = "force-dynamic";
export const metadata = { robots: { index: false, follow: false }, referrer: "no-referrer" as const };
export default function Page({ params }: { params: { locale: string; reference: string } }) {
  return <EventBookingStatus locale={params.locale} reference={params.reference} />;
}
