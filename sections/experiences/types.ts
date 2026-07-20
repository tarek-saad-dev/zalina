export const EXPERIENCE_CATEGORIES = [
  "All Experiences",
  "Dinner",
  "Sunset",
  "Private",
  "Cooking",
  "Party",
  "Most Popular",
  "Signature",
  "Romantic",
] as const;

export type ExperienceCategory = (typeof EXPERIENCE_CATEGORIES)[number];

export interface ExperienceItem {
  id: string;
  title: string;
  description: string;
  image: string;
  /** Primary label shown on the card */
  label: string;
  /** Categories used for filtering */
  categories: ExperienceCategory[];
  tags: string[];
  href: string;
}

export function isExperienceCategory(
  value: string
): value is ExperienceCategory {
  return (EXPERIENCE_CATEGORIES as readonly string[]).includes(value);
}

export function parseExperienceCategory(
  value: string | null | undefined
): ExperienceCategory {
  if (value && isExperienceCategory(value)) {
    return value;
  }
  return "All Experiences";
}

const CATEGORY_HEADINGS: Record<ExperienceCategory, string> = {
  "All Experiences": "Our Experiences",
  Dinner: "Dinner Experiences",
  Sunset: "Sunset Experiences",
  Private: "Private Experiences",
  Cooking: "Culinary Experiences",
  Party: "Celebration Experiences",
  "Most Popular": "Most Popular Experiences",
  Signature: "Signature Experiences",
  Romantic: "Romantic Experiences",
};

export function getCategoryHeading(
  category: string | null | undefined
): string {
  const safe = parseExperienceCategory(category);
  return CATEGORY_HEADINGS[safe];
}
