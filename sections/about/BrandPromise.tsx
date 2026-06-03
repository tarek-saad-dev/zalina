"use client";

import React from "react";

export function BrandPromise() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-12">
      <div
        className="relative w-full h-[240px] rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #8A5A2F 0%, #D9B073 50%, #E7C58E 100%)",
        }}
      >
        {/* Decorative Gold Particles on Corners */}
        <div className="absolute top-6 left-6 w-3 h-3 rounded-full bg-white/30" />
        <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-white/30" />
        <div className="absolute bottom-6 left-6 w-3 h-3 rounded-full bg-white/30" />
        <div className="absolute bottom-6 right-6 w-3 h-3 rounded-full bg-white/30" />

        {/* Subtle Pattern Overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 0L40 20L20 40L0 20L20 0z' fill='none' stroke='white' stroke-width='1'/%3E%3C/svg%3E")`,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8">
          {/* Heading */}
          <h2
            className="text-3xl lg:text-4xl font-semibold mb-4"
            style={{
              color: "#221816",
              fontFamily: "var(--font-display)",
              textShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            Our Promise to You
          </h2>

          {/* Description */}
          <p
            className="text-sm lg:text-base max-w-2xl"
            style={{ color: "rgba(34, 24, 22, 0.85)", lineHeight: "1.7" }}
          >
            An unwavering commitment to excellence, authenticity, and the creation
            of extraordinary moments that transcend the ordinary
          </p>
        </div>

        {/* Shimmer Effect */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
            backgroundSize: "200% 100%",
            animation: "shimmer 3s ease-in-out infinite",
          }}
        />
      </div>
    </section>
  );
}
