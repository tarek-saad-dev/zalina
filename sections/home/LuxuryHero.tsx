"use client";

import React, { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { NEUTRAL_MEDIA_FALLBACK } from "@/lib/media";

const STARS = [
  { top: "8%",  left: "12%", size: 2,   delay: "0s",   dur: "3.2s" },
  { top: "14%", left: "28%", size: 1.5, delay: "1.1s", dur: "4.5s" },
  { top: "6%",  left: "52%", size: 2.5, delay: "0.4s", dur: "2.8s" },
  { top: "19%", left: "73%", size: 1.5, delay: "2.0s", dur: "5.1s" },
  { top: "11%", left: "88%", size: 2,   delay: "0.8s", dur: "3.7s" },
  { top: "32%", left: "5%",  size: 1,   delay: "1.6s", dur: "4.0s" },
  { top: "25%", left: "42%", size: 1.5, delay: "0.2s", dur: "3.5s" },
  { top: "7%",  left: "65%", size: 2,   delay: "1.9s", dur: "4.2s" },
  { top: "40%", left: "95%", size: 1,   delay: "0.6s", dur: "5.5s" },
  { top: "22%", left: "18%", size: 1,   delay: "2.3s", dur: "3.0s" },
  { top: "15%", left: "80%", size: 2.5, delay: "1.4s", dur: "4.8s" },
  { top: "30%", left: "58%", size: 1,   delay: "0.9s", dur: "3.3s" },
];

const SIGNATURE_MOMENTS = [
  { num: "01", label: "Desert Dining" },
  { num: "02", label: "Private Majlis" },
  { num: "03", label: "Arabian Rituals" },
  { num: "04", label: "Wedding Nights" },
];

const RAIL_ITEMS = [
  { num: "01", label: "Desert Dining",    sub: "Beneath the open sky",   href: "#experiences" },
  { num: "02", label: "Private Majlis",   sub: "Intimate gatherings",     href: "#experiences" },
  { num: "03", label: "Arabian Rituals",  sub: "Ancient heritage alive",  href: "#experiences" },
  { num: "04", label: "Wedding Nights",   sub: "Unforgettable ceremonies", href: "#weddings" },
];

export function LuxuryHero() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgY     = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100vh", background: "transparent" }}
    >
      {/* ── LAYER 1: Background Image ─────────────────── */}
      <motion.div className="absolute inset-0" style={{ y: bgY, scale: bgScale }}>
        <Image
          src={NEUTRAL_MEDIA_FALLBACK}
          alt="Zalina Arabian Village at Night"
          fill
          className="object-cover object-center"
          priority
          quality={100}
        />
      </motion.div>

      {/* ── LAYER 2: Cinematic Overlays ───────────────── */}
      {/* Top dark gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, rgba(5,5,5,0.75) 0%, rgba(5,5,5,0.15) 30%, transparent 58%)",
        }}
      />
      {/* Bottom black fade */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(180deg, transparent 45%, rgba(5,5,5,0.65) 75%, #050505 100%)",
        }}
      />
      {/* Left side depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, rgba(5,5,5,0.45) 0%, transparent 50%)",
        }}
      />
      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 42%, rgba(5,5,5,0.5) 100%)",
        }}
      />
      {/* Gold radial glow from palace center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 42% at 50% 58%, rgba(212,175,55,0.11) 0%, transparent 72%)",
          animation: "hero-glow-pulse 7s ease-in-out infinite",
        }}
      />
      {/* Mist drift */}
      <div
        className="absolute bottom-0 left-0 right-0 h-[40%] pointer-events-none hero-mist"
        style={{
          background: "linear-gradient(to top, rgba(212,175,55,0.05) 0%, transparent 100%)",
        }}
      />

      {/* ── LAYER 3: Stars ────────────────────────────── */}
      {STARS.map((s, i) => (
        <div
          key={i}
          className="hero-star pointer-events-none"
          style={{
            top: s.top,
            left: s.left,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        />
      ))}

      {/* ── LAYER 4: Main Content ─────────────────────── */}
      <motion.div
        className="relative z-10 flex flex-col justify-center min-h-screen px-6 md:px-12 lg:px-20"
        style={{ opacity: fadeOut, paddingTop: "100px", paddingBottom: "200px" }}
      >
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-14">

          {/* ── Left / Main Text ──────────────────────── */}
          <div className="flex-1 max-w-2xl mt-5">

            {/* Location badge */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="inline-flex items-center gap-2 mb-7 px-3 py-1.5 rounded-full"
              style={{
                background: "rgba(212,175,55,0.07)",
                border: "1px solid rgba(212,175,55,0.22)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#D4AF37" }} />
              <span
                className="text-[10px] tracking-[0.24em] uppercase"
                style={{ color: "#D4AF37", fontFamily: "var(--font-body, sans-serif)" }}
              >
                Arabian Desert, Egypt
              </span>
            </motion.div>

            {/* Eyebrow */}
            {/* <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.22 }}
              className="lux-eyebrow mb-6"
            >
              Midnight Arabian Luxury
            </motion.p> */}

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.38 }}
              style={{
                fontFamily: "var(--font-display, 'Cormorant Garamond', serif)",
                fontSize: "clamp(44px, 6.2vw, 90px)",
                fontWeight: 400,
                lineHeight: 1.04,
                color: "#F8F5ED",
                letterSpacing: "-0.01em",
              }}
            >
              An Arabian Night
              <br />
              <span className="lux-shimmer" style={{ fontSize: "clamp(42px, 5.8vw, 86px)" }}>
                Designed to Be
              </span>
              <br />
              <span style={{ color: "#D4AF37", fontStyle: "italic" }}>
                Remembered.
              </span>
            </motion.h1>

            {/* Intro detail */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.9 }}
              className="mt-5 mb-1"
              style={{
                fontFamily: "var(--font-display, serif)",
                fontStyle: "italic",
                fontSize: "clamp(12px, 1.1vw, 14px)",
                color: "rgba(212,175,55,0.55)",
                letterSpacing: "0.04em",
              }}
            >
              A living Arabian destination beneath the stars
            </motion.p>

            {/* Gold divider */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.1, delay: 0.9 }}
              className="lux-divider mt-6 mb-8"
              style={{ transformOrigin: "left", maxWidth: "180px" }}
            />

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.05 }}
              style={{
                fontFamily: "var(--font-body, sans-serif)",
                fontSize: "clamp(14px, 1.35vw, 17px)",
                color: "rgba(248,245,237,0.68)",
                lineHeight: 1.8,
                maxWidth: "500px",
              }}
            >
              Discover immersive desert dining, private celebrations, cultural
              rituals, and unforgettable Arabian hospitality beneath the stars.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.25 }}
              className="flex flex-col sm:flex-row items-start gap-4 mt-10"
            >
              {/* Primary */}
              <Link
                href="#glimpse"
                className="inline-flex items-center justify-center gap-2 px-9 py-4 text-xs font-medium uppercase transition-all duration-300 sm:w-auto w-full"
                style={{
                  fontFamily: "var(--font-body, sans-serif)",
                  background: "linear-gradient(135deg, #D4AF37 0%, #B8963E 100%)",
                  color: "#050505",
                  borderRadius: "2px",
                  letterSpacing: "0.18em",
                  boxShadow: "0 8px 28px rgba(212,175,55,0.28)",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 14px 38px rgba(212,175,55,0.44)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 28px rgba(212,175,55,0.28)";
                }}
              >
                Explore the Village
              </Link>

              {/* Secondary — hidden on mobile */}
              <Link
                href="/experiences"
                className="hidden sm:inline-flex items-center justify-center gap-2 px-9 py-4 text-xs font-medium uppercase transition-all duration-300"
                style={{
                  fontFamily: "var(--font-body, sans-serif)",
                  background: "transparent",
                  color: "rgba(248,245,237,0.82)",
                  border: "1px solid rgba(212,175,55,0.38)",
                  borderRadius: "2px",
                  letterSpacing: "0.18em",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#D4AF37";
                  (e.currentTarget as HTMLElement).style.color = "#D4AF37";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,175,55,0.38)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(248,245,237,0.82)";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                View Experiences
              </Link>
            </motion.div>
          </div>

          {/* ── Right: Signature Moments Card ────────── */}
          {/* <motion.div
            initial={{ opacity: 0, x: 36, y: 16 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            transition={{ duration: 1.1, delay: 1.45, ease: "easeOut" }}
            className="hero-card-float hidden lg:block flex-shrink-0"
            style={{ width: "252px" }}
          >
            <div
              style={{
                background: "rgba(8,8,8,0.7)",
                border: "1px solid rgba(212,175,55,0.22)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                boxShadow: "0 28px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(212,175,55,0.08)",
              }}
            >
              <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)" }} />

              <div className="px-6 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(212,175,55,0.1)" }}>
                <p
                  className="text-[9px] tracking-[0.3em] uppercase mb-1"
                  style={{ color: "rgba(212,175,55,0.55)", fontFamily: "var(--font-body)" }}
                >
                  Zalina Arabian Village
                </p>
                <p
                  style={{
                    fontFamily: "var(--font-display, serif)",
                    fontSize: "15px",
                    fontWeight: 400,
                    color: "#F8F5ED",
                    letterSpacing: "0.02em",
                  }}
                >
                  Signature Moments
                </p>
              </div>

              <div className="px-6 py-2">
                {SIGNATURE_MOMENTS.map((m, i) => (
                  <div
                    key={m.num}
                    className="flex items-center gap-4 py-3"
                    style={{
                      borderBottom: i < SIGNATURE_MOMENTS.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                  >
                    <span
                      className="text-[9px] font-medium flex-shrink-0"
                      style={{ color: "rgba(212,175,55,0.42)", fontFamily: "var(--font-body)", minWidth: "18px" }}
                    >
                      {m.num}
                    </span>
                    <div className="w-4 h-px flex-shrink-0" style={{ background: "rgba(212,175,55,0.18)" }} />
                    <span
                      style={{
                        fontFamily: "var(--font-display, serif)",
                        fontSize: "13px",
                        color: "rgba(248,245,237,0.72)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {m.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4" style={{ borderTop: "1px solid rgba(212,175,55,0.08)" }}>
                <Link
                  href="/experiences"
                  className="flex items-center justify-between w-full transition-colors duration-300"
                  style={{ color: "rgba(212,175,55,0.45)", fontFamily: "var(--font-body)", fontSize: "10px", letterSpacing: "0.2em" }}
                  onMouseEnter={e => ((e.currentTarget as HTMLElement).style.color = "#D4AF37")}
                  onMouseLeave={e => ((e.currentTarget as HTMLElement).style.color = "rgba(212,175,55,0.45)")}
                >
                  <span className="uppercase tracking-widest text-[9px]">Discover All</span>
                  <span className="text-xs">→</span>
                </Link>
              </div>

              <div style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)" }} />
            </div>
          </motion.div> */}
        </div>
      </motion.div>

      {/* ── LAYER 5: Experience Preview Rail ─────────── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, delay: 1.7, ease: "easeOut" }}
        className="absolute bottom-0 left-0 right-0 z-20 px-6 md:px-12 lg:px-20 pb-6"
      >
        <div className="max-w-5xl mx-auto">
          {/* Thin gold top line */}
          <div
            className="mb-0"
            style={{ height: "1px", background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.35), transparent)", marginBottom: "0" }}
          />
          <div
            style={{
              background: "rgba(5,5,5,0.72)",
              border: "1px solid rgba(212,175,55,0.14)",
              borderTop: "none",
              backdropFilter: "blur(22px)",
              WebkitBackdropFilter: "blur(22px)",
            }}
          >
            {/* Desktop: horizontal row */}
            <div className="hidden sm:grid grid-cols-4">
              {RAIL_ITEMS.map((item, i) => (
                <Link
                  key={item.num}
                  href={item.href}
                  className="group relative flex flex-col justify-center px-6 py-5 transition-all duration-400 overflow-hidden"
                  style={{
                    borderRight: i < RAIL_ITEMS.length - 1 ? "1px solid rgba(212,175,55,0.1)" : "none",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "rgba(212,175,55,0.06)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                  }}
                >
                  {/* Number */}
                  <span
                    className="text-[9px] mb-2 block"
                    style={{ color: "rgba(212,175,55,0.4)", fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
                  >
                    {item.num}
                  </span>
                  {/* Label */}
                  <span
                    className="block mb-1 transition-colors duration-300 group-hover:text-[#D4AF37]"
                    style={{
                      fontFamily: "var(--font-display, serif)",
                      fontSize: "15px",
                      color: "rgba(248,245,237,0.82)",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {item.label}
                  </span>
                  {/* Sub */}
                  <span
                    className="text-[10px] tracking-wider"
                    style={{ color: "rgba(248,245,237,0.35)", fontFamily: "var(--font-body)" }}
                  >
                    {item.sub}
                  </span>
                  {/* Hover bottom line */}
                  <div
                    className="absolute bottom-0 left-6 right-6 h-px transition-opacity duration-400 opacity-0 group-hover:opacity-100"
                    style={{ background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)" }}
                  />
                </Link>
              ))}
            </div>

            {/* Mobile: 2×2 grid */}
            <div className="grid grid-cols-2 sm:hidden">
              {RAIL_ITEMS.map((item, i) => (
                <Link
                  key={item.num}
                  href={item.href}
                  className="flex flex-col justify-center px-5 py-4"
                  style={{
                    borderRight: i % 2 === 0 ? "1px solid rgba(212,175,55,0.1)" : "none",
                    borderBottom: i < 2 ? "1px solid rgba(212,175,55,0.1)" : "none",
                  }}
                >
                  <span
                    className="text-[8px] mb-1.5 block"
                    style={{ color: "rgba(212,175,55,0.4)", fontFamily: "var(--font-body)", letterSpacing: "0.15em" }}
                  >
                    {item.num}
                  </span>
                  <span
                    className="block"
                    style={{
                      fontFamily: "var(--font-display, serif)",
                      fontSize: "13px",
                      color: "rgba(248,245,237,0.78)",
                    }}
                  >
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Scroll Indicator ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.1 }}
        className="absolute z-20 hidden md:flex flex-col items-center gap-3"
        style={{ bottom: "180px", right: "2.5rem" }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-3"
        >
          <span
            style={{
              fontSize: "8px",
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "rgba(212,175,55,0.45)",
              fontFamily: "var(--font-body, sans-serif)",
              writingMode: "vertical-rl",
            }}
          >
            Discover
          </span>
          <div
            className="w-px"
            style={{ height: "44px", background: "linear-gradient(to bottom, rgba(212,175,55,0.45), transparent)" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
