import type { Metadata } from "next";
import { BookNowPage } from "@/components/book-now/BookNowPage";

export const metadata: Metadata = {
  title: "Book Now | Zalina Arabian Village",
  description:
    "Begin your Zalina experience. Choose your journey, personalize your stay, and let the village take care of the rest.",
};

export default function BookNow() {
  return <BookNowPage />;
}
