/**
 * Shared API envelope + CMS catalog types.
 * Booking Domain V2 checkout types live in `./booking-types`.
 */

import type { MediaAsset, RawApiMedia } from "@/lib/media";

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
  links?: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}

/** @deprecated Prefer MediaAsset / CmsMedia from @/lib/media */
export type ApiMedia = RawApiMedia;

/** CMS marketing zones — not linked to bookings in V2. */
export interface ApiZone {
  id: number;
  name_en: string;
  name_ar: string;
  slug_en: string;
  slug_ar: string;
  /** Present on some payloads; optional on live V2 catalog. */
  type?: string;
  description_en?: string | null;
  description_ar?: string | null;
  display_order?: number;
  is_active?: boolean;
  is_bookable_online?: boolean;
  cover_image?: MediaAsset | null;
  gallery?: MediaAsset[];
  media?: MediaAsset[];
}

/** CMS experiences — marketing only; not bookable in Booking Domain V2. */
export interface ApiExperience {
  id: number;
  name_en: string;
  name_ar: string;
  slug_en?: string;
  slug_ar?: string;
  type: string;
  /** Present on some CMS payloads; never used in V2 booking totals. */
  price_per_person?: string;
  description_en?: string | null;
  description_ar?: string | null;
  display_order?: number;
  is_active: boolean;
  zone?: ApiZone;
  cover_image?: MediaAsset | null;
  gallery?: MediaAsset[];
  media?: MediaAsset[];
}

/** CMS add-ons — marketing only; not part of V2 checkout. */
export interface ApiAddOn {
  id: number;
  name_en: string;
  name_ar: string;
  type: string;
  price: string;
  pricing_type: "per_person" | "per_booking" | "fixed" | string;
  cover_image?: MediaAsset | null;
  gallery?: MediaAsset[];
  media?: MediaAsset[];
}

export interface ApiBlog {
  id: number;
  title_en: string;
  title_ar: string;
  slug_en: string;
  slug_ar: string;
  content_en: string;
  content_ar: string;
  status: string;
  published_at: string | null;
}

/**
 * CMS page resource (GET /pages/{slug}).
 * Documented as HTML title/content only — no media slots in the contract.
 * Live production currently returns 404 for all probed slugs (unpublished / empty).
 */
export interface ApiPage {
  id: number;
  title_en: string;
  title_ar: string;
  slug_en: string;
  slug_ar: string;
  content_en: string;
  content_ar: string;
  is_published: boolean;
}

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;
  requestId?: string;

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>,
    requestId?: string
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.requestId = requestId;
  }
}
