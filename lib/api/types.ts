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

export interface ApiMedia {
  id?: number;
  file_name: string;
  mime_type?: string;
  size?: number;
  collection_name?: string;
  url?: string;
  original_url?: string;
}

export interface ApiZone {
  id: number;
  name_en: string;
  name_ar: string;
  slug_en: string;
  slug_ar: string;
  type: string;
  is_bookable_online: boolean;
  media?: ApiMedia[];
}

export interface ApiAccommodation {
  id: number;
  name_en: string;
  name_ar: string;
  slug_en: string;
  slug_ar: string;
  max_guests: number;
  base_price: string;
  is_active: boolean;
  zone: ApiZone;
  media: ApiMedia[];
}

export interface ApiExperience {
  id: number;
  name_en: string;
  name_ar: string;
  type: string;
  price_per_person: string;
  is_active: boolean;
  zone: ApiZone;
  media: ApiMedia[];
}

export interface ApiAddOn {
  id: number;
  name_en: string;
  name_ar: string;
  type: string;
  price: string;
  pricing_type: "per_person" | "per_booking" | "fixed" | string;
}

export interface ApiAvailability {
  availability: boolean;
  price_per_night: string;
  total_estimate: string;
}

export interface CreateBookingPayload {
  accommodation_id: number;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  add_ons?: Array<{ id: number; quantity: number }>;
  experiences?: Array<{
    id: number;
    participants: number;
    date: string;
  }>;
}

export interface ApiBooking {
  booking_reference: string;
  status: string;
  total: string;
  hold_expires_at: string | null;
  check_in_date: string;
  check_out_date: string;
  created_at: string;
  guest_name?: string;
  guest_email?: string;
  guest_phone?: string;
  accommodation?: ApiAccommodation;
  add_ons?: Array<{
    add_on: ApiAddOn;
    quantity: number;
    total_price: string;
  }>;
  experiences?: Array<{
    experience: ApiExperience;
    participants: number;
    date: string;
    total_price: string;
  }>;
  payment?: { status: string };
  tickets_count?: number;
}

export interface ApiPaymentSession {
  payment_url: string;
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

  constructor(
    message: string,
    status: number,
    errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}
