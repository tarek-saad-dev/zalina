/**
 * Refresh server-published content without replacing actual local editor drafts.
 * Unedited values always adopt the latest server response to avoid stale
 * previously-loaded text overwriting changes from another administrator.
 */
export function mergeLoadedWithDrafts<T>(
  current: Record<string, T>,
  loaded: Record<string, T>,
  edited: ReadonlySet<string>
): Record<string, T> {
  const next = { ...current };
  for (const [key, value] of Object.entries(loaded)) {
    if (!edited.has(key)) next[key] = value;
  }
  return next;
}
