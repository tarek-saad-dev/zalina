"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { NEUTRAL_MEDIA_FALLBACK } from "@/lib/media";

/** Legacy section — no Gallery CMS contract; neutral placeholder only. */
const galleryImages = [
  { src: NEUTRAL_MEDIA_FALLBACK, alt: "Zalina Arabian Village", size: "large" },
  { src: NEUTRAL_MEDIA_FALLBACK, alt: "Zalina Arabian Village", size: "small" },
  { src: NEUTRAL_MEDIA_FALLBACK, alt: "Zalina Arabian Village", size: "small" },
  { src: NEUTRAL_MEDIA_FALLBACK, alt: "Zalina Arabian Village", size: "small" },
  { src: NEUTRAL_MEDIA_FALLBACK, alt: "Zalina Arabian Village", size: "small" },
  { src: NEUTRAL_MEDIA_FALLBACK, alt: "Zalina Arabian Village", size: "large" },
];

export function GallerySection() {
  return (
    <section id="gallery" className="py-24 md:py-32 bg-bg-section">
      <Container size="large">
        <div className="text-center mb-16">
          <SectionHeading
            subtitle="Visual Journey"
            title="Gallery"
            description="Glimpses of the extraordinary experiences awaiting you at Zalina Arabian Village."
            align="center"
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px] md:auto-rows-[240px]">
          <div className="col-span-2 row-span-2 group relative overflow-hidden rounded-card">
            <img
              src={galleryImages[0].src}
              alt={galleryImages[0].alt}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-main/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <p className="text-text-primary font-display text-xl">{galleryImages[0].alt}</p>
            </div>
          </div>

          {galleryImages.slice(1, 5).map((image, index) => (
            <div
              key={index}
              className={`group relative overflow-hidden rounded-card ${
                index === 1 ? "col-span-1 md:col-span-1" : ""
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-bg-main/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}

          <div className="col-span-2 row-span-1 md:row-span-1 group relative overflow-hidden rounded-card">
            <img
              src={galleryImages[5].src}
              alt={galleryImages[5].alt}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-main/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
              <p className="text-text-primary font-display text-xl">{galleryImages[5].alt}</p>
            </div>
          </div>
        </div>

        <div className="text-center mt-12">
          <SecondaryButton href="/gallery" showArrow size="large">
            View Full Gallery
          </SecondaryButton>
        </div>
      </Container>
    </section>
  );
}
