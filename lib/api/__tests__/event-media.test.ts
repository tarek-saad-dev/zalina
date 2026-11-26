import { describe, expect, it, beforeEach } from "vitest";
import { eventEstimate, eventMediaUrl } from "../event-media";
describe("event media and estimates", () => {
  beforeEach(() => { process.env.NEXT_PUBLIC_API_BASE_URL = "https://api.example.test"; });
  it("accepts only backend asset paths and confines preview tokens to previews", () => {
    expect(eventMediaUrl("/media/assets/123/thumbnail")).toBe("https://api.example.test/media/assets/123/thumbnail");
    expect(eventMediaUrl("https://evil.test/media/assets/123")).toBeNull();
    expect(eventMediaUrl("/storage/123")).toBeNull();
    expect(eventMediaUrl("/media/assets/123?preview_token=secret")).toBeNull();
    expect(eventMediaUrl("/media/assets/123?preview_token=secret", true)).toContain("preview_token=secret");
  });
  it("calculates decimal estimates without floating point", () => {
    expect(eventEstimate([{website_price: "0.10", quantity: 3}, {website_price: "12.99", quantity: 2}])).toBe("26.28");
    expect(eventEstimate([{website_price: "NaN", quantity: 1}])).toBeNull();
  });
});
