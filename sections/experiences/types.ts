export const EXPERIENCE_CATEGORIES = [
  "All Experiences",
  "Dinner",
  "Show",
  "Ritual",
] as const;

export type ExperienceCategory = (typeof EXPERIENCE_CATEGORIES)[number];

export interface ExperienceItem {
  id: string;
  title: string;
  description: string;
  image: string;
  imageAlt?: string;
  /** Primary label shown on the card */
  label: string;
  /** Categories used for filtering */
  categories: ExperienceCategory[];
  tags: string[];
  href: string;
  type?: string;
  price?: number;
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
  Show: "Show Experiences",
  Ritual: "Ritual Experiences",
};

export function getCategoryHeading(
  category: string | null | undefined
): string {
  const safe = parseExperienceCategory(category);
  return CATEGORY_HEADINGS[safe];
}
