import type { ExperienceCategory, ExperienceItem } from "./types";
import { parseExperienceCategory } from "./types";

export const BOOK_NOW_HREF = "/book-now";
export const CONTACT_HREF = "/experiences";

export const FEATURED_DINNER_HIGHLIGHTS = [
  "Egyptian & regional dinner buffet",
  "Live charcoal BBQ and brick-oven cooking",
  "Cultural performance and live music",
  "Illuminated courtyards and village atmosphere",
] as const;

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
