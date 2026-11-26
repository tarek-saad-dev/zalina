import { setRequestLocale } from "next-intl/server";
import { EventAwareBookingStatus } from "@/components/events/EventAwareBookingStatus";
import { buildPageMetadata } from "@/lib/i18n/metadata";

type Props = {
  params: { locale: string; reference: string };
};

export async function generateMetadata({ params }: Props) {
  const meta = await buildPageMetadata(
    params.locale,
    "bookingStatus",
    `/booking/${params.reference}`
  );
  return {
    ...meta,
    robots: { index: false, follow: false },
  };
}

export default function BookingStatusRoute({ params }: Props) {
  setRequestLocale(params.locale);
  return <EventAwareBookingStatus reference={params.reference} locale={params.locale} />;
}
