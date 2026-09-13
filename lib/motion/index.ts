export { motionConfig } from "./motionConfig";
export type { MotionConfig } from "./motionConfig";

export {
  registerGSAP,
  gsap,
  useGSAP,
  ScrollTrigger,
  SplitText,
  Flip,
} from "./gsap";

export {
  getPrefersReducedMotion,
  subscribeReducedMotion,
  REDUCED_MOTION_MQ,
  motionMediaConditions,
} from "./reducedMotion";

export {
  getDeviceCapability,
} from "./deviceCapability";
export type { DeviceCapability, MotionTier } from "./deviceCapability";

export {
  createResponsiveMotion,
  refreshScrollTrigger,
} from "./scrollTriggerMatchMedia";
export type { ResponsiveMotionContext } from "./scrollTriggerMatchMedia";

export {
  createSplitReveal,
  whenFontsReady,
} from "./splitText";
export type {
  SplitRevealHandle,
  CreateSplitRevealOptions,
  SplitTextMode,
} from "./splitText";

export { pageTransitionPlan } from "./pageTransition";
export { createVisibilityController } from "./visibility";
export type { VisibilityController } from "./visibility";

export { sceneTransitionConfig } from "./sceneTransitions";
export type { SceneTransitionConfig } from "./sceneTransitions";
