import { HomeHero } from "@/sections/HomeHero";
import { Footer } from "@/components/layout/Footer";
import { ExperiencesSection } from "@/sections/ExperiencesSection";
import { ZonesSection } from "@/sections/ZonesSection";
import { WeddingsSection } from "@/sections/WeddingsSection";
import { GallerySection } from "@/sections/GallerySection";
import { BookingCTASection } from "@/sections/BookingCTASection";

export default function Home() {
  return (
    <main className="min-h-screen bg-bg-main">
      <HomeHero />
      <ExperiencesSection />
      <ZonesSection />
      <WeddingsSection />
      <GallerySection />
      <BookingCTASection />
      <Footer />
    </main>
  );
}
