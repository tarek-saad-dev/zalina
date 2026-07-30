"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";

export function WeddingHero() {
  const prefersReduced = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check, { passive: true });
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <section
      className="relative w-full min-h-screen overflow-hidden flex items-center justify-center"
      aria-label="Weddings hero"
    >
      {/* Background Image with slow scale-in */}
      <motion.div
        className="absolute inset-0"
        initial={!prefersReduced ? { scale: 1.08 } : undefined}
        animate={!prefersReduced ? { scale: 1 } : undefined}
        transition={{ duration: 14, ease: "easeOut" }}
      >
        <Image
          src="/assets/wedding.png"
          alt="A grand wedding celebration at Zalina Arabian Village beneath lanterns, palms, and heritage architecture"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
      </motion.div>

      {/* Dark vignette — warmer tint for wedding emotion */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background: `
            radial-gradient(ellipse at center, transparent 30%, rgba(5,5,5,0.65) 100%),
            linear-gradient(180deg, rgba(5,5,5,0.4) 0%, rgba(5,5,5,0.05) 40%, rgba(5,5,5,0.55) 100%)
          `,
        }}
      />

      {/* Warm amber glow behind headline — larger & warmer than zones */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 55% 45% at 50% 48%, rgba(200,155,82,0.14) 0%, transparent 70%)",
        }}
      />

      {/* Stars layer */}
      <div
        className="exp-hero-stars absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Mist drift */}
      <div
        className="exp-hero-mist absolute inset-0 pointer-events-none"
        aria-hidden="true"
      />

      {/* Gold particles */}
      {!isMobile && !prefersReduced && (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {[
            { top: "20%", left: "10%", delay: "0s" },
            { top: "45%", left: "85%", delay: "4s" },
            { top: "70%", left: "20%", delay: "7s" },
          ].map((p, i) => (
            <span
              key={i}
              className="exp-particle"
              style={{ top: p.top, left: p.left, animationDelay: p.delay }}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-5 sm:px-8 pt-32 sm:pt-28 md:pt-0 max-w-[720px] mx-auto">
        {/* Eyebrow */}
        <motion.span
          className="block text-xs md:text-[11px] font-medium tracking-[0.3em] uppercase mb-5"
          style={{ color: "var(--zones-gold)" }}
          initial={!prefersReduced ? { opacity: 0, y: 18 } : undefined}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          WEDDINGS AT ZALINA
        </motion.span>

        {/* Gold divider */}
        <motion.div
          className="mb-5"
          aria-hidden="true"
          style={{
            width: "56px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, var(--zones-gold), transparent)",
          }}
          initial={!prefersReduced ? { opacity: 0, scaleX: 0 } : undefined}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />

        {/* Headline */}
        <motion.h1
          className="zones-hero-title mb-4"
          style={{ fontSize: "clamp(2.25rem, 5.5vw, 3.75rem)" }}
          initial={
            !prefersReduced
              ? { opacity: 0, y: 24, filter: "blur(6px)" }
              : undefined
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, delay: 0.5 }}
        >
          A Wedding Night Written in Gold
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="zones-body mb-8 max-w-[540px]"
          style={{ fontSize: "clamp(0.9375rem, 1.2vw, 1.0625rem)" }}
          initial={!prefersReduced ? { opacity: 0, y: 16 } : undefined}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
        >
          Celebrate beneath lanterns, palms, heritage architecture, and a sky
          full of stars — where every detail is designed to feel timeless.
        </motion.p>

        {/* Buttons */}
        <motion.div
          className="flex w-full flex-col sm:w-auto sm:flex-row items-center justify-center gap-3 sm:gap-4"
          initial={!prefersReduced ? { opacity: 0, y: 14 } : undefined}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
        >
          <Link
            href="/book-now"
            className="zones-btn-gold zones-radius-pill flex w-full sm:w-auto items-center justify-center text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11151c]"
            style={{ height: "44px", paddingInline: "28px" }}
          >
            Begin Your Wedding Journey
          </Link>
          <Link
            href="/zones"
            className="flex w-full sm:w-auto items-center justify-center text-sm font-medium transition-all duration-300 hover:bg-white/10 hover:border-[var(--zones-gold)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--zones-gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#11151c]"
            style={{
              height: "44px",
              paddingInline: "28px",
              background: "rgba(17, 21, 28, 0.65)",
              color: "var(--zones-text-light)",
              borderRadius: "999px",
              border: "1px solid var(--zones-border)",
              backdropFilter: "blur(8px)",
            }}
          >
            Explore Venues
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        aria-hidden="true"
        initial={!prefersReduced ? { opacity: 0 } : undefined}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
      >
        <span
          className="text-[10px] tracking-[0.2em] uppercase"
          style={{ color: "var(--zones-text-muted)" }}
        >
          Scroll
        </span>
        <ChevronDown
          size={18}
          className="exp-scroll-indicator"
          style={{ color: "var(--zones-gold)" }}
        />
      </motion.div>
    </section>
  );
}
