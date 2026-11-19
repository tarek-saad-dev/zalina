import { describe, expect, it } from "vitest";
import { mergeLoadedWithDrafts } from "../drafts";

describe("CMS draft preservation", () => {
  it("updates untouched text when another editor publishes new copy", () => {
    const old = { "ar:about.hero.subtitle": "old" };
    const published = { "ar:about.hero.subtitle": "new" };
    expect(mergeLoadedWithDrafts(old, published, new Set())).toEqual(published);
  });
  it("keeps actual unsaved edits across page and language refreshes", () => {
    const current = { "ar:about.hero.subtitle": "local draft", "en:about.hero.subtitle": "old" };
    const fresh = { "ar:about.hero.subtitle": "new remote", "en:about.hero.subtitle": "new English" };
    expect(mergeLoadedWithDrafts(current, fresh, new Set(["ar:about.hero.subtitle"]))).toEqual({
      "ar:about.hero.subtitle": "local draft",
      "en:about.hero.subtitle": "new English"
    });
  });
  it("preserves only edited alt descriptions", () => {
    const old = { "about.hero": {ar:"draft",en:"original"}, "about.cta": {ar:"old",en:"old"} };
    const fresh = { "about.hero": {ar:"remote",en:"remote"}, "about.cta": {ar:"fresh",en:"fresh"} };
    const result = mergeLoadedWithDrafts(old,fresh,new Set(["about.hero"]));
    expect(result["about.hero"].ar).toBe("draft");
    expect(result["about.cta"].ar).toBe("fresh");
  });
});
