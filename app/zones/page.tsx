import type { Metadata } from "next";
import {
  Navbar,
  Hero,
  DestinationOverview,
  MainZones,
  FeaturedZone,
  ZoneDifferentiation,
  ImmersiveJourney,
  WhyZonesMatter,
  BookingConnection,
  FinalCTA,
  Footer,
} from "@/sections/zones";

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

export default function ZonesPage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--zones-bg)" }}
    >
      {/* Sticky Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Destination Overview */}
      <DestinationOverview />

      {/* Main Zones */}
      <MainZones />

      {/* Featured Zone Spotlight */}
      <FeaturedZone />

      {/* Zone Differentiation */}
      <ZoneDifferentiation />

      {/* Immersive Journey */}
      <ImmersiveJourney />

      {/* Why Each Zone Matters */}
      <WhyZonesMatter />

      {/* Booking Connection */}
      <BookingConnection />

      {/* Final CTA */}
      <FinalCTA />

      {/* Footer */}
      <Footer />
    </main>
  );
}
