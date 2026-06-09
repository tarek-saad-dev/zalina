"use client";

import React from "react";
import Image from "next/image";

export function ImmersiveStorytelling() {
  return (
    <section className="py-24 px-4 sm:px-6 lg:px-12">
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* LEFT: Content with Large Image */}
          <div>
            {/* Large Image */}
            <div
              className="relative w-full h-[300px] rounded-2xl overflow-hidden mb-8"
              style={{ boxShadow: "0 15px 40px rgba(0,0,0,0.3)" }}
            >
              <Image
                src="/assets/zalina-hero-bg.png"
                alt="Immersive Arabian storytelling experience"
                fill
                className="object-cover"
              />
            </div>

            {/* Heading */}
            <h2
              className="text-3xl lg:text-4xl font-semibold mb-4"
              style={{ color: "#F8F6F2", fontFamily: "var(--font-display)" }}
            >
              A World of Immersive Stories
            </h2>

            {/* Description */}
            <p className="body-text-about">
              Every experience at Zalina is a chapter in a larger narrative—one
              that weaves together the threads of Arabian heritage, contemporary
              luxury, and personal discovery. From the moment you arrive, you become
              part of a story that has been unfolding for generations.
            </p>
          </div>

          {/* RIGHT: Three Overlapping Images */}
          <div className="relative h-[450px] lg:h-[500px]">
            {/* Large Image - Back */}
            <div
              className="absolute right-0 top-0 w-[80%] h-[65%] rounded-2xl overflow-hidden z-0"
              style={{ boxShadow: "0 15px 40px rgba(0,0,0,0.3)" }}
            >
              <Image
                src="/assets/Twilight Gatherings.png"
                alt="Arabian cultural experience"
                fill
                className="object-cover"
              />
            </div>

            {/* Medium Image - Middle */}
            <div
              className="absolute left-0 top-[20%] w-[55%] h-[50%] rounded-xl overflow-hidden z-10"
              style={{ boxShadow: "0 15px 40px rgba(0,0,0,0.3)" }}
            >
              <Image
                src="/assets/Cultural Performances.png"
                alt="Traditional Arabian hospitality"
                fill
                className="object-cover"
              />
            </div>

            {/* Small Image - Front */}
            <div
              className="absolute right-[10%] bottom-0 w-[50%] h-[45%] rounded-xl overflow-hidden z-20"
              style={{ boxShadow: "0 15px 40px rgba(0,0,0,0.3)" }}
            >
              <Image
                src="/assets/Flavors.png"
                alt="Luxury desert retreat detail"
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
