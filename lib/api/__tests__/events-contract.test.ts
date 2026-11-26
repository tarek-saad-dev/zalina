import { describe, expect, it, vi, afterEach } from "vitest";
import { eventLandingPath, eventQuantitiesValid, createEventBooking, getEventPreview } from "../events";

afterEach(() => vi.unstubAllGlobals());

describe("event contract", () => {
  it("accepts only the edition's local landing path", () => {
    expect(eventLandingPath("/events/summer", "summer")).toBe("/events/summer");
    for (const path of ["//evil.test/events/summer", "/events/other", "/events/summer?x=1", "/events/summer#x"]) {
      expect(eventLandingPath(path, "summer")).toBeNull();
    }
  });
  it("enforces both shared guest capacity and package limits", () => {
    const packages = [{ id: 1, guests_per_package: 3, is_purchasable: true, max_purchasable_units: 4, remaining_units: null }, { id: 2, guests_per_package: 2, is_purchasable: true, max_purchasable_units: 2, remaining_units: 2 }];
    expect(eventQuantitiesValid(packages, { 1: 2, 2: 1 }, 8)).toBe(true);
    expect(eventQuantitiesValid(packages, { 1: 2, 2: 2 }, 8)).toBe(false);
    expect(eventQuantitiesValid(packages, { 1: 0, 2: 3 }, null)).toBe(false);
  });
  it("fails closed on malformed shared capacity and package caps", () => {
    const pkg = { id: 1, guests_per_package: 2, is_purchasable: true, max_purchasable_units: null, remaining_units: null };
    expect(eventQuantitiesValid([pkg], { 1: 2 }, 4)).toBe(true);
    for (const capacity of [null, NaN, Infinity, -1, 4.5]) {
      expect(eventQuantitiesValid([pkg], { 1: 1 }, capacity)).toBe(false);
    }
    expect(eventQuantitiesValid([{ ...pkg, remaining_units: NaN }], { 1: 1 }, 4)).toBe(false);
    expect(eventQuantitiesValid([pkg, pkg], { 1: 1 }, 4)).toBe(false);
    expect(eventQuantitiesValid([pkg], { "1": 1, "01": 1 }, 4)).toBe(false);
  });
  it("posts only the exact event fields", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test";
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: { booking_reference: "R" } }), { status: 201 }));
    vi.stubGlobal("fetch", fetcher);
    await createEventBooking({ event_edition_id: 4, packages: [{ package_id: 2, quantity: 1 }], guest_name: "A", guest_email: "a@example.test", guest_phone: "123" }, "ar");
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ product_type: "event", event_edition_id: 4, packages: [{ package_id: 2, quantity: 1 }], guest_name: "A", guest_email: "a@example.test", guest_phone: "123" });
    expect(fetcher.mock.calls[0][1].cache).toBe("no-store");
  });
  it("sends preview capabilities in a header with no-store", async () => {
    process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test";
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true, data: null })));
    vi.stubGlobal("fetch", fetcher);
    await getEventPreview("card", "secret", "en");
    expect(fetcher.mock.calls[0][0]).not.toContain("secret");
    expect(fetcher.mock.calls[0][1].headers.get("X-Event-Preview-Token")).toBe("secret");
    expect(fetcher.mock.calls[0][1].cache).toBe("no-store");
  });
});
