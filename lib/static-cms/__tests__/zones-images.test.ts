import { describe, expect, it } from "vitest";
import { CMS_IMAGE_SLOTS, zoneImageSlot, zoneImageSlots } from "../schema";

describe("Zones image controls", () => {
  it("registers each fixed placement", () => {
    const ids = CMS_IMAGE_SLOTS.map(slot => slot.id);
    for (const id of ["zones.hero", "zones.overview", "zones.featured", "zones.journey.arrival", "zones.journey.explore", "zones.journey.live", "zones.journey.depart", "zones.booking.weddings", "zones.booking.corporate", "zones.booking.private", "zones.cta"]) expect(ids).toContain(id);
  });
  it("creates stable, bounded catalog controls with their own fallbacks", () => {
    const zones = [{id: 42, title: "Garden", image: "/garden.webp"}, {id: 3, title: "Hall", image: "/hall.webp"}];
    expect(zoneImageSlot(42)).toBe("zones.main.42");
    expect(zoneImageSlot(-1)).toBeNull();
    expect(zoneImageSlots(zones).map(s => [s.id, s.fallback])).toEqual([["zones.main.42", "/garden.webp"], ["zones.main.3", "/hall.webp"]]);
    expect(zoneImageSlots([])).toEqual([]);
  });
});
