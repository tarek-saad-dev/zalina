import { describe, expect, it } from "vitest";
import { editorSelectionKey, isEditorSelectionReady } from "../editor-selection";

describe("CMS editor selected page / locale guard", () => {
  it("hides and locks old Home fields while About is still loading", () => {
    let loaded = editorSelectionKey("ar", "home");
    expect(isEditorSelectionReady(loaded, "ar", "home")).toBe(true);
    expect(isEditorSelectionReady(loaded, "ar", "about")).toBe(false);
    // Network delay: the earlier Home response remains loaded, never usable as About.
    expect(isEditorSelectionReady(loaded, "ar", "about")).toBe(false);
    loaded = editorSelectionKey("ar", "about");
    expect(isEditorSelectionReady(loaded, "ar", "about")).toBe(true);
  });
  it("does not let Arabic fields publish into English while switching locale", () => {
    const loaded = editorSelectionKey("ar", "about");
    expect(isEditorSelectionReady(loaded, "en", "about")).toBe(false);
    expect(isEditorSelectionReady("", "en", "about")).toBe(false);
    expect(isEditorSelectionReady(editorSelectionKey("en", "about"), "en", "about")).toBe(true);
  });
  it("rejects stale selection after a failed or skipped request", () => {
    expect(isEditorSelectionReady("en:gallery", "en", "zones")).toBe(false);
  });
});
