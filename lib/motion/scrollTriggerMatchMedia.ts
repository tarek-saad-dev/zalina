import { registerGSAP, gsap, ScrollTrigger } from "./gsap";
import { motionMediaConditions } from "./reducedMotion";

export type ResponsiveMotionContext = {
  isDesktop: boolean;
  isTablet: boolean;
  isMobile: boolean;
  reduceMotion: boolean;
  canHover: boolean;
};

type ResponsiveMotionSetup = (
  context: ResponsiveMotionContext
) => void | (() => void);

/**
 * ScrollTrigger-friendly responsive setup via gsap.matchMedia().
 * All animations/triggers created inside revert automatically on breakpoint change.
 *
 * Example:
 * ```ts
 * const mm = createResponsiveMotion(scope, (ctx) => {
 *   if (ctx.reduceMotion) {
 *     gsap.set(".hero", { clearProps: "all", autoAlpha: 1 });
 *     return;
 *   }
 *   if (ctx.isDesktop) { /* cinematic *\/ }
 *   else if (ctx.isTablet) { /* simplified *\/ }
 *   else { /* basic reveal *\/ }
 * });
 * // cleanup: mm.revert()
 * ```
 */
type ScopeRef = { current: Element | null };

export function createResponsiveMotion(
  scope: Element | ScopeRef | undefined,
  setup: ResponsiveMotionSetup
) {
  registerGSAP();
  const mm = gsap.matchMedia();

  const root =
    scope && typeof scope === "object" && "current" in scope
      ? (scope.current ?? undefined)
      : scope;

  mm.add(
    {
      isDesktop: motionMediaConditions.isDesktop,
      isTablet: motionMediaConditions.isTablet,
      isMobile: motionMediaConditions.isMobile,
      reduceMotion: motionMediaConditions.reduceMotion,
      canHover: motionMediaConditions.canHover,
    },
    (context) => {
      const conditions = context.conditions as ResponsiveMotionContext;
      return setup(conditions);
    },
    root
  );

  return mm;
}

/** Recalculate ScrollTrigger after layout / font / image changes. */
export function refreshScrollTrigger(): void {
  if (typeof window === "undefined") return;
  registerGSAP();
  ScrollTrigger.refresh();
}
