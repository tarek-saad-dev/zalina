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
import { HeroRevealGate } from "@/components/media/HeroRevealGate";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Zones & Venues | Zalina Arabian Village Luxor",
  description:
    "Explore the spaces of Zalina Arabian Village in Luxor — Arrival Plaza, Al-Souk Village market, and Food & Entertainment.",
  keywords: [
    "Zalina zones",
    "Luxor village spaces",
    "Al-Souk Village",
    "event spaces Luxor",
    "Zalina Arabian Village",
  ],
  openGraph: {
    title: "Zones & Venues | Zalina Arabian Village Luxor",
    description:
      "Discover the village spaces of Zalina in Luxor — market, dining and gathering areas shaped for hospitality.",
    type: "website",
  },
};

export default async function ZonesPage() {
  const apiZones = await getZones();
  const zones = apiZones.map((z) => mapZoneToUi(z));
  const featured =
    zones.find((z) => z.isBookableOnline) ?? zones[0] ?? null;

  return (
    <HeroRevealGate>
      <main className="zones-page min-h-screen overflow-x-hidden">
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
    </HeroRevealGate>
  );
}
