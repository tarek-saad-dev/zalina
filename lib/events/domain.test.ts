import { describe, expect, it } from "vitest";
import { demoAvailability, demoEvents } from "./fixtures";
import {
  eventMediaUrl,
  formattedEventDate,
  formattedEventMoney,
  localized,
  normalizeAvailability,
  normalizeEventDetail,
  normalizeEventList,
  normalizeEventSummary,
  safeEventSlug,
} from "./domain";

describe("Zalina event catalog domain", () => {
  const christmas = demoEvents[0];

  it("accepts real-shaped published event catalog entries", () => {
    const result = normalizeEventList([christmas]);
    expect(result).toHaveLength(1);
    expect(result[0].slug).toBe("christmas-night-preview");
    expect(result[0].booking_status).toBe("open");
    expect(result[0].starting_price).toBe("950.00");
  });

  it("rejects malformed slugs, missing translations and missing IDs", () => {
    expect(safeEventSlug("../admin")).toBe(false);
    expect(safeEventSlug("christmas-night")).toBe(true);
    expect(normalizeEventSummary({ ...christmas, slug: "../admin" })).toBeNull();
    expect(normalizeEventSummary({ ...christmas, title_ar: "" })).toBeNull();
    expect(normalizeEventSummary({ ...christmas, id: 0 })).toBeNull();
  });

  it("defaults unknown booking statuses to closed, not bookable", () => {
    expect(normalizeEventSummary({ ...christmas, booking_status: "published" })?.booking_status).toBe("closed");
  });

  it("normalizes detail occurrences and packages with stable order", () => {
    const result = normalizeEventDetail({
      ...christmas,
      packages: [...christmas.packages].reverse(),
      occurrences: [...christmas.occurrences].reverse(),
    });
    expect(result?.packages.map((p) => p.id)).toEqual([9201, 9202, 9203]);
    expect(result?.occurrences.map((o) => o.id)).toEqual([9101, 9102]);
    expect(result?.packages[1].pricing_mode).toBe("per_package");
    expect(result?.packages[1].guests_per_unit).toBe(2);
  });

  it("never accepts an untrusted executable media URL", () => {
    expect(eventMediaUrl("javascript:alert(1)")).toBeNull();
    expect(eventMediaUrl("data:image/svg+xml;base64,PD94bWw+")).toBeNull();
    expect(eventMediaUrl("http://example.com/a.jpg")).toBeNull();
    expect(eventMediaUrl("https://example.com/a.jpg")).toBe("https://example.com/a.jpg");
    expect(eventMediaUrl("/assets/zalina-hero-bg.png")).toBe("/assets/zalina-hero-bg.png");
  });

  it("validates availability response against requested occurrence", () => {
    const raw = demoAvailability(christmas.slug, 9101);
    expect(raw).not.toBeNull();
    expect(normalizeAvailability(raw, 9101)?.packages).toHaveLength(3);
    expect(normalizeAvailability(raw, 9102)).toBeNull();
  });

  it("rejects availability without server-provided unit prices", () => {
    expect(normalizeAvailability({
      occurrence_id: 10,
      packages: [{ package_id: 11, available: true, remaining_units: 4 }],
    }, 10)?.packages).toEqual([]);
  });

  it("formats locale-aware event values in Africa/Cairo time", () => {
    expect(formattedEventDate("2026-12-24T19:00:00+02:00", "en")).toContain("2026");
    expect(formattedEventMoney("1000.00", "EGP", "en")).toContain("EGP");
    expect(localized(christmas, "title", "ar")).toBe("ليلة الكريسماس في زالينا");
  });

  it("keeps catalogue empty when backend content is malformed", () => {
    expect(normalizeEventList({ items: [{ id: -2 }, null, {}] })).toEqual([]);
    expect(normalizeEventList("invalid")).toEqual([]);
  });
});
