import type { Metadata } from "next";
import { FEATURE_FLAGS } from "@/lib/featureFlags";
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
import { ComingSoonOverlay } from "@/components/ui/ComingSoonOverlay";

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
  if (!FEATURE_FLAGS.WEDDINGS_ACTIVE) {
    return (
      <main className="zones-page min-h-screen overflow-x-hidden">
        <ComingSoonOverlay
          title="Weddings at Zalina"
          subtitle="We are crafting an extraordinary celebration experience. Stay tuned for something truly unforgettable."
          variant="full"
        />
        <Footer />
      </main>
    );
  }

  return (
    <main className="zones-page min-h-screen overflow-x-hidden">
      <WeddingHero />
      <EmotionalIntro />
      <WeddingVenues />
      <SignatureExperience />
      <WeddingTimeline />
      <WeddingDetails />
      <CelebrationStyles />
      <WeddingGallery />
      <WhyZalina />
      <ConsultationCTA />
      <Footer />
    </main>
  );
}
