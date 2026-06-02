"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ZoneCard } from "@/components/ui/ZoneCard";

const zones = [
  {
    title: "Souk Market",
    subtitle: "Heritage & Craft",
    description: "An authentic marketplace featuring handcrafted treasures, spices, and traditional goods from local artisans.",
    image: "https://images.unsplash.com/photo-1590073242678-cfea024341e2?w=800&q=80",
  },
  {
    title: "Desert Lounge",
    subtitle: "Relaxation & Views",
    description: "Panoramic desert views with plush seating, serving premium Arabic coffee and light refreshments.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80",
  },
  {
    title: "VIP Oasis",
    subtitle: "Exclusive Retreat",
    description: "Private cabanas with dedicated service, offering the ultimate in desert luxury and seclusion.",
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&q=80",
  },
  {
    title: "Heritage Arena",
    subtitle: "Culture & Performance",
    description: "A venue for traditional performances, storytelling, and cultural demonstrations under the stars.",
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&q=80",
  },
];

export function ZonesSection() {
  return (
    <section id="zones" className="py-24 md:py-32 bg-bg-main">
      <Container size="large">
        {/* Header */}
        <div className="text-center mb-16">
          <SectionHeading
            subtitle="Distinctive Spaces"
            title="Explore Our Zones"
            description="Four unique destinations within Zalina, each offering a different facet of Arabian hospitality and culture."
            align="center"
          />
        </div>

        {/* Zones Grid - Bento Style */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {zones.slice(0, 2).map((zone) => (
            <ZoneCard
              key={zone.title}
              {...zone}
              size="large"
              className="min-h-[480px]"
            />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {zones.slice(2, 4).map((zone) => (
            <ZoneCard
              key={zone.title}
              {...zone}
              className="min-h-[360px]"
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
