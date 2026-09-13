import { describe, expect, it } from "vitest";
import { resolveBookingPageLocale } from "../bookingLocale";

describe("resolveBookingPageLocale", () => {
  it("resolves explicit ?lang=ar to ar", () => {
    expect(resolveBookingPageLocale("ar")).toBe("ar");
  });

  it("resolves explicit ?lang=en to en", () => {
    expect(resolveBookingPageLocale("en")).toBe("en");
  });

  it("defaults to en when no lang query is present", () => {
    expect(resolveBookingPageLocale(null)).toBe("en");
    expect(resolveBookingPageLocale(undefined)).toBe("en");
    expect(resolveBookingPageLocale("")).toBe("en");
  });

  it("does not inherit a stale document lang when URL has no ?lang", () => {
    // Critical regression: previous Arabic page mutated <html lang="ar">.
    // A later /weddings visit without ?lang must still resolve to English.
    expect(
      resolveBookingPageLocale(null, { documentLang: "ar" })
    ).toBe("en");
    expect(
      resolveBookingPageLocale(undefined, { documentLang: "ar" })
    ).toBe("en");
    expect(resolveBookingPageLocale("", { documentLang: "ar" })).toBe("en");
  });

  it("still honors explicit Arabic query even if document lang is en", () => {
    expect(
      resolveBookingPageLocale("ar", { documentLang: "en" })
    ).toBe("ar");
  });
});
