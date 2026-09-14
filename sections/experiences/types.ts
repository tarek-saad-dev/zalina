export const EXPERIENCE_CATEGORIES = [
  "All Experiences",
  "Day",
  "Night",
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
  if (!value) return "All Experiences";
  if (isExperienceCategory(value)) return value;

  const normalized = value.trim().toLowerCase();
  if (normalized === "day") return "Day";
  if (normalized === "night") return "Night";
  if (normalized === "all" || normalized === "all experiences") {
    return "All Experiences";
  }

  return "All Experiences";
}

/** Message keys under `experiences.categories.*` / `experiences.categoryHeadings.*`. */
export const EXPERIENCE_CATEGORY_MESSAGE_KEYS: Record<
  ExperienceCategory,
  "all" | "day" | "night"
> = {
  "All Experiences": "all",
  Day: "day",
  Night: "night",
};

export function getCategoryMessageKey(
  category: string | null | undefined
): "all" | "day" | "night" {
  return EXPERIENCE_CATEGORY_MESSAGE_KEYS[parseExperienceCategory(category)];
}
