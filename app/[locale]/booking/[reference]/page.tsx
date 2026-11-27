import { setRequestLocale } from "next-intl/server";
import { EventAwareBookingStatus } from "@/components/events/EventAwareBookingStatus";
import { buildPageMetadata } from "@/lib/i18n/metadata";

type Props = {
  params: { locale: string; reference: string };
};

export async function generateMetadata({ params }: Props) {
  // A booking reference is a capability, not a canonical or social-sharing URL.
  const meta = await buildPageMetadata(params.locale, "bookingStatus", "/booking");
  return {
    title: meta.title,
    description: meta.description,
    referrer: "no-referrer" as const,
    robots: { index: false, follow: false },
  };
}

export default function BookingStatusRoute({ params }: Props) {
  setRequestLocale(params.locale);
  return <EventAwareBookingStatus reference={params.reference} locale={params.locale} />;
}
