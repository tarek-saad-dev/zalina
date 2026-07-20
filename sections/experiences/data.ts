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

export const EXPERIENCES: ExperienceItem[] = [
  {
    id: "signature-arabian-feast",
    title: "Signature Arabian Feast",
    description: "Traditional flavors in a lantern-lit courtyard.",
    image: "/assets/Flavors.png",
    label: "Dinner",
    categories: ["Dinner", "Signature", "Most Popular"],
    tags: ["Dinner", "Popular"],
    href: "/book-now",
  },
  {
    id: "golden-hour",
    title: "Golden Hour",
    description: "Watch the sunset over the village before the night begins.",
    image: "/assets/Twilight Gatherings.png",
    label: "Sunset",
    categories: ["Sunset", "Romantic"],
    tags: ["Sunset", "Romantic"],
    href: "/book-now",
  },
  {
    id: "private-majlis",
    title: "Private Majlis",
    description: "An intimate Arabian setting for private gatherings.",
    image: "/assets/Moments to Remember.png",
    label: "Private",
    categories: ["Private", "Signature"],
    tags: ["Private", "Signature"],
    href: "/book-now",
  },
  {
    id: "rituals-of-the-night",
    title: "Rituals of the Night",
    description: "A sensory journey through heritage, music, and atmosphere.",
    image: "/assets/Cultural Performances.png",
    label: "Signature",
    categories: ["Signature"],
    tags: ["Signature", "Cultural"],
    href: "/book-now",
  },
  {
    id: "wedding-nights",
    title: "Wedding Nights",
    description: "Cinematic celebrations beneath palms and lanterns.",
    image: "/assets/wedding.png",
    label: "Party",
    categories: ["Party", "Romantic"],
    tags: ["Weddings", "Romantic"],
    href: "/book-now",
  },
  {
    id: "chefs-fire-table",
    title: "Chef's Fire Table",
    description: "Live culinary moments crafted around flame, aroma, and taste.",
    image: "/assets/day.png",
    label: "Cooking",
    categories: ["Cooking", "Dinner"],
    tags: ["Cooking", "Dinner"],
    href: "/book-now",
  },
];

export function filterExperiences(
  category: string | null | undefined
): ExperienceItem[] {
  const selected = parseExperienceCategory(category);
  if (selected === "All Experiences") {
    return EXPERIENCES;
  }
  return EXPERIENCES.filter((item) => item.categories.includes(selected));
}

export function getDefaultCategory(): ExperienceCategory {
  return "All Experiences";
}
