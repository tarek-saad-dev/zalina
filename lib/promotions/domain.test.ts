import { describe, expect, it } from "vitest";
import {
  campaignWithinSchedule,
  localCampaignHref,
  normalizePromotions,
  safePromotionImage,
  selectCampaign,
} from "./domain";

const example = {
  id: 11,
  slug: "christmas-night",
  placements: ["top_bar", "floating_card"],
  priority: 9,
  title_ar: "ليلة الكريسماس",
  title_en: "Christmas Night",
  description_ar: "ليلة على النيل",
  description_en: "An evening beside the Nile",
  eyebrow_ar: "مناسبة خاصة",
  eyebrow_en: "Special Event",
  cta_label_ar: "احجز الآن",
  cta_label_en: "Book Now",
  cta_href: "/events/christmas-night",
  image_url: "/images/event.jpg",
  starts_at: "2026-12-01T00:00:00+02:00",
  ends_at: "2026-12-26T00:00:00+02:00",
  display_delay_seconds: 3,
  dismiss_for_hours: 24,
};

describe("Zalina CMS promotion domain", () => {
  it("normalizes valid campaigns and prioritizes higher priority", () => {
    const campaigns = normalizePromotions([
      { ...example, id: 12, priority: 1 },
      example,
    ]);
    expect(campaigns.map((x) => x.id)).toEqual(["11", "12"]);
    expect(campaigns[0].placements).toEqual(["top_bar", "floating_card"]);
  });

  it("filters disabled and invalid CMS items without breaking the site", () => {
    expect(normalizePromotions([
      { ...example, id: 1, enabled: false },
      { ...example, id: 2, cta_href: "javascript:alert(1)" },
      { ...example, id: 3, title_en: "" },
    ])).toEqual([]);
  });

  it("only permits internal links and prefixes localized routes", () => {
    expect(localCampaignHref("/events/christmas", "ar")).toBe("/ar/events/christmas");
    expect(localCampaignHref("/en/events/christmas", "ar")).toBe("/en/events/christmas");
    expect(localCampaignHref("https://example.com", "en")).toBeNull();
    expect(localCampaignHref("//example.com", "en")).toBeNull();
    expect(localCampaignHref("/\\external", "en")).toBeNull();
  });

  it("only displays within the configured publication window", () => {
    const [campaign] = normalizePromotions([example]);
    expect(campaignWithinSchedule(campaign, Date.parse("2026-12-20T12:00:00+02:00"))).toBe(true);
    expect(campaignWithinSchedule(campaign, Date.parse("2026-11-30T12:00:00+02:00"))).toBe(false);
    expect(campaignWithinSchedule(campaign, Date.parse("2026-12-26T00:00:00+02:00"))).toBe(false);
  });

  it("selects one campaign per placement and respects dismissal", () => {
    const campaigns = normalizePromotions([
      example,
      { ...example, id: 12, priority: 4, placements: ["top_bar"] },
    ]);
    const now = Date.parse("2026-12-20T12:00:00+02:00");
    expect(selectCampaign(campaigns, "top_bar", new Set(), now)?.id).toBe("11");
    expect(selectCampaign(campaigns, "top_bar", new Set(["11"]), now)?.id).toBe("12");
    expect(selectCampaign(campaigns, "floating_card", new Set(["11"]), now)).toBeNull();
  });

  it("rejects non-HTTPS external CMS images", () => {
    expect(safePromotionImage("http://example.com/image.jpg")).toBeNull();
    expect(safePromotionImage("data:image/svg+xml;base64,PHN2Zy8+")).toBeNull();
    expect(safePromotionImage("/uploads/christmas.jpg")).toBe("/uploads/christmas.jpg");
  });
});
