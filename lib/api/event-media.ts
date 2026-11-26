/** Only backend asset endpoints may appear in event content. */
export function eventMediaUrl(value: string | null | undefined, preview = false): string | null {
  if (!value) return null;
  try {
    const base = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!base) return null;
    const origin = new URL(base).origin;
    const url = new URL(value, origin);
    if (url.origin !== origin || !/^\/media\/assets\/[a-zA-Z0-9-]+(?:\/thumbnail)?$/.test(url.pathname) || url.hash || url.username || url.password) return null;
    let unknownParameter = false;
    url.searchParams.forEach((_value, key) => { if (key !== "preview_token") unknownParameter = true; });
    if (unknownParameter || (!preview && url.search)) return null;
    if (url.search && (url.searchParams.getAll("preview_token").length !== 1 || !url.searchParams.get("preview_token")?.trim())) return null;
    return url.toString();
  } catch { return null; }
}

export function eventEstimate(items: { website_price: string; quantity: number }[]): string | null {
  let total = BigInt(0);
  for (const item of items) {
    if (!/^\d+(?:\.\d{1,2})?$/.test(item.website_price) || !Number.isSafeInteger(item.quantity) || item.quantity < 0) return null;
    const [whole, fraction = ""] = item.website_price.split(".");
    total += (BigInt(whole) * BigInt(100) + BigInt(fraction.padEnd(2, "0"))) * BigInt(item.quantity);
  }
  return `${total / BigInt(100)}.${String(total % BigInt(100)).padStart(2, "0")}`;
}
