"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ExperienceCard } from "@/components/ui/ExperienceCard";
import { SecondaryButton } from "@/components/ui/SecondaryButton";

const experiences = [
  {
    title: "Desert Safari & Stargazing",
    description: "Journey across golden dunes in luxury 4x4 vehicles, followed by an intimate stargazing experience with expert astronomers.",
    image: "https://images.unsplash.com/photo-1547234935-80c7142ee969?w=800&q=80",
    duration: "6 Hours",
    price: "From $450",
  },
  {
    title: "Traditional Falconry",
    description: "Witness the ancient art of falconry with our master falconers. Learn about this treasured Arabian tradition.",
    image: "https://images.unsplash.com/photo-1615655406736-b37c4fabf923?w=800&q=80",
    duration: "3 Hours",
    price: "From $280",
  },
  {
    title: "Sunset Camel Caravan",
    description: "Traverse the desert as travelers have for centuries. A serene journey ending with sunset refreshments.",
    image: "https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800&q=80",
    duration: "2.5 Hours",
    price: "From $180",
  },
  {
    title: "Heritage Cooking Class",
    description: "Master the secrets of Emirati cuisine with our expert chefs in an authentic outdoor kitchen setting.",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80",
    duration: "4 Hours",
    price: "From $220",
  },
];

export function ExperiencesSection() {
  return (
    <section id="experiences" className="py-24 md:py-32 bg-bg-section">
      <Container size="large">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <SectionHeading
            subtitle="Curated Journeys"
            title="Unforgettable Experiences"
            description="Each moment at Zalina is crafted to immerse you in the rich tapestry of Arabian culture, from ancient traditions to modern luxury."
            align="left"
            showDivider={false}
          />
          <SecondaryButton href="#" showArrow className="shrink-0">
            View All Experiences
          </SecondaryButton>
        </div>

        {/* Experience Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {experiences.map((experience) => (
            <ExperienceCard
              key={experience.title}
              {...experience}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
