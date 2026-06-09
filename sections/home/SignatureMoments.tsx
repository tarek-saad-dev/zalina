"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

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

export function SignatureMoments() {
  return (
    <section
      className="lux-section relative overflow-hidden"
      style={{ background: "var(--lux-surface)" }}
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
            Curated Experiences
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lux-heading-lg"
          >
            Signature Moments
          </motion.h2>
        </div>

        {/* Premium Image Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moments.map((moment, index) => (
            <motion.div
              key={moment.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.15 }}
              className={`group relative overflow-hidden cursor-pointer ${
                index === 0 ? "md:col-span-2 lg:col-span-2" : ""
              } ${index === 4 ? "md:col-span-2 lg:col-span-1" : ""}`}
              style={{
                height: index === 0 ? "500px" : "400px",
              }}
            >
              {/* Image */}
              <div className="absolute inset-0 lux-img-frame" style={{ width: '100%', height: '100%' }}>
                <Image
                  src={moment.image}
                  alt={moment.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
                  onError={(e) => console.error('Image failed:', moment.image, e)}
                />
              </div>

              {/* Cinematic Overlay */}
              <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{
                  background: `
                    linear-gradient(
                      180deg,
                      transparent 0%,
                      transparent 40%,
                      rgba(5, 5, 5, 0.95) 100%
                    )
                  `,
                }}
              />

              {/* Gold Border Glow on Hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  boxShadow: "inset 0 0 0 1px var(--lux-gold)",
                }}
              />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <motion.div
                  className="transform transition-transform duration-500 group-hover:-translate-y-2"
                >
                  <h3 className="lux-heading-md mb-3">{moment.title}</h3>
                  <p className="lux-body opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {moment.description}
                  </p>
                </motion.div>

                {/* Gold Accent Line */}
                <div
                  className="mt-4 h-[2px] w-0 group-hover:w-16 transition-all duration-700"
                  style={{
                    background: "linear-gradient(90deg, var(--lux-gold), transparent)",
                  }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
