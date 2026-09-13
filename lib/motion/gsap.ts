import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { Flip } from "gsap/Flip";

let registered = false;

/**
 * Register GSAP plugins once (browser-safe). Call from client providers /
 * motion modules — never scatter gsap.registerPlugin across section files.
 */
export function registerGSAP(): typeof gsap {
  if (typeof window === "undefined") return gsap;
  if (registered) return gsap;

  gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, Flip);
  registered = true;
  return gsap;
}

export { gsap, useGSAP, ScrollTrigger, SplitText, Flip };
