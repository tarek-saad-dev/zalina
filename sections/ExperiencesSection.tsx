"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ExperienceCard } from "@/components/ui/ExperienceCard";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import {
  formatEgp,
  getExperiences,
  mapExperienceToCatalogItem,
} from "@/lib/api";
import type { ExperienceItem } from "@/sections/experiences/types";

interface ExperiencesSectionProps {
  experiences?: ExperienceItem[];
}

export function ExperiencesSection({
  experiences: initial,
}: ExperiencesSectionProps) {
  const [experiences, setExperiences] = useState<ExperienceItem[]>(
    initial ?? []
  );

  useEffect(() => {
    if (initial && initial.length > 0) return;
    let cancelled = false;
    getExperiences()
      .then((data) => {
        if (cancelled) return;
        setExperiences(
          data.filter((e) => e.is_active).map((e) => mapExperienceToCatalogItem(e))
        );
      })
      .catch(() => {
        if (!cancelled) setExperiences([]);
      });
    return () => {
      cancelled = true;
    };
  }, [initial]);

  const cards = experiences.slice(0, 4).map((exp) => ({
    title: exp.title,
    description: exp.description,
    image: exp.image,
    duration: exp.label,
    price:
      exp.price != null ? `From ${formatEgp(exp.price)}` : "Inquire for pricing",
  }));

  return (
    <section id="experiences" className="py-24 md:py-32 bg-bg-secondary">
      <Container size="large">
        <div className="text-center mb-16">
          <SectionHeading
            subtitle="Curated Moments"
            title="Signature Experiences"
            description="Immersive journeys crafted to celebrate Arabian heritage and desert hospitality."
            align="center"
          />
        </div>

        {cards.length === 0 ? (
          <p className="text-center text-sm opacity-60 mb-10">
            Experiences are loading or temporarily unavailable.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {cards.map((experience) => (
              <ExperienceCard key={experience.title} {...experience} />
            ))}
          </div>
        )}

        <div className="text-center">
          <SecondaryButton href="/experiences">
            View All Experiences
          </SecondaryButton>
        </div>
      </Container>
    </section>
  );
}
