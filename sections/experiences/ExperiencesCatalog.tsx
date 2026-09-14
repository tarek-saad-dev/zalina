"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { FilterTabs } from "./FilterTabs";
import { ExperienceCard } from "./ExperienceCard";
import { filterExperiences, getDefaultCategory } from "./data";
import {
  getCategoryMessageKey,
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
  initialCategory?: string | null;
}

export function ExperiencesCatalog({
  experiences,
  initialCategory,
}: ExperiencesCatalogProps) {
  const t = useTranslations("experiences");
  const router = useRouter();
  const pathname = usePathname();
  const [activeCategory, setActiveCategory] = useState<ExperienceCategory>(
    () =>
      initialCategory
        ? parseExperienceCategory(initialCategory)
        : getDefaultCategory()
  );
  const { fadeUp, transition } = useExpMotion();

  const handleCategoryChange = (category: ExperienceCategory) => {
    const safe = parseExperienceCategory(category);
    setActiveCategory(safe);

    const params = new URLSearchParams();
    if (safe !== "All Experiences") {
      params.set("category", safe);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const filtered = filterExperiences(experiences, activeCategory);
  const heading = t(
    `categoryHeadings.${getCategoryMessageKey(activeCategory)}`
  );

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
          <p className="exp-eyebrow mb-3">{t("catalog.eyebrow")}</p>
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
              <p className="exp-eyebrow mb-4">{t("catalog.emptyEyebrow")}</p>
              <p className="exp-body">{t("catalog.emptyBody")}</p>
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
