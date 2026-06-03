"use client";

import React, { useState } from "react";

const filters = [
  "All Experiences",
  "Dinner",
  "Sunset",
  "Private",
  "Cooking",
  "Party",
  "Most Popular",
  "Signature",
  "Romantic",
];

interface FilterTabsProps {
  onFilterChange?: (filter: string) => void;
}

export function FilterTabs({ onFilterChange }: FilterTabsProps) {
  const [activeFilter, setActiveFilter] = useState("All Experiences");

  const handleFilterClick = (filter: string) => {
    setActiveFilter(filter);
    onFilterChange?.(filter);
  };

  return (
    <div
      className="w-full overflow-x-auto hide-scrollbar py-3"
      style={{ borderBottom: "1px solid var(--exp-border)" }}
    >
      <div className="flex items-center gap-4 px-5" style={{ minWidth: "max-content" }}>
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterClick(filter)}
            className="relative text-xs whitespace-nowrap transition-colors duration-200"
            style={{
              color:
                activeFilter === filter
                  ? "var(--exp-gold)"
                  : "var(--exp-text-secondary)",
              height: "30px",
            }}
          >
            {filter}
            {activeFilter === filter && (
              <span
                className="absolute bottom-0 left-0 right-0 h-[1px]"
                style={{ background: "var(--exp-gold)" }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
