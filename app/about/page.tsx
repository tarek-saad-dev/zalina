import type { Metadata } from "next";
import { AboutPageContent } from "@/sections/about";
import { LuxuryFooter } from "@/sections/home";

export const metadata: Metadata = {
  title: "About Zalina | Our Story, Heritage & Vision",
  description:
    "Discover the soul of Zalina Arabian Village — a living luxury destination where Arabian heritage, cinematic atmosphere, and unforgettable celebrations come together beneath the stars.",
  keywords: [
    "Zalina Arabian Village",
    "about",
    "Arabian heritage",
    "luxury destination",
    "Egypt",
    "brand story",
    "hospitality",
  ],
  openGraph: {
    title: "About Zalina | Our Story, Heritage & Vision",
    description:
      "A living Arabian experience where heritage, hospitality, and celebration come together beneath the stars.",
    type: "website",
    images: [{ url: "/assets/zalina-hero-bg.png", width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  return (
    <main className="w-full min-h-screen" style={{ background: "#050505" }}>
      <AboutPageContent />
      <LuxuryFooter />
    </main>
  );
}
