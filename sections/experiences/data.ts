import type { ExperienceCategory, ExperienceItem } from "./types";
import { parseExperienceCategory } from "./types";

export const BOOK_NOW_HREF = "/book-now";
export const CONTACT_HREF = "/experiences";

/** Message keys under `experiences.highlights.*` — resolve with useTranslations. */
export const FEATURED_DINNER_HIGHLIGHT_KEYS = [
  "buffet",
  "cooking",
  "performance",
  "atmosphere",
] as const;

export type FeaturedDinnerHighlightKey =
  (typeof FEATURED_DINNER_HIGHLIGHT_KEYS)[number];

/** @deprecated Prefer API-mapped experiences passed as props. */
export const EXPERIENCES: ExperienceItem[] = [];

export function filterExperiences(
  items: ExperienceItem[],
  category: string | null | undefined
): ExperienceItem[] {
  const selected = parseExperienceCategory(category);
  if (selected === "All Experiences") {
    return items;
  }
  return items.filter((item) => item.categories.includes(selected));
}

export function getDefaultCategory(): ExperienceCategory {
  return "All Experiences";
}
