"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { NEUTRAL_MEDIA_FALLBACK } from "@/lib/media";

type GallerySize = "tall" | "wide" | "arch" | "normal";

export interface ImmersiveGalleryItem {
  id: string;
  title: string;
  image: string;
  alt: string;
}

const DEFAULT_SIZES: GallerySize[] = [
  "tall",
  "wide",
  "arch",
  "normal",
  "tall",
  "normal",
  "wide",
  "arch",
];

const FALLBACK_ITEMS: ImmersiveGalleryItem[] = [
  { id: "arabian-architecture", title: "Arabian Architecture", image: NEUTRAL_MEDIA_FALLBACK, alt: "Arabian Architecture" },
  { id: "desert-sunset", title: "Desert Sunset", image: NEUTRAL_MEDIA_FALLBACK, alt: "Desert Sunset" },
  { id: "traditional-courtyard", title: "Traditional Courtyard", image: NEUTRAL_MEDIA_FALLBACK, alt: "Traditional Courtyard" },
  { id: "luxury-interior", title: "Luxury Interior", image: NEUTRAL_MEDIA_FALLBACK, alt: "Luxury Interior" },
  { id: "night-ambiance", title: "Night Ambiance", image: NEUTRAL_MEDIA_FALLBACK, alt: "Night Ambiance" },
  { id: "culinary-art", title: "Culinary Art", image: NEUTRAL_MEDIA_FALLBACK, alt: "Culinary Art" },
  { id: "cultural-performance", title: "Cultural Performance", image: NEUTRAL_MEDIA_FALLBACK, alt: "Cultural Performance" },
  { id: "palm-gardens", title: "Palm Gardens", image: NEUTRAL_MEDIA_FALLBACK, alt: "Palm Gardens" },
];

interface ImmersiveGalleryProps {
  items?: ImmersiveGalleryItem[];
}

export function ImmersiveGallery({ items = [] }: ImmersiveGalleryProps) {
  const galleryImages =
    items.length > 0
      ? items
      : FALLBACK_ITEMS;

  return (
    <section
      className="lux-section relative overflow-hidden"
      style={{ background: "transparent" }}
    >
      <div className="lux-container">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lux-eyebrow mb-6"
          >
            Visual Journey
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lux-heading-lg"
          >
            Immersive Gallery
          </motion.h2>
        </div>

        {/* Masonry Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[200px]">
          {galleryImages.map((image, index) => {
            const size = DEFAULT_SIZES[index % DEFAULT_SIZES.length];
            const getSpan = () => {
              switch (size) {
                case "tall":
                  return "row-span-2";
                case "wide":
                  return "col-span-2";
                case "arch":
                  return "row-span-2";
                default:
                  return "";
              }
            };

            return (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className={`relative group cursor-pointer overflow-hidden ${getSpan()} ${
                  size === "arch" ? "lux-arch" : ""
                }`}
              >
                {/* Image */}
                <Image
                  src={image.image}
                  alt={image.alt || image.title}
                  fill
                  className="object-cover transition-transform duration-[1200ms] group-hover:scale-110"
                />

                {/* Hover Overlay */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{
                    background:
                      "linear-gradient(180deg, transparent 30%, rgba(5, 5, 5, 0.9) 100%)",
                  }}
                />

                {/* Gold Border on Hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    boxShadow: "inset 0 0 0 2px var(--lux-gold)",
                  }}
                />

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <p
                    className="text-sm font-medium"
                    style={{ color: "var(--lux-text)" }}
                  >
                    {image.alt || image.title}
                  </p>
                </div>

                {/* Zoom Icon */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(5, 5, 5, 0.8)",
                      border: "1px solid var(--lux-gold)",
                    }}
                  >
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="var(--lux-gold)"
                      strokeWidth="1.5"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="M21 21l-4.35-4.35" />
                      <path d="M11 8v6M8 11h6" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mt-16"
        >
          <a href="/gallery" className="lux-btn-secondary">
            View Full Gallery
          </a>
        </motion.div>
      </div>
    </section>
  );
}
