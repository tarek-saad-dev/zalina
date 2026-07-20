"use client";

import React, { useId } from "react";
import {
  EXPERIENCE_CATEGORIES,
  type ExperienceCategory,
  parseExperienceCategory,
} from "./types";

interface FilterTabsProps {
  activeCategory: ExperienceCategory;
  onCategoryChange: (category: ExperienceCategory) => void;
}

export function FilterTabs({
  activeCategory,
  onCategoryChange,
}: FilterTabsProps) {
  const tablistId = useId();
  const safeActive = parseExperienceCategory(activeCategory);

  const handleSelect = (category: string) => {
    onCategoryChange(parseExperienceCategory(category));
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    index: number
  ) => {
    const last = EXPERIENCE_CATEGORIES.length - 1;
    let nextIndex: number | null = null;

    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      nextIndex = index === last ? 0 : index + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      nextIndex = index === 0 ? last : index - 1;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = last;
    }

    if (nextIndex === null) return;

    event.preventDefault();
    const next = EXPERIENCE_CATEGORIES[nextIndex];
    onCategoryChange(next);
    document.getElementById(`${tablistId}-tab-${nextIndex}`)?.focus();
  };

  return (
    <div className="exp-tabs-bar">
      <div className="exp-container py-2.5 md:py-3">
        <div
          role="tablist"
          aria-label="Experience categories"
          className="hide-scrollbar flex items-center gap-1.5 overflow-x-auto overscroll-x-contain scroll-smooth px-0.5 sm:gap-2 md:justify-center md:gap-1.5 lg:gap-2"
        >
          {EXPERIENCE_CATEGORIES.map((category, index) => {
            const isActive = safeActive === category;
            return (
              <button
                key={category}
                id={`${tablistId}-tab-${index}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls="experiences-panel"
                tabIndex={isActive ? 0 : -1}
                onClick={() => handleSelect(category)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="relative shrink-0 whitespace-nowrap px-3.5 py-2.5 text-[11px] font-medium tracking-[0.12em] uppercase transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--exp-gold)] md:px-3.5 md:py-2 md:text-xs"
                style={{
                  color: isActive
                    ? "rgba(212, 175, 55, 0.92)"
                    : "rgba(248, 243, 232, 0.55)",
                }}
              >
                {category}
                <span
                  className="absolute bottom-0 left-2.5 right-2.5 h-px transition-opacity duration-300"
                  style={{
                    opacity: isActive ? 1 : 0,
                    background:
                      "linear-gradient(90deg, transparent, rgba(212,175,55,0.65), transparent)",
                  }}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
