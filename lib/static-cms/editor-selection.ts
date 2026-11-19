import type { CmsPage, CmsLocale } from "./schema";

/** Editor fields are usable only after the current page/locale request wins. */
export function editorSelectionKey(locale: CmsLocale, page: CmsPage): string {
  return locale + ":" + page;
}

export function isEditorSelectionReady(
  loadedSelection: string,
  locale: CmsLocale,
  page: CmsPage
): boolean {
  return loadedSelection === editorSelectionKey(locale, page);
}
