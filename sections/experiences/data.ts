import type { ExperienceCategory, ExperienceItem } from "./types";
import { parseExperienceCategory } from "./types";

export const BOOK_NOW_HREF = "/book-now";
export const CONTACT_HREF = "/contact";

export const FEATURED_DINNER_HIGHLIGHTS = [
  "Award-inspired culinary team",
  "Bespoke atmosphere design",
  "Personalized service excellence",
  "Lantern-lit courtyard ambience",
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
