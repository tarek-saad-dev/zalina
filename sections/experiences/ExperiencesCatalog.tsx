"use client";

import React from "react";
import { ExperienceCard } from "./ExperienceCard";

const experiences = [
  {
    image: "/images/exp-dining-1.jpg",
    category: "Signature",
    title: "Arabian Feast",
    description: "Traditional flavors in an elegant setting",
    tags: ["Dinner", "Popular"],
  },
  {
    image: "/images/exp-sunset-1.jpg",
    category: "Sunset",
    title: "Golden Hour",
    description: "Watch the sunset over the dunes",
    tags: ["Romantic"],
  },
  {
    image: "/images/exp-private-1.jpg",
    category: "Private",
    title: "Intimate Dining",
    description: "Exclusive experience for two",
    tags: ["Couples"],
  },
  {
    image: "/images/exp-cooking-1.jpg",
    category: "Cooking",
    title: "Chef's Table",
    description: "Learn from our master chefs",
    tags: ["Interactive"],
  },
];

export function ExperiencesCatalog() {
  return (
    <section className="py-8" id="experiences">
      <div className="mobile-container">
        {/* Section Header */}
        <div className="text-center mb-6">
          <span
            className="text-[10px] tracking-widest uppercase mb-2 block"
            style={{ color: "var(--exp-gold)" }}
          >
            Explore
          </span>
          <h2 className="exp-section-heading">Our Experiences</h2>
        </div>

        {/* Horizontal Scroll Cards */}
        <div className="overflow-x-auto hide-scrollbar -mx-5 px-5">
          <div className="flex gap-3" style={{ width: "max-content" }}>
            {experiences.map((exp, index) => (
              <ExperienceCard key={index} {...exp} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
