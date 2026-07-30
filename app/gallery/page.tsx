import type { Metadata } from "next";
import { Footer } from "@/components/layout/Footer";
import { GalleryPageContent } from "@/sections/gallery/GalleryPageContent";

export const metadata: Metadata = {
  title: "Gallery | Zalina Arabian Village",
  description:
    "Explore Zalina Arabian Village through lantern-lit dinners, heritage architecture, celebrations, rituals, and unforgettable nights.",
  openGraph: {
    title: "Gallery | Zalina Arabian Village",
    description:
      "A cinematic visual journey through the atmosphere, celebrations, and rituals of Zalina Arabian Village.",
    type: "website",
  },
};

export default function GalleryPage() {
  return (
    <>
      <GalleryPageContent />
      <Footer />
    </>
  );
}
