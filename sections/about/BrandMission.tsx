"use client";

import React from "react";

export function BrandMission() {
  return (
    <section className="py-16 px-4 sm:px-6 lg:px-12">
      <div className="max-w-[800px] mx-auto text-center">
        {/* Section Label */}
        <span className="section-label block mb-4">What Drives Us</span>

        {/* Heading */}
        <h2
          className="section-heading-about mb-8"
          style={{ color: "#F8F6F2" }}
        >
          Our Mission
        </h2>

        {/* Description */}
        <p
          className="body-text-about max-w-2xl mx-auto"
          style={{ fontSize: "16px" }}
        >
          To preserve and celebrate the rich tapestry of Arabian culture while
          providing an unparalleled luxury hospitality experience. We are committed
          to creating spaces where heritage and modernity coexist harmoniously,
          where every guest discovers the profound beauty of authentic Arabian
          hospitality, and where moments become cherished memories that last a
          lifetime.
        </p>

        {/* Decorative Line */}
        <div className="flex items-center justify-center gap-4 mt-10">
          <div
            className="w-16 h-[1px]"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(217, 176, 115, 0.5))",
            }}
          />
          <div
            className="w-2 h-2 rotate-45"
            style={{ border: "1px solid #D9B073" }}
          />
          <div
            className="w-16 h-[1px]"
            style={{
              background:
                "linear-gradient(90deg, rgba(217, 176, 115, 0.5), transparent)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
