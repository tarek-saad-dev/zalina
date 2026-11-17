import type { DayUseProduct } from "@/lib/api";
import type { TicketChoice } from "./types";

/** Legacy catalog rows without ticket_category are Day Use, never Observatory. */
export function categoryForDayUseProduct(product: DayUseProduct): "day_use" | "observatory_experience" {
  return product.ticket_category === "observatory_experience" ? "observatory_experience" : "day_use";
}
export function productsForTicketChoice(products: DayUseProduct[], choice: TicketChoice | null | undefined): DayUseProduct[] {
  if (choice === "cabin_stay") return [];
  const category = choice === "observatory_experience" ? "observatory_experience" : "day_use";
  return products.filter((p) => p.is_active && categoryForDayUseProduct(p) === category);
}
export function observatoryIsBookable(products: DayUseProduct[]): boolean {
  return productsForTicketChoice(products, "observatory_experience").some((p) =>
    Number.isSafeInteger(p.id) && p.id > 0 && Number.isFinite(Number(p.price_per_guest)) && Number(p.price_per_guest) >= 0 && Boolean(p.currency));
}
