"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";

const moments = [
  {
    image: "/assets/Twilight Gatherings.png",
    title: "Twilight Gatherings",
    description: "Where golden hour meets Arabian hospitality",
  },
  {
    image: "/assets/Cultural Performances.png",
    title: "Cultural Performances",
    description: "Ancient arts brought to life under starlit skies",
  },
  {
    image: "/assets/Flavors.png",
    title: "Flavors of Arabia",
    description: "A culinary journey through centuries of tradition",
  },
  {
    image: "/assets/Starlit.png",
    title: "Starlit Celebrations",
    description: "Magical evenings beneath the desert constellation",
  },
  {
    image: "/assets/Moments to Remember.png",
    title: "Moments to Remember",
    description: "Creating legacies that transcend generations",
  },
];

// Card widths for varied visual rhythm
const cardWidths = ["340px", "380px", "320px", "360px", "300px"];

export function SignatureMoments() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      return () => el.removeEventListener("scroll", checkScroll);
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Auto-scroll with loop
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 50;

        if (isAtEnd) {
          // Loop back to start
          scrollRef.current.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          // Scroll right
          scrollRef.current.scrollBy({ left: 380, behavior: "smooth" });
        }
      }
    }, 3000); // Auto-scroll every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--lux-surface)", paddingTop: "50px", paddingBottom: "60px" }}
    >
      <div className="lux-container mb-8">
        {/* Section Header - Centered */}
        <div className="text-center relative">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lux-eyebrow mb-3"
          >
            Curated Experiences
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lux-heading-lg"
            style={{ fontSize: "clamp(32px, 4vw, 52px)" }}
          >
            Signature Moments
          </motion.h2>

          {/* Navigation Arrows - Positioned at sides */}
          <div className="hidden md:flex gap-2 absolute right-0 bottom-0">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                canScrollLeft
                  ? "bg-white/10 hover:bg-white/20 border border-white/20"
                  : "bg-white/5 border border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <ChevronLeft size={24} className="text-white" />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                canScrollRight
                  ? "bg-white/10 hover:bg-white/20 border border-white/20"
                  : "bg-white/5 border border-white/10 opacity-50 cursor-not-allowed"
              }`}
            >
              <ChevronRight size={24} className="text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Cards */}
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scrollbar-hide"
        style={{
          gap: "16px",
          paddingLeft: "max(24px, calc((100vw - 1440px) / 2 + 80px))",
          paddingRight: "24px",
          scrollSnapType: "x mandatory",
          WebkitOverflowScrolling: "touch",
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {moments.map((moment, index) => (
          <motion.div
            key={moment.title}
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="relative overflow-hidden flex-shrink-0"
            style={{
              width: cardWidths[index],
              height: "420px",
              scrollSnapAlign: "start",
            }}
          >
            {/* Image */}
            <div className="absolute inset-0" style={{ width: "100%", height: "100%" }}>
              <Image
                src={moment.image}
                alt={moment.title}
                fill
                sizes="400px"
                className="object-cover"
                priority={index < 2}
              />
            </div>

            {/* Cinematic Overlay - Static */}
            <div
              className="absolute inset-0"
              style={{
                background: `
                  linear-gradient(
                    to top,
                    rgba(0,0,0,0.85) 0%,
                    rgba(0,0,0,0.5) 40%,
                    rgba(0,0,0,0.2) 100%
                  )
                `,
              }}
            />

            {/* Content - Static */}
            <div className="absolute bottom-0 left-0 right-0 p-6">
              <h3
                className="text-white leading-tight mb-2"
                style={{
                  fontFamily: "var(--font-display, 'Playfair Display', Georgia, serif)",
                  fontSize: "1.5rem",
                  fontWeight: 400,
                  letterSpacing: "0.02em",
                  textShadow: "0 2px 20px rgba(0,0,0,0.8)",
                }}
              >
                {moment.title}
              </h3>
              <p
                className="text-white/80 leading-relaxed"
                style={{
                  fontSize: "1rem",
                  fontFamily: "var(--font-body, sans-serif)",
                }}
              >
                {moment.description}
              </p>

              {/* Gold underline - Static */}
              <div
                className="mt-4 h-[2px] w-12"
                style={{
                  background: "linear-gradient(90deg, #D4AF37, transparent)",
                }}
              />
            </div>
          </motion.div>
        ))}

        {/* End spacer for scroll padding */}
        <div style={{ width: "24px", flexShrink: 0 }} />
      </div>

      {/* Hide scrollbar CSS */}
      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
