/**
 * Pause continuous / decorative work when off-screen or tab hidden.
 * Use for future particle loops, gallery RAF, etc. — not for one-shot reveals.
 */

export type VisibilityController = {
  /** True when element intersects and document is visible */
  isActive: () => boolean;
  destroy: () => void;
  onChange: (cb: (active: boolean) => void) => () => void;
};

export function createVisibilityController(
  element: Element,
  options?: IntersectionObserverInit
): VisibilityController {
  let inView = false;
  let docVisible =
    typeof document === "undefined" ? true : document.visibilityState === "visible";
  const listeners = new Set<(active: boolean) => void>();

  const emit = () => {
    const active = inView && docVisible;
    listeners.forEach((cb) => cb(active));
  };

  const io =
    typeof IntersectionObserver !== "undefined"
      ? new IntersectionObserver(
          ([entry]) => {
            inView = Boolean(entry?.isIntersecting);
            emit();
          },
          { root: null, threshold: 0.05, ...options }
        )
      : null;

  io?.observe(element);

  const onVisibility = () => {
    docVisible = document.visibilityState === "visible";
    emit();
  };
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", onVisibility);
  }

  return {
    isActive: () => inView && docVisible,
    onChange: (cb) => {
      listeners.add(cb);
      cb(inView && docVisible);
      return () => listeners.delete(cb);
    },
    destroy: () => {
      io?.disconnect();
      if (typeof document !== "undefined") {
        document.removeEventListener("visibilitychange", onVisibility);
      }
      listeners.clear();
    },
  };
}
