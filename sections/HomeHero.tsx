"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { ArrowRight } from "lucide-react";

import { NEUTRAL_MEDIA_FALLBACK } from "@/lib/media";

export function HomeHero() {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={NEUTRAL_MEDIA_FALLBACK}
          alt="Zalina Arabian Village at night"
          fill
          className="object-cover object-center"
          priority
          quality={90}
        />
        
        {/* Multi-layer Overlay for Cinematic Effect */}
        {/* Base darkening */}
        <div className="absolute inset-0 bg-[#0B0B0F]/40" />
        
        {/* Gradient overlay from left for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0F]/80 via-[#0B0B0F]/40 to-transparent" />
        
        {/* Gradient overlay from bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F]/60 via-transparent to-[#0B0B0F]/20" />
        
        {/* Subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(11,11,15,0.4)_100%)]" />
        
        {/* Warm glow overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_60%,rgba(212,169,90,0.08)_0%,transparent_50%)]" />
      </div>

      {/* Decorative Watermark Logo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/4 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-[0.08] pointer-events-none hidden md:block">
        <Image
          src="/assets/zalina-watermark.png"
          alt=""
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Navigation */}
      <Header />

      {/* Hero Content */}
      <div className="relative z-10 w-full min-h-screen flex items-center">
        <div className="w-full px-6 sm:px-8 lg:px-12 xl:px-16 pt-24 lg:pt-28">
          <div className="max-w-[1400px] mx-auto">
            <div className="max-w-2xl xl:max-w-3xl">
              {/* Eyebrow Text */}
              <div className="mb-6 animate-fade-in">
                <span className="text-[#D4A95A] text-xs sm:text-sm tracking-[0.3em] uppercase font-medium">
                  Midnight Arabian Luxury
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="font-serif text-[#F5E9DA] mb-8 animate-fade-in-up">
                <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.1] tracking-tight">
                  Timeless Heritage.
                </span>
                <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl leading-[1.1] tracking-tight mt-2">
                  Unforgettable Moments.
                </span>
              </h1>

              {/* Decorative Divider */}
              <div className="flex items-center gap-4 mb-8 animate-fade-in-up animation-delay-200">
                <div className="h-[1px] w-16 bg-gradient-to-r from-[#D4A95A] to-transparent" />
                <div className="w-2 h-2 rotate-45 border border-[#D4A95A]" />
                <div className="h-[1px] w-16 bg-gradient-to-l from-[#D4A95A] to-transparent" />
              </div>

              {/* Body Text */}
              <p className="text-[#F5E9DA]/80 text-base sm:text-lg lg:text-xl leading-relaxed max-w-xl mb-10 animate-fade-in-up animation-delay-300">
                Step into Zalina Arabian Village — where the spirit of Arabia comes alive through timeless architecture, rich traditions, and world-class hospitality.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-fade-in-up animation-delay-400">
                {/* Primary Button */}
                <Link
                  href="/book"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#D4A95A] text-[#0B0B0F] font-medium tracking-[0.1em] uppercase text-sm rounded-sm transition-all duration-300 hover:bg-[#E2BF7A] hover:shadow-[0_0_40px_rgba(212,169,90,0.35)] hover:-translate-y-0.5"
                >
                  Book Your Escape
                  <ArrowRight 
                    size={18} 
                    className="transition-transform duration-300 group-hover:translate-x-1" 
                  />
                </Link>

                {/* Secondary Button */}
                <Link
                  href="/experiences"
                  className="group inline-flex items-center justify-center gap-3 px-8 py-4 border border-[#D4A95A]/50 text-[#F5E9DA] font-medium tracking-[0.1em] uppercase text-sm rounded-sm transition-all duration-300 hover:border-[#D4A95A] hover:text-[#D4A95A] hover:bg-[#D4A95A]/10"
                >
                  Explore Experiences
                  <ArrowRight 
                    size={18} 
                    className="transition-transform duration-300 group-hover:translate-x-1" 
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 hidden lg:flex flex-col items-center gap-2 animate-bounce-slow">
        <span className="text-[#F5E9DA]/50 text-xs tracking-[0.2em] uppercase">
          Scroll
        </span>
        <div className="w-[1px] h-8 bg-gradient-to-b from-[#D4A95A]/50 to-transparent" />
      </div>
    </section>
  );
}
