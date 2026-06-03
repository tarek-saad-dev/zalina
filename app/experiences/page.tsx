import type { Metadata } from "next";
import {
  Navbar,
  Hero,
  FilterTabs,
  ExperiencesCatalog,
  EditorialSpotlight,
  WhyChooseZalina,
  ExperienceJourney,
  MicroInfoPreview,
  FuturePackages,
  CTASection,
  Footer,
} from "@/sections/experiences";

export const metadata: Metadata = {
  title: "Experiences | Zalina Arabian Village",
  description:
    "Discover curated luxury experiences at Zalina Arabian Village. From signature dining to sunset celebrations, create unforgettable memories.",
  keywords: [
    "Zalina experiences",
    "luxury dining",
    "Arabian hospitality",
    "desert experiences",
    "signature events",
  ],
  openGraph: {
    title: "Experiences | Zalina Arabian Village",
    description:
      "Discover curated luxury experiences at Zalina Arabian Village.",
    type: "website",
  },
};

export default function ExperiencesPage() {
  return (
    <main
      className="min-h-screen"
      style={{ background: "var(--exp-bg-primary)" }}
    >
      {/* Sticky Navbar */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Experience Filter Bar */}
      <FilterTabs />

      {/* Experiences Catalog */}
      <ExperiencesCatalog />

      {/* Editorial Spotlight Section */}
      <EditorialSpotlight />

      {/* Why Choose Zalina */}
      <WhyChooseZalina />

      {/* Experience Journey */}
      <ExperienceJourney />

      {/* Micro Info Preview */}
      <MicroInfoPreview />

      {/* Future Packages */}
      <FuturePackages />

      {/* CTA Section */}
      <CTASection />

      {/* Footer */}
      <Footer />
    </main>
  );
}
