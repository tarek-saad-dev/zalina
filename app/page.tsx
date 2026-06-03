import {
  LuxuryHero,
  HeritageStory,
  SignatureMoments,
  DayNightExperience,
  MemorableOccasions,
  ImmersiveGallery,
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

      {/* Section 5: Memorable Occasions - 3 Luxury Cards */}
      <MemorableOccasions />

      {/* Section 6: Immersive Gallery - Masonry */}
      <ImmersiveGallery />

      {/* Section 7: The Zalina Promise - 5 Features */}
      <ZalinaPromise />

      {/* Section 8: Wedding Showcase - Cinematic Banner */}
      <WeddingShowcase />

      {/* Section 9: Final CTA */}
      <FinalCTA />

      {/* Section 10: Luxury Footer */}
      <LuxuryFooter />
    </main>
  );
}
