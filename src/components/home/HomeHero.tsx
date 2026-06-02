"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/Navbar";
import { ArrowRight } from "lucide-react";

export function HomeHero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#0B0B0F]">
      {/* Layer 1: Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/zalina-hero-bg.png"
          alt="Zalina Arabian Village at night"
          fill
          className="object-cover"
          style={{ objectPosition: '65% center' }}
          priority
          quality={100}
        />
      </div>

      {/* Layer 2: Watermark Logo - More visible but still blended */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="relative w-[80vw] h-[80vw] max-w-[900px] max-h-[900px] opacity-[0.18]">
          <Image
            src="/images/zalina-logo-full.png"
            alt=""
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Layer 3: FAST-FADING Left Overlay - Center/Right stays CLEAR */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(
            90deg,
            rgba(5, 5, 8, 0.82) 0%,
            rgba(5, 5, 8, 0.65) 12%,
            rgba(5, 5, 8, 0.38) 26%,
            rgba(5, 5, 8, 0.15) 40%,
            rgba(5, 5, 8, 0.04) 52%,
            rgba(5, 5, 8, 0) 62%
          )`
        }}
      />

      {/* Navigation */}
      <Navbar />

      {/* Hero Content - Smaller, more elegant, less visual weight */}
      <div className="relative z-10 w-full min-h-screen flex items-center">
        <div className="w-full px-8 lg:px-12 xl:px-16 pt-28 lg:pt-32">
          <div className="max-w-[480px]">
            {/* Eyebrow Text */}
            <div className="mb-4 animate-fade-in">
              <span
                className="text-[#D4A95A] text-[10px] tracking-[0.3em] uppercase font-medium"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Midnight Arabian Luxury
              </span>
            </div>

            {/* Main Headline - Smaller, more elegant */}
            <h1
              className="text-[#F5E9DA] mb-5 animate-fade-in-up"
              style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}
            >
              <span
                className="block font-normal"
                style={{
                  fontSize: 'clamp(40px, 4.2vw, 64px)',
                  lineHeight: '0.98',
                  letterSpacing: '0'
                }}
              >
                Timeless Heritage.
              </span>
              <span
                className="block font-normal mt-1"
                style={{
                  fontSize: 'clamp(40px, 4.2vw, 64px)',
                  lineHeight: '0.98',
                  letterSpacing: '0'
                }}
              >
                Unforgettable Moments.
              </span>
            </h1>

            {/* Decorative Divider */}
            <div className="flex items-center gap-3 mb-5 animate-fade-in-up animation-delay-200">
              <div className="h-[1px] w-10 bg-gradient-to-r from-[#D4A95A] to-transparent" />
              <div className="w-1.5 h-1.5 rotate-45 border border-[#D4A95A]" />
              <div className="h-[1px] w-10 bg-gradient-to-l from-[#D4A95A] to-transparent" />
            </div>

            {/* Body Text - Smaller */}
            <p
              className="text-[#F5E9DA]/70 text-[13px] leading-[1.65] max-w-[420px] mb-8 animate-fade-in-up animation-delay-300"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Step into Zalina Arabian Village — where the spirit of Arabia comes alive through timeless architecture, rich traditions, and world-class hospitality.
            </p>

            {/* CTA Buttons - Slimmer, cleaner */}
            <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up animation-delay-400">
              {/* Primary Gold Button */}
              <Link
                href="/book"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#D4A95A] text-[#0B0B0F] text-[11px] font-semibold tracking-[0.12em] uppercase rounded-sm transition-all duration-300 hover:bg-[#E2BF7A]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Book Your Escape
                <ArrowRight
                  size={12}
                  strokeWidth={2.5}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>

              {/* Secondary Button */}
              <Link
                href="/experiences"
                className="group inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border border-[#D4A95A]/50 text-[#F5E9DA] text-[11px] font-medium tracking-[0.12em] uppercase rounded-sm transition-all duration-300 hover:border-[#D4A95A] hover:text-[#D4A95A]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Explore Experiences
                <ArrowRight
                  size={12}
                  strokeWidth={2}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
