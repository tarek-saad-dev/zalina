import type { Metadata } from "next";
import { BookNowPage } from "@/components/book-now/BookNowPage";
import { listAccommodationTypes } from "@/lib/api";
import type { AccommodationTypeMeta } from "@/components/book-now/types";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Book Now | Zalina Arabian Village",
  description:
    "Book Day Use or Bubble Stay at Zalina Arabian Village.",
};

export default async function BookNow() {
  const accommodations = await listAccommodationTypes();

  const catalog = {
    accommodationTypes: accommodations
      .filter((a) => a.is_active)
      .map(
        (a): AccommodationTypeMeta => ({
          id: a.id,
          slug: a.slug_en,
          name_en: a.name_en,
          name_ar: a.name_ar,
          description_en: a.description_en,
          description_ar: a.description_ar,
          max_guests: a.max_guests,
          price_per_night: a.price_per_night,
          is_active: a.is_active,
          bubbles_count: a.bubbles_count,
          cover_image: a.cover_image,
          gallery: a.gallery,
          media: a.media,
          bubbles: a.bubbles.map((b) => ({
            id: b.id,
            name_en: b.name_en,
            name_ar: b.name_ar,
            status: b.status,
            cover_image: b.cover_image,
            gallery: b.gallery,
            media: b.media,
          })),
        })
      ),
  };

  return <BookNowPage catalog={catalog} />;
}
