import { describe, expect, it } from "vitest";
import { motionConfig } from "../motionConfig";
import { pageTransitionPlan } from "../pageTransition";
import { REDUCED_MOTION_MQ, motionMediaConditions } from "../reducedMotion";

describe("motionConfig", () => {
  it("keeps cinematic durations slower than UI micro-motion", () => {
    expect(motionConfig.duration.fast).toBeLessThan(motionConfig.duration.normal);
    expect(motionConfig.duration.normal).toBeLessThan(motionConfig.duration.slow);
    expect(motionConfig.duration.slow).toBeLessThanOrEqual(
      motionConfig.duration.cinematic
    );
  });

  it("keeps entrance displacement in the premium 12–40px band", () => {
    expect(motionConfig.displacement.subtle).toBeGreaterThanOrEqual(12);
    expect(motionConfig.displacement.emphasis).toBeLessThanOrEqual(40);
  });

  it("avoids bounce/elastic ease tokens", () => {
    const eases = Object.values(motionConfig.ease).join(" ");
    expect(eases).not.toMatch(/bounce|elastic|back\./i);
  });
});

describe("reducedMotion media", () => {
  it("exposes prefers-reduced-motion query", () => {
    expect(REDUCED_MOTION_MQ).toContain("prefers-reduced-motion");
    expect(motionMediaConditions.reduceMotion).toBe(REDUCED_MOTION_MQ);
  });

  it("uses width tiers for responsive motion (pointer via canHover)", () => {
    expect(motionMediaConditions.isDesktop).toBe("(min-width: 1024px)");
    expect(motionMediaConditions.canHover).toContain("pointer: fine");
  });
});

describe("pageTransitionPlan", () => {
  it("stays within 400–800ms budget", () => {
    expect(pageTransitionPlan.targetMs.min).toBe(400);
    expect(pageTransitionPlan.targetMs.max).toBe(800);
    expect(pageTransitionPlan.properties).toEqual(["opacity", "transform"]);
  });
});
