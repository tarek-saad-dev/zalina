"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section
      className="relative w-full h-[360px] mt-12 overflow-hidden"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/assets/Twilight Gatherings.png"
          alt="Luxury sunset dining with palm trees and lanterns"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-5">
        <div className="mobile-container">
          {/* Hero Headline */}
          <h1
            className="exp-heading mb-3"
            style={{ maxWidth: "280px", marginInline: "auto" }}
          >
            Curated Experiences,
            <br />
            Designed to Be Remembered
          </h1>

          {/* Hero Description */}
          <p
            className="exp-body mb-5"
            style={{ maxWidth: "240px", marginInline: "auto" }}
          >
            Discover signature moments crafted with intention, elegance, and
            Arabian warmth
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-2">
            <Link
              href="#experiences"
              className="flex items-center justify-center text-xs font-medium transition-all duration-200 hover:opacity-90"
              style={{
                height: "34px",
                padding: "0 16px",
                background: "var(--exp-gold)",
                color: "#1A120B",
                borderRadius: "999px",
              }}
            >
              Explore
            </Link>
            <Link
              href="/book"
              className="flex items-center justify-center text-xs font-medium transition-all duration-200 hover:bg-[var(--exp-gold)]/10"
              style={{
                height: "34px",
                padding: "0 16px",
                background: "transparent",
                color: "var(--exp-text-primary)",
                borderRadius: "999px",
                border: "1px solid var(--exp-border)",
              }}
            >
              Book Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
