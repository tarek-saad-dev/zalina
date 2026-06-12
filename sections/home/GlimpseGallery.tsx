"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const galleryImages = [
  {
    src: "/assets/Twilight Gatherings.png",
    alt: "Grand Entrance",
    size: "tall",
  },
  {
    src: "/assets/Starlit.png",
    alt: "Illuminated Pathways",
    size: "wide",
  },
  {
    src: "/assets/Cultural Performances.png",
    alt: "Luxury Suite",
    size: "hero",
  },
  {
    src: "/assets/Flavors.png",
    alt: "Courtyard Lagoon",
    size: "wide",
  },
  {
    src: "/assets/Moments to Remember.png",
    alt: "Architectural Details",
    size: "tall",
  },
  {
    src: "/assets/day.png",
    alt: "Lantern-lit Spaces",
    size: "square",
  },
  {
    src: "/assets/night.png",
    alt: "Atmospheric Night",
    size: "wide",
  },
];

export function GlimpseGallery() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  // Auto-scroll animation
  useEffect(() => {
    if (isPaused || isDragging) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let lastTime = performance.now();
    const speed = 0.5; // pixels per frame

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (scrollContainer && !isPaused && !isDragging) {
        scrollContainer.scrollLeft += speed * (deltaTime / 16);

        // Loop when reaching end
        if (scrollContainer.scrollLeft >= scrollContainer.scrollWidth - scrollContainer.clientWidth) {
          scrollContainer.scrollLeft = 0;
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused, isDragging]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - (scrollRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  }, [isDragging, startX, scrollLeft]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setStartX(e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!scrollRef.current) return;
    const x = e.touches[0].pageX - (scrollRef.current.offsetLeft || 0);
    const walk = (x - startX) * 1.5;
    scrollRef.current.scrollLeft = scrollLeft - walk;
  }, [startX, scrollLeft]);

  const getCardDimensions = (size: string) => {
    switch (size) {
      case "hero":
        return { width: "420px", height: "520px" };
      case "tall":
        return { width: "280px", height: "420px" };
      case "wide":
        return { width: "380px", height: "280px" };
      case "square":
        return { width: "320px", height: "320px" };
      default:
        return { width: "300px", height: "380px" };
    }
  };

  const getBorderRadius = (size: string) => {
    return size === "tall" ? "180px 180px 8px 8px" : "8px";
  };

  return (
    <section
      className="relative overflow-hidden py-16"
      style={{ background: "var(--lux-surface)" }}
    >
      {/* Section Header */}
      <div className="lux-container mb-10">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lux-eyebrow mb-3"
            style={{ color: "var(--lux-gold)" }}
          >
            VISUAL JOURNEY
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lux-heading-lg mb-4"
            style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}
          >
            A Glimpse Into Zalina
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lux-body max-w-2xl mx-auto"
            style={{ fontSize: "0.95rem", opacity: 0.8 }}
          >
            Discover the atmosphere, architecture, and unforgettable moments that define the Zalina experience.
          </motion.p>
        </div>
      </div>

      {/* Gallery Container with Fade Edges */}
      <div className="relative">
        {/* Left Fade Gradient */}
        <div
          className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{
            width: "120px",
            background: "linear-gradient(to right, var(--lux-surface) 0%, transparent 100%)",
          }}
        />

        {/* Right Fade Gradient */}
        <div
          className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{
            width: "120px",
            background: "linear-gradient(to left, var(--lux-surface) 0%, transparent 100%)",
          }}
        />

        {/* Scrolling Gallery */}
        <div
          ref={scrollRef}
          className="flex overflow-x-hidden cursor-grab active:cursor-grabbing"
          style={{
            gap: "20px",
            paddingLeft: "max(24px, calc((100vw - 1440px) / 2 + 80px))",
            paddingRight: "24px",
          }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            setIsPaused(false);
            setIsDragging(false);
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {/* Double the images for seamless loop */}
          {[...galleryImages, ...galleryImages].map((image, index) => {
            const dims = getCardDimensions(image.size);
            const borderRadius = getBorderRadius(image.size);

            return (
              <motion.div
                key={`${image.alt}-${index}`}
                className="relative flex-shrink-0 group"
                style={{
                  width: dims.width,
                  height: dims.height,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (index % galleryImages.length) * 0.1 }}
              >
                {/* Image Container with Border */}
                <div
                  className="relative w-full h-full overflow-hidden"
                  style={{
                    borderRadius: borderRadius,
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    boxShadow: image.size === "hero" ? "0 8px 40px rgba(0,0,0,0.4)" : "0 4px 20px rgba(0,0,0,0.2)",
                  }}
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes={dims.width}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    draggable={false}
                  />

                  {/* Subtle Overlay */}
                  <div
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{
                      background: `
                        linear-gradient(
                          to top,
                          rgba(0,0,0,0.5) 0%,
                          transparent 50%,
                          transparent 100%
                        )
                      `,
                      opacity: 0.6,
                    }}
                  />

                  {/* Gold Glow on Hover */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      boxShadow: "inset 0 0 0 2px rgba(212,175,55,0.5), 0 0 30px rgba(212,175,55,0.2)",
                      borderRadius: borderRadius,
                    }}
                  />

                  {/* Caption */}
                  <div
                    className="absolute bottom-0 left-0 right-0 p-4"
                    style={{
                      background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 100%)",
                    }}
                  >
                    <p
                      className="text-white text-sm font-medium tracking-wide"
                      style={{ fontFamily: "var(--font-display, serif)" }}
                    >
                      {image.alt}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default GlimpseGallery;
