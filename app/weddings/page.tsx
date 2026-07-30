import type { Metadata } from "next";
import {
  WeddingHero,
  EmotionalIntro,
  WeddingVenues,
  SignatureExperience,
  WeddingTimeline,
  WeddingDetails,
  CelebrationStyles,
  WeddingGallery,
  WhyZalina,
  ConsultationCTA,
} from "@/sections/weddings";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Weddings | Zalina Arabian Village",
  description:
    "Plan a cinematic wedding celebration beneath lanterns, palms, heritage architecture, and stars at Zalina Arabian Village.",
  keywords: [
    "Zalina weddings",
    "luxury wedding venue",
    "Arabian wedding",
    "destination wedding Egypt",
    "cinematic wedding",
    "heritage wedding venue",
  ],
  openGraph: {
    title: "Weddings | Zalina Arabian Village",
    description:
      "Plan a cinematic wedding celebration beneath lanterns, palms, heritage architecture, and stars at Zalina Arabian Village.",
    type: "website",
  },
};

export default function WeddingsPage() {
  return (
    <main className="zones-page min-h-screen overflow-x-hidden">
      {/* 1. Wedding Hero */}
      <WeddingHero />

      {/* 2. Emotional Intro */}
      <EmotionalIntro />

      {/* 3. Wedding Venues */}
      <WeddingVenues />

      {/* 4. Signature Experience */}
      <SignatureExperience />

      {/* 5. Wedding Timeline */}
      <WeddingTimeline />

      {/* 6. Wedding Details */}
      <WeddingDetails />

      {/* 7. Celebration Styles */}
      <CelebrationStyles />

      {/* 8. Wedding Gallery */}
      <WeddingGallery />

      {/* 9. Why Zalina */}
      <WhyZalina />

      {/* 10. Consultation CTA */}
      <ConsultationCTA />

      {/* 11. Footer */}
      <Footer />
    </main>
  );
}
