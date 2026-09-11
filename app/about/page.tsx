import type { Metadata } from "next";
import { AboutPageContent } from "@/sections/about";
import { LuxuryFooter } from "@/sections/home";

export const metadata: Metadata = {
  title: "About Zalina | A Cultural Village in Luxor, Egypt",
  description:
    "Discover Zalina Arabian Village in Luxor — an immersive cultural destination shaped by Egyptian hospitality, cuisine, craft and evening entertainment beside the Nile.",
  keywords: [
    "Zalina Arabian Village",
    "about Zalina",
    "Luxor cultural village",
    "Egyptian hospitality",
    "Luxor Egypt",
    "brand story",
  ],
  openGraph: {
    title: "About Zalina | A Cultural Village in Luxor, Egypt",
    description:
      "Egyptian hospitality, dining, music and celebration in the heart of Luxor — inspired by heritage, designed for today.",
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
