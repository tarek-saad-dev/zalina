"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { BOOK_NOW_HREF } from "./data";
import { NEUTRAL_MEDIA_FALLBACK } from "@/lib/media";

const PARTICLE_POSITIONS = [
  { left: "12%", top: "22%", delay: "0s", duration: "14s" },
  { left: "28%", top: "58%", delay: "2s", duration: "16s" },
  { left: "48%", top: "30%", delay: "1s", duration: "13s" },
  { left: "68%", top: "52%", delay: "2.5s", duration: "15s" },
  { left: "82%", top: "26%", delay: "0.8s", duration: "14s" },
  { left: "90%", top: "68%", delay: "1.8s", duration: "17s" },
];

export function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const reduce = Boolean(prefersReducedMotion);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const { scrollY } = useScroll();
  const enableParallax = !reduce && !isMobile;
  const y = useTransform(scrollY, [0, 500], [0, enableParallax ? 50 : 0]);
  const scale = useTransform(scrollY, [0, 500], [1, enableParallax ? 1.05 : 1]);

  return (
    <section
      className="relative w-full min-h-[100svh] overflow-hidden"
      aria-label="Experiences hero"
    >
      <motion.div className="absolute inset-0 will-change-transform" style={{ y, scale }}>
        <Image
          src={NEUTRAL_MEDIA_FALLBACK}
          alt="Lantern-lit Arabian courtyard under a starlit desert sky"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
      </motion.div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,5,5,0.55) 0%, rgba(8,11,18,0.28) 42%, rgba(5,5,5,0.78) 100%)",
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 75% 50% at 50% 48%, rgba(5,5,5,0.42) 0%, rgba(5,5,5,0.12) 50%, transparent 72%)",
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(5,5,5,0.45) 100%)",
        }}
        aria-hidden="true"
      />

      <div
        className="absolute inset-0 pointer-events-none exp-backlight-pulse"
        style={{
          background:
            "radial-gradient(ellipse 55% 40% at 50% 72%, rgba(232,198,106,0.1) 0%, transparent 65%)",
        }}
        aria-hidden="true"
      />

      <div className="exp-hero-stars" aria-hidden="true" />
      <div className="exp-hero-mist" aria-hidden="true" />

      <div
        className="absolute inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        {PARTICLE_POSITIONS.map((p, i) => (
          <span
            key={i}
            className="exp-particle"
            style={{
              left: p.left,
              top: p.top,
              animationDelay: p.delay,
              animationDuration: p.duration,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-5 pt-32 pb-28 text-center sm:pt-36 sm:pb-24">
        <div className="exp-container flex max-w-3xl flex-col items-center">
          <div className="exp-enter exp-enter-delay-1 mb-6 flex items-center gap-3 sm:mb-8 sm:gap-4">
            <span className="exp-editorial-line" aria-hidden="true" />
            <p className="exp-eyebrow">Curated Experiences</p>
            <span className="exp-editorial-line" aria-hidden="true" />
          </div>

          <h1
            className="exp-enter exp-enter-delay-2 exp-heading mb-5 max-w-[16ch] sm:mb-6 sm:max-w-3xl"
            style={{ textShadow: "0 6px 28px rgba(0,0,0,0.55)" }}
          >
            Designed to Be Remembered
          </h1>

          <p
            className="exp-enter exp-enter-delay-3 exp-body mb-8 max-w-md sm:mb-10 sm:max-w-lg"
            style={{ textShadow: "0 2px 16px rgba(0,0,0,0.45)" }}
          >
            Discover signature moments crafted with elegance, heritage, and
            Arabian warmth beneath the stars.
          </p>

          <div className="exp-enter exp-enter-delay-4 flex w-full max-w-xs flex-col items-stretch justify-center gap-2.5 sm:max-w-none sm:w-auto sm:flex-row sm:items-center sm:gap-3.5">
            <Link href="#experiences" className="exp-btn-primary">
              Explore Experiences
            </Link>
            <Link href={BOOK_NOW_HREF} className="exp-btn-secondary">
              Plan Your Visit
            </Link>
          </div>
        </div>

        <a
          href="#experiences"
          className="exp-scroll-indicator absolute bottom-7 left-1/2 flex -translate-x-1/2 flex-col items-center gap-1.5 text-[var(--exp-text-muted)] transition-colors hover:text-[var(--exp-gold)] sm:bottom-8"
          aria-label="Scroll to experiences"
        >
          <span className="text-[10px] uppercase tracking-[0.25em]">Scroll</span>
          <ChevronDown size={16} strokeWidth={1.5} aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
