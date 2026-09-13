/**
 * Future page-transition architecture (Phase 6) — stub only.
 *
 * App Router limitation: layout remounts are limited; shared UI stays mounted.
 * Safest pattern for Next.js App Router:
 *
 * 1. Client `PageTransitionProvider` in root layout (stays mounted)
 * 2. Intercept internal `<Link>` clicks (or use a thin NavLink wrapper)
 * 3. Play enter veil (dark/gold) ~200–350ms — transform + opacity only
 * 4. `router.push(href)` without artificial delay beyond veil coverage
 * 5. On new route paint, reverse / reveal veil ~200–350ms
 * 6. Total feel budget: 400–800ms — never stall navigation to look cinematic
 *
 * Avoid:
 * - wrapping every page in template.tsx forced remounts that break scroll/Lenis
 * - blocking `router.push` behind long timelines
 * - animating layout width/height or filter blur at full-viewport scale
 *
 * Framer Motion `AnimatePresence` on page trees is fragile with App Router;
 * prefer a fixed overlay layer controlled by the provider + GSAP timeline.
 */

import { motionConfig } from "./motionConfig";

export const pageTransitionPlan = {
  targetMs: {
    min: motionConfig.pageTransition.minMs,
    max: motionConfig.pageTransition.maxMs,
  },
  layers: ["veil-enter", "route-change", "veil-exit"] as const,
  properties: ["opacity", "transform"] as const,
  strategy: "overlay-provider" as const,
} as const;
