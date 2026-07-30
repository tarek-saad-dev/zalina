"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { FilterTabs } from "./FilterTabs";
import { ExperienceCard } from "./ExperienceCard";
import { filterExperiences, getDefaultCategory } from "./data";
import {
  getCategoryHeading,
  parseExperienceCategory,
  type ExperienceCategory,
  type ExperienceItem,
} from "./types";
import { useExpMotion } from "./useExpMotion";
import { cn } from "@/lib/utils";

function gridClassForCount(count: number): string {
  if (count <= 0) return "";
  if (count === 1) {
    return "mx-auto grid max-w-md grid-cols-1 gap-5";
  }
  if (count === 2) {
    return "mx-auto grid max-w-3xl grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6";
  }
  return "grid auto-rows-fr grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:gap-7";
}

interface ExperiencesCatalogProps {
  experiences: ExperienceItem[];
}

export function ExperiencesCatalog({ experiences }: ExperiencesCatalogProps) {
  const [activeCategory, setActiveCategory] = useState<ExperienceCategory>(
    getDefaultCategory()
  );
  const { fadeUp, transition } = useExpMotion();

  const handleCategoryChange = (category: ExperienceCategory) => {
    setActiveCategory(parseExperienceCategory(category));
  };

  const filtered = filterExperiences(experiences, activeCategory);
  const heading = getCategoryHeading(activeCategory);

  return (
    <section
      id="experiences"
      className="exp-catalog relative"
      style={{ background: "transparent" }}
      aria-labelledby="experiences-heading"
    >
      <FilterTabs
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
      />

      <div className="exp-container exp-catalog-body">
        <motion.div
          className="exp-section-header exp-catalog-header"
          initial={fadeUp.initial}
          whileInView={fadeUp.animate}
          viewport={{ once: true }}
          transition={transition(0)}
        >
          <p className="exp-eyebrow mb-3">Explore</p>
          <h2 id="experiences-heading" className="exp-section-heading">
            {heading}
          </h2>
          <div
            className="mx-auto mt-4 exp-editorial-line-long"
            aria-hidden="true"
          />
        </motion.div>

        <div
          id="experiences-panel"
          role="tabpanel"
          aria-labelledby="experiences-heading"
          aria-live="polite"
        >
          {filtered.length === 0 ? (
            <div className="exp-empty-state">
              <p className="exp-eyebrow mb-4">Coming Soon</p>
              <p className="exp-body">
                No experiences available in this category yet.
              </p>
            </div>
          ) : (
            <div
              key={activeCategory}
              className={cn("exp-catalog-grid", gridClassForCount(filtered.length))}
            >
              {filtered.map((experience, index) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
