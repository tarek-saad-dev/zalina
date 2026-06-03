"use client";

import React from "react";
import Image from "next/image";
import { Star } from "lucide-react";

const brandEssencePoints = [
  "Unmatched Luxury Hospitality",
  "Deeply Rooted Arabian Identity",
  "Curated Experiential Journeys",
  "Premium Events & Gatherings",
  "Emotional Storytelling at Every Turn",
  "Elegant & Seamless Booking Journey",
];

export function SignatureBrandEssence() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT: Luxury Image Composition */}
          <div className="relative h-[450px] lg:h-[500px]">
            {/* Main Image */}
            <div
              className="absolute left-0 top-[10%] w-[75%] h-[80%] rounded-2xl overflow-hidden"
              style={{ boxShadow: "0 20px 50px rgba(0,0,0,0.35)" }}
            >
              <Image
                src="/images/essence-main.jpg"
                alt="Zalina luxury experience"
                fill
                className="object-cover"
              />
            </div>

            {/* Secondary Image */}
            <div
              className="absolute right-0 top-0 w-[45%] h-[45%] rounded-xl overflow-hidden z-10"
              style={{ boxShadow: "0 15px 40px rgba(0,0,0,0.3)" }}
            >
              <Image
                src="/images/essence-secondary.jpg"
                alt="Arabian architectural detail"
                fill
                className="object-cover"
              />
            </div>

            {/* Glowing Icon - Center */}
            <div
              className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 rounded-full flex items-center justify-center z-20"
              style={{
                background: "linear-gradient(135deg, #D9B073 0%, #8A5A2F 100%)",
                boxShadow: "0 0 50px rgba(217, 176, 115, 0.6), 0 0 100px rgba(217, 176, 115, 0.3)",
              }}
            >
              <Star className="w-8 h-8 text-white" fill="white" strokeWidth={1} />
            </div>
          </div>

          {/* RIGHT: Bullet List */}
          <div className="lg:pl-8">
            {/* Section Label */}
            <span className="section-label block mb-4">Why Choose Zalina</span>

            {/* Heading */}
            <h2
              className="section-heading-about mb-8"
              style={{ color: "#F8F6F2" }}
            >
              The Zalina Difference
            </h2>

            {/* Bullet List with Gold Circular Bullets */}
            <ul className="space-y-5">
              {brandEssencePoints.map((point, index) => (
                <li key={index} className="flex items-start gap-4">
                  {/* Custom Gold Circular Bullet */}
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0 mt-1.5"
                    style={{
                      background: "linear-gradient(135deg, #D9B073 0%, #8A5A2F 100%)",
                      boxShadow: "0 0 10px rgba(217, 176, 115, 0.5)",
                    }}
                  />
                  <span
                    className="text-base"
                    style={{
                      color: "#D6D2CB",
                      fontFamily: "var(--font-body)",
                      lineHeight: "1.6",
                    }}
                  >
                    {point}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
