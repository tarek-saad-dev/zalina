"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CmsImage } from "@/components/media/CmsImage";
import {
  NEUTRAL_MEDIA_FALLBACK,
  type MarketCard,
} from "@/lib/media";

interface MarketShowcaseProps {
  stalls?: MarketCard[];
}

export function MarketShowcase({ stalls = [] }: MarketShowcaseProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const marketStalls: MarketCard[] =
    stalls.length > 0
      ? stalls
      : [
          {
            id: "neutral",
            title: "Zalina Arabian Village",
            subtitle: "Market stalls from the CMS catalog",
            image: NEUTRAL_MEDIA_FALLBACK,
            alt: "Zalina Arabian Village",
            size: "hero",
          },
        ];

  useEffect(() => {
    if (isPaused || isDragging) return;

    const scrollContainer = scrollRef.current;
    if (!scrollContainer) return;

    let animationId: number;
    let lastTime = performance.now();
    const speed = 0.5;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      if (scrollContainer && !isPaused && !isDragging) {
        scrollContainer.scrollLeft += speed * (deltaTime / 16);

        if (
          scrollContainer.scrollLeft >=
          scrollContainer.scrollWidth - scrollContainer.clientWidth
        ) {
          scrollContainer.scrollLeft = 0;
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationId);
  }, [isPaused, isDragging]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  }, []);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !scrollRef.current) return;
      e.preventDefault();
      const x = e.pageX - (scrollRef.current.offsetLeft || 0);
      const walk = (x - startX) * 1.5;
      scrollRef.current.scrollLeft = scrollLeft - walk;
    },
    [isDragging, startX, scrollLeft]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setStartX(e.touches[0].pageX - (scrollRef.current?.offsetLeft || 0));
    setScrollLeft(scrollRef.current?.scrollLeft || 0);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!scrollRef.current) return;
      const x = e.touches[0].pageX - (scrollRef.current.offsetLeft || 0);
      const walk = (x - startX) * 1.5;
      scrollRef.current.scrollLeft = scrollLeft - walk;
    },
    [startX, scrollLeft]
  );

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
      aria-labelledby="market-showcase-title"
    >
      {/* Soft bazaar atmosphere */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 20% 30%, rgba(201, 163, 92, 0.07) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 85% 70%, rgba(139, 90, 47, 0.06) 0%, transparent 50%)
          `,
        }}
      />

      <div className="lux-container relative z-10 mb-10">
        <div className="text-center">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lux-eyebrow mb-3"
            style={{ color: "var(--lux-gold)" }}
          >
            THE MARKET
          </motion.p>

          <motion.h2
            id="market-showcase-title"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lux-heading-lg mb-4"
            style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}
          >
            Wander the Zalina Souk
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lux-body max-w-2xl mx-auto"
            style={{ fontSize: "0.95rem", opacity: 0.8 }}
          >
            Step into an Arabian marketplace of spice courtyards, artisan tents,
            and lantern-lit lanes — where every stall tells a story of heritage
            and hospitality.
          </motion.p>

          {/* Market rhythm ornament */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mt-6 flex items-center justify-center gap-3"
            aria-hidden="true"
          >
            <span
              className="h-px w-10"
              style={{ background: "rgba(201, 163, 92, 0.35)" }}
            />
            <span
              className="text-[10px] tracking-[0.35em] uppercase"
              style={{ color: "var(--lux-gold)", opacity: 0.7 }}
            >
              Spice · Craft · Flavor
            </span>
            <span
              className="h-px w-10"
              style={{ background: "rgba(201, 163, 92, 0.35)" }}
            />
          </motion.div>
        </div>
      </div>

      <div className="relative">
        <div
          className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{
            width: "120px",
            background:
              "linear-gradient(to right, var(--lux-surface) 0%, transparent 100%)",
          }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 z-10 pointer-events-none"
          style={{
            width: "120px",
            background:
              "linear-gradient(to left, var(--lux-surface) 0%, transparent 100%)",
          }}
        />

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
          {[...marketStalls, ...marketStalls].map((stall, index) => {
            const dims = getCardDimensions(stall.size);
            const borderRadius = getBorderRadius(stall.size);

            return (
              <motion.div
                key={`${stall.id}-${index}`}
                className="relative flex-shrink-0 group"
                style={{
                  width: dims.width,
                  height: dims.height,
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: (index % marketStalls.length) * 0.1,
                }}
              >
                <div
                  className="relative w-full h-full overflow-hidden"
                  style={{
                    borderRadius,
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    boxShadow:
                      stall.size === "hero"
                        ? "0 8px 40px rgba(0,0,0,0.4)"
                        : "0 4px 20px rgba(0,0,0,0.2)",
                  }}
                >
                  <CmsImage
                    src={stall.image}
                    alt={stall.alt}
                    fill
                    sizes={dims.width}
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    draggable={false}
                  />

                  <div
                    className="absolute inset-0 transition-opacity duration-500"
                    style={{
                      background: `
                        linear-gradient(
                          to top,
                          rgba(0,0,0,0.65) 0%,
                          transparent 48%,
                          rgba(20,12,4,0.15) 100%
                        )
                      `,
                      opacity: 0.75,
                    }}
                  />

                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      boxShadow:
                        "inset 0 0 0 2px rgba(212,175,55,0.5), 0 0 30px rgba(212,175,55,0.2)",
                      borderRadius,
                    }}
                  />

                  {/* Stall number — market ticket feel */}
                  <div
                    className="absolute top-3 left-3 px-2.5 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
                    style={{
                      border: "1px solid rgba(212, 175, 55, 0.45)",
                      background: "rgba(5,5,5,0.55)",
                      backdropFilter: "blur(6px)",
                    }}
                  >
                    <span
                      className="text-[10px] tracking-[0.2em] uppercase"
                      style={{ color: "var(--lux-gold)" }}
                    >
                      Stall {(index % marketStalls.length) + 1}
                    </span>
                  </div>

                  <div
                    className="absolute bottom-0 left-0 right-0 p-4"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 100%)",
                    }}
                  >
                    <p
                      className="text-white text-sm font-medium tracking-wide"
                      style={{ fontFamily: "var(--font-display, serif)" }}
                    >
                      {stall.title}
                    </p>
                    <p
                      className="text-white/70 text-xs mt-1 max-h-0 overflow-hidden opacity-0 group-hover:max-h-10 group-hover:opacity-100 transition-all duration-500"
                      style={{ fontFamily: "var(--font-body, sans-serif)" }}
                    >
                      {stall.subtitle}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="lux-container relative z-10 mt-10 flex justify-center"
      >
        <Link
          href="/zones"
          className="lux-btn-secondary inline-flex items-center gap-2 text-sm tracking-wide"
        >
          Explore the Market Zone
        </Link>
      </motion.div>
    </section>
  );
}

export default MarketShowcase;
