import { describe, expect, it } from "vitest";
import { isEventAvailability, isEventLanding, isEventBooking } from "../event-runtime";

describe("event payload boundaries", () => {
  it("rejects malformed landing collections and dates", () => {
    expect(isEventLanding({ availability_state: "booking_open", packages: {}, gallery: [] })).toBe(false);
    expect(isEventLanding({ availability_state: "booking_open", packages: [], gallery: [], event_starts_at: "bad" })).toBe(false);
  });
  it("rejects invalid availability capacity and package collections", () => {
    expect(isEventAvailability({ availability_state: "booking_open", sales_enabled: true, remaining_guest_capacity: -1, packages: [] })).toBe(false);
    expect(isEventAvailability({ availability_state: "booking_open", sales_enabled: true, remaining_guest_capacity: 2, packages: {} })).toBe(false);
  });
});

describe("event recovery payload", () => {
  const base = { product_type: "event", booking_reference: "BK-1", booking_code: "CODE", status: "confirmed", total: "0.00", currency: "EGP", guests: 2, hold_expires_at: null, payment_expires_at: null };
  it("accepts well-formed bookings but rejects missing codes and invalid tickets", () => {
    expect(isEventBooking(base)).toBe(true);
    expect(isEventBooking({ ...base, booking_code: "" })).toBe(false);
    expect(isEventBooking({ ...base, tickets: [{ status: "valid" }] })).toBe(false);
    expect(isEventBooking({ ...base, hold_expires_at: "bad" })).toBe(false);
  });
  it("recognizes feature-disabled availability without enabling sales", () => {
    expect(isEventAvailability({ availability_state: "feature_disabled", sales_enabled: false, remaining_guest_capacity: 0, packages: [] })).toBe(true);
  });
});


describe("render-safe event content", () => {
  const pkg = { id: 1, name_en: "Table", name_ar: "طاولة", description_en: null, description_ar: null, guests_per_package: 2, website_price: "100.00", image_url: null, is_purchasable: true, remaining_units: null, max_purchasable_units: 1, is_active: true };
  const landing = { availability_state: "booking_open", slug: "sample", event_edition_id: 1, name_en: "Event", name_ar: "فعالية", description_en: null, description_ar: null, cover_url: null, gallery: [{url: null, sort_order: 0}], event_starts_at: null, event_ends_at: null, admission_opens_at: null, admission_closes_at: null, sales_opens_at: null, sales_closes_at: null, currency: "EGP", packages: [pkg], remaining_guest_capacity: 2, public_sales_enabled: true, purchase_enabled: true };
  it("accepts complete landing data but rejects objects in renderable text", () => {
    expect(isEventLanding(landing)).toBe(true);
    expect(isEventLanding({ ...landing, description_en: {} })).toBe(false);
    expect(isEventLanding({ ...landing, packages: [{ ...pkg, name_en: {} }] })).toBe(false);
    expect(isEventLanding({ ...landing, packages: [{ ...pkg, description_ar: [] }] })).toBe(false);
    expect(isEventLanding({ ...landing, gallery: [{ url: null, sort_order: {} }] })).toBe(false);
  });
  it("rejects malformed booking line items and edition titles", () => {
    const booking = { product_type: "event", booking_reference: "BK-1", booking_code: "CODE", status: "confirmed", total: "100.00", currency: "EGP", guests: 2, hold_expires_at: null, payment_expires_at: null };
    const item = { package_id: 1, package_name_en: "Table", package_name_ar: "طاولة", quantity_purchased: 1, quantity_active: 1, guests_per_package: 2, applied_unit_price: "100.00", line_subtotal: "100.00" };
    expect(isEventBooking({ ...booking, event_items: [item] })).toBe(true);
    expect(isEventBooking({ ...booking, event_items: [{ ...item, quantity_active: {} }] })).toBe(false);
    expect(isEventBooking({ ...booking, event_items: [{ ...item, package_name_en: {} }] })).toBe(false);
    expect(isEventBooking({ ...booking, event_edition: { name_en: {}, name_ar: "فعالية", event_starts_at: null, admission_opens_at: null } })).toBe(false);
  });
});

describe("announcement render boundaries", () => {
  it("accepts nullable preview content and rejects renderable objects", async () => {
    const { isEventAnnouncement } = await import("../event-runtime");
    const preview = { type: "card", title_en: null, title_ar: null, description_en: null, description_ar: null, image_url: null, landing_path: null, edition_slug: null };
    expect(isEventAnnouncement(preview, true)).toBe(true);
    expect(isEventAnnouncement({ ...preview, title_en: {} }, true)).toBe(false);
    expect(isEventAnnouncement({ ...preview, description_ar: [] }, true)).toBe(false);
    expect(isEventAnnouncement({ ...preview, image_url: {} }, true)).toBe(false);
  });
});
