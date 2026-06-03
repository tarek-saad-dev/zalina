"use client";

import React from "react";
import { Heart } from "lucide-react";

export function BrandPurpose() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-[900px] mx-auto">
        {/* Premium Panel */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            height: "180px",
            background: "linear-gradient(135deg, #55301B 0%, #221816 100%)",
            boxShadow: "0 0 40px rgba(201, 140, 67, 0.35)",
          }}
        >
          {/* Decorative Border */}
          <div
            className="absolute inset-0 rounded-3xl"
            style={{
              border: "1px solid rgba(217, 176, 115, 0.3)",
            }}
          />

          {/* Gold Particles on Corners */}
          <div className="absolute top-4 left-4 w-2 h-2 rounded-full bg-[#D9B073] opacity-60" />
          <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#D9B073] opacity-60" />
          <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-[#D9B073] opacity-60" />
          <div className="absolute bottom-4 right-4 w-2 h-2 rounded-full bg-[#D9B073] opacity-60" />

          {/* Floating Glowing Icon - Top Center */}
          <div
            className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #D9B073 0%, #8A5A2F 100%)",
              boxShadow: "0 0 30px rgba(217, 176, 115, 0.6)",
            }}
          >
            <Heart className="w-5 h-5 text-[#221816]" />
          </div>

          {/* Content */}
          <div className="h-full flex flex-col items-center justify-center text-center px-8 pt-4">
            {/* Label */}
            <span
              className="text-xs tracking-[0.2em] uppercase mb-3"
              style={{ color: "#E7C58E" }}
            >
              Our Philosophy
            </span>

            {/* Heading */}
            <h3
              className="text-2xl lg:text-3xl font-semibold mb-3"
              style={{ color: "#F8F6F2", fontFamily: "var(--font-display)" }}
            >
              Our Purpose: Creating Meaningful Luxury
            </h3>

            {/* Description */}
            <p
              className="text-sm max-w-xl"
              style={{ color: "rgba(214, 210, 203, 0.85)", lineHeight: "1.7" }}
            >
              We believe luxury is not merely about opulence, but about creating
              meaningful connections and transformative experiences
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
