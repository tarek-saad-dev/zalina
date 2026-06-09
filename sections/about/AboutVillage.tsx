"use client";

import React from "react";
import Image from "next/image";

export function AboutVillage() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-12 relative">
      {/* Subtle Arabian Geometric Pattern Background */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='none' stroke='%23D9B073' stroke-width='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT: Images */}
          <div className="relative h-[500px] lg:h-[580px]">
            {/* Main Large Image */}
            <div
              className="absolute left-0 top-0 w-[85%] h-[85%] rounded-2xl overflow-hidden shadow-2xl"
              style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}
            >
              <Image
                src="/assets/Flavors.png"
                alt="Luxury Arabian dining experience"
                fill
                className="object-cover"
              />
            </div>

            {/* Floating Image 1 - Top Right */}
            <div
              className="absolute right-0 top-8 w-[45%] h-[40%] rounded-xl overflow-hidden shadow-xl z-10"
              style={{ boxShadow: "0 15px 40px rgba(0,0,0,0.35)" }}
            >
              <Image
                src="/assets/Cultural Performances.png"
                alt="Arabian hospitality detail"
                fill
                className="object-cover"
              />
            </div>

            {/* Floating Image 2 - Bottom Right */}
            <div
              className="absolute right-4 bottom-0 w-[40%] h-[35%] rounded-xl overflow-hidden shadow-xl z-10"
              style={{ boxShadow: "0 15px 40px rgba(0,0,0,0.35)" }}
            >
              <Image
                src="/assets/Starlit.png"
                alt="Traditional Arabian lantern"
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* RIGHT: Content */}
          <div className="lg:pl-8">
            {/* Section Label */}
            <span className="section-label block mb-4">About The Village</span>

            {/* Heading */}
            <h2
              className="section-heading-about mb-6"
              style={{ color: "#F8F6F2" }}
            >
              The Essence of Zalina:
              <br />
              A Village for the Soul
            </h2>

            {/* Description */}
            <p className="body-text-about mb-6">
              Nestled in the heart of the Arabian landscape, Zalina is more than
              a destination—it is a sanctuary where time slows and senses awaken.
              Our village embraces the timeless traditions of Arabian hospitality
              while offering contemporary luxury that speaks to the modern
              traveler.
            </p>

            <p className="body-text-about">
              Every corner tells a story, every experience is crafted with
              intention. From the warmth of our welcome to the elegance of our
              spaces, Zalina invites you to discover a deeper connection to
              heritage, culture, and the natural beauty that surrounds us.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
