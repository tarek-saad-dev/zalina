import type { Metadata } from "next";
import {
  Hero,
  DestinationOverview,
  MainZones,
  FeaturedZone,
  ZoneDifferentiation,
  ImmersiveJourney,
  WhyZonesMatter,
  BookingConnection,
  FinalCTA,
} from "@/sections/zones";
import { LuxuryFooter } from "@/sections/home";
import { getZones, mapZoneToUi } from "@/lib/api";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Zones & Venues | Zalina Arabian Village",
  description:
    "Discover our signature zones and venues at Zalina Arabian Village. From the Royal Wedding Court to the Desert Lounge, find the perfect space for your event.",
  keywords: [
    "Zalina zones",
    "wedding venues",
    "event spaces",
    "Arabian village",
    "luxury venues",
    "Royal Wedding Court",
  ],
  openGraph: {
    title: "Zones & Venues | Zalina Arabian Village",
    description:
      "Discover our signature zones and venues at Zalina Arabian Village.",
    type: "website",
  },
};

export default async function ZonesPage() {
  const apiZones = await getZones();
  const zones = apiZones.map((z) => mapZoneToUi(z));
  const featured =
    zones.find((z) => z.isBookableOnline) ?? zones[0] ?? null;

  return (
    <main
      className="zones-page min-h-screen overflow-x-hidden"
    >
      <Hero />
      <DestinationOverview />
      <MainZones zones={zones} />
      <FeaturedZone zone={featured} />
      <ZoneDifferentiation />
      <ImmersiveJourney zones={zones} />
      <WhyZonesMatter />
      <BookingConnection />
      <FinalCTA />
      <LuxuryFooter />
    </main>
  );
}
