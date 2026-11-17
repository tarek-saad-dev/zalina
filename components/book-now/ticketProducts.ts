import type { DayUseProduct } from "@/lib/api";
import type { TicketChoice } from "./types";

/** Legacy catalog rows without ticket_category are Day Use, never Observatory. */
export function categoryForDayUseProduct(
  product: DayUseProduct
): "day_use" | "observatory_experience" {
  return product.ticket_category === "observatory_experience"
    ? "observatory_experience"
    : "day_use";
}

/** An Observatory choice requires its own genuine, valid, bookable per-guest price. */
export function isValidObservatoryProduct(product: DayUseProduct): boolean {
  const price = String(product.price_per_guest).trim();
  return (
    product.is_active &&
    categoryForDayUseProduct(product) === "observatory_experience" &&
    Number.isSafeInteger(product.id) &&
    product.id > 0 &&
    price.length > 0 &&
    Number.isFinite(Number(price)) &&
    Number(price) >= 0 &&
    typeof product.currency === "string" &&
    product.currency.trim().length > 0
  );
}

export function productsForTicketChoice(
  products: DayUseProduct[],
  choice: TicketChoice | null | undefined
): DayUseProduct[] {
  if (choice === "cabin_stay") return [];
  const category =
    choice === "observatory_experience" ? "observatory_experience" : "day_use";
  return products.filter(
    (product) =>
      product.is_active &&
      categoryForDayUseProduct(product) === category &&
      (category !== "observatory_experience" || isValidObservatoryProduct(product))
  );
}

export function observatoryIsBookable(products: DayUseProduct[]): boolean {
  return productsForTicketChoice(products, "observatory_experience").length > 0;
}
