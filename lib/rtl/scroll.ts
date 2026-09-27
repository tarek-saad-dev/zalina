/**
 * Cross-browser helpers for horizontal scroll carousels under RTL.
 * Chromium/Firefox use negative scrollLeft in RTL; some WebKit builds invert.
 */

export type RtlScrollMode = "ltr" | "negative" | "reverse";

export function detectRtlScrollMode(el: HTMLElement): RtlScrollMode {
  if (getComputedStyle(el).direction !== "rtl") return "ltr";

  const prev = el.scrollLeft;
  el.scrollLeft = 1;
  const mode: RtlScrollMode = el.scrollLeft === 0 ? "negative" : "reverse";
  el.scrollLeft = prev;
  return mode;
}

/** Distance from the natural start edge (0) toward the end (max). */
export function getScrollDistance(el: HTMLElement, mode?: RtlScrollMode): number {
  const resolved = mode ?? detectRtlScrollMode(el);
  const max = Math.max(0, el.scrollWidth - el.clientWidth);
  const { scrollLeft } = el;

  if (resolved === "ltr") return scrollLeft;
  if (resolved === "negative") return Math.abs(Math.min(0, scrollLeft));
  return Math.max(0, max - scrollLeft);
}

export function getMaxScroll(el: HTMLElement): number {
  return Math.max(0, el.scrollWidth - el.clientWidth);
}

/** Scroll forward in reading order (LTR → right, RTL → left). */
export function scrollForward(
  el: HTMLElement,
  amount: number,
  behavior: ScrollBehavior = "smooth",
  mode?: RtlScrollMode
) {
  const resolved = mode ?? detectRtlScrollMode(el);
  const delta =
    resolved === "ltr" ? amount : resolved === "negative" ? -amount : amount;
  el.scrollBy({ left: delta, behavior });
}

export function scrollToStart(
  el: HTMLElement,
  behavior: ScrollBehavior = "smooth",
  mode?: RtlScrollMode
) {
  const resolved = mode ?? detectRtlScrollMode(el);
  const max = getMaxScroll(el);
  const left = resolved === "reverse" ? max : 0;
  el.scrollTo({ left, behavior });
}

export function isNearStart(
  el: HTMLElement,
  threshold = 10,
  mode?: RtlScrollMode
): boolean {
  return getScrollDistance(el, mode) <= threshold;
}

export function isNearEnd(
  el: HTMLElement,
  threshold = 50,
  mode?: RtlScrollMode
): boolean {
  const max = getMaxScroll(el);
  if (max <= 0) return true;
  return getScrollDistance(el, mode) >= max - threshold;
}
