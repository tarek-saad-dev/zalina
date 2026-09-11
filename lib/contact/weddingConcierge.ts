/**
 * Central Wedding Concierge destination.
 *
 * Set ONE real channel via env (preferred) or by editing WEDDING_CONCIERGE below.
 * If nothing real is configured, CTAs that would navigate outbound stay hidden.
 *
 * Supported shapes:
 * - WhatsApp: https://wa.me/20XXXXXXXXXX
 * - Phone:    tel:+20XXXXXXXXXX
 * - Email:    mailto:weddings@example.com
 * - Internal: /some-real-route
 */

export type WeddingConciergeChannel =
  | "whatsapp"
  | "phone"
  | "email"
  | "url"
  | "none";

export interface WeddingConciergeConfig {
  channel: WeddingConciergeChannel;
  /** Full href when channel is configured. Empty/null = not configured. */
  href: string | null;
}

function trimOrNull(value: string | undefined | null): string | null {
  if (!value) return null;
  const t = value.trim();
  return t.length ? t : null;
}

function isPlaceholderHref(href: string): boolean {
  const lower = href.toLowerCase();
  return (
    lower.includes("example.com") ||
    lower.includes("placeholder") ||
    lower === "mailto:" ||
    lower === "tel:" ||
    lower === "https://wa.me/" ||
    lower === "#"
  );
}

/**
 * Resolve concierge destination from env first, then static config.
 * Env vars (optional):
 * - NEXT_PUBLIC_WEDDING_CONCIERGE_WHATSAPP (digits or full wa.me URL)
 * - NEXT_PUBLIC_WEDDING_CONCIERGE_EMAIL
 * - NEXT_PUBLIC_WEDDING_CONCIERGE_PHONE
 * - NEXT_PUBLIC_WEDDING_CONCIERGE_URL
 */
export function getWeddingConciergeConfig(): WeddingConciergeConfig {
  const wa = trimOrNull(process.env.NEXT_PUBLIC_WEDDING_CONCIERGE_WHATSAPP);
  if (wa) {
    const href = wa.startsWith("http")
      ? wa
      : `https://wa.me/${wa.replace(/[^\d]/g, "")}`;
    if (!isPlaceholderHref(href)) {
      return { channel: "whatsapp", href };
    }
  }

  const email = trimOrNull(process.env.NEXT_PUBLIC_WEDDING_CONCIERGE_EMAIL);
  if (email) {
    const href = email.startsWith("mailto:") ? email : `mailto:${email}`;
    if (!isPlaceholderHref(href)) {
      return { channel: "email", href };
    }
  }

  const phone = trimOrNull(process.env.NEXT_PUBLIC_WEDDING_CONCIERGE_PHONE);
  if (phone) {
    const href = phone.startsWith("tel:") ? phone : `tel:${phone}`;
    if (!isPlaceholderHref(href)) {
      return { channel: "phone", href };
    }
  }

  const url = trimOrNull(process.env.NEXT_PUBLIC_WEDDING_CONCIERGE_URL);
  if (url && !isPlaceholderHref(url)) {
    return { channel: "url", href: url };
  }

  // Static override — leave href null until a real destination is provided.
  const STATIC: WeddingConciergeConfig = {
    channel: "none",
    href: null,
  };

  if (STATIC.href && !isPlaceholderHref(STATIC.href)) {
    return STATIC;
  }

  return { channel: "none", href: null };
}

export function isWeddingConciergeConfigured(): boolean {
  const cfg = getWeddingConciergeConfig();
  return Boolean(cfg.href && !isPlaceholderHref(cfg.href));
}

export function getWeddingConciergeHref(): string | null {
  const cfg = getWeddingConciergeConfig();
  if (!cfg.href || isPlaceholderHref(cfg.href)) return null;
  return cfg.href;
}
