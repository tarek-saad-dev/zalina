import type { Metadata } from "next";
import { BookingStatusPage } from "@/components/booking-status/BookingStatusPage";

export const metadata: Metadata = {
  title: "Booking Status | Zalina Arabian Village",
  description: "View your Zalina reservation status and digital ticket.",
  robots: { index: false, follow: false },
};

interface PageProps {
  params: { reference: string };
}

export default function BookingStatusRoute({ params }: PageProps) {
  return <BookingStatusPage routeReference={params.reference} />;
}
