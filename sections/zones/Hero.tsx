"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section
      className="relative w-full h-[780px] overflow-hidden"
      style={{ marginTop: "-20px" }}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/zones-hero.jpg"
          alt="Zalina luxury resort at night"
          fill
          className="object-cover"
          priority
        />
        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />
      </div>

      {/* Content */}
      <div
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4"
        style={{ paddingTop: "28vh" }}
      >
        <div style={{ maxWidth: "680px" }}>
          {/* Title */}
          <h1 className="zones-hero-title mb-4">
            Explore the World of Zalina
          </h1>

          {/* Subtitle */}
          <p
            className="zones-body mb-6"
            style={{ fontSize: "16px", maxWidth: "520px", marginInline: "auto" }}
          >
            Discover our signature zones, each designed for unforgettable
            moments and extraordinary experiences
          </p>

          {/* Buttons */}
          <div className="flex items-center justify-center gap-4">
            <Link
              href="#zones"
              className="zones-btn-gold zones-radius-pill flex items-center justify-center text-sm font-medium"
              style={{ height: "44px", paddingInline: "28px" }}
            >
              Explore Zones
            </Link>
            <Link
              href="/book"
              className="flex items-center justify-center text-sm font-medium transition-all duration-200 hover:bg-white/10"
              style={{
                height: "44px",
                paddingInline: "28px",
                background: "rgba(17, 21, 28, 0.8)",
                color: "var(--zones-text-light)",
                borderRadius: "999px",
                border: "1px solid var(--zones-border)",
              }}
            >
              Book a Tour
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
