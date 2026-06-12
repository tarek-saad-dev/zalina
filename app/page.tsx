import {
  LuxuryHero,
  HeritageStory,
  GlimpseGallery,
  SignatureMoments,
  DayNightExperience,
  ZalinaPromise,
  WeddingShowcase,
  FinalCTA,
  LuxuryFooter,
} from "@/sections/home";

export default function Home() {
  return (
    <main className="min-h-screen" style={{ background: "var(--lux-bg)" }}>
      {/* Section 1: Cinematic Hero - 100vh */}
      <LuxuryHero />

      {/* Section 2: Heritage Story */}
      <HeritageStory />

      {/* Section 3: Signature Moments - 5 Premium Cards */}
      <SignatureMoments />

      {/* Section 4: Day vs Night Experience */}
      <DayNightExperience />

      {/* Section 5: A Glimpse Into Zalina - Cinematic Gallery */}
      <GlimpseGallery />

      {/* Section 6: The Zalina Promise - Slim Trust Strip */}
      <ZalinaPromise />

      {/* Section 7: Weddings at Zalina - Premium Hero */}
      <WeddingShowcase />

      {/* Section 8: Final Conversion CTA */}
      <FinalCTA />

      {/* Section 9: Luxury Footer */}
      <LuxuryFooter />
    </main>
  );
}
