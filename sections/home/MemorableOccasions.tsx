"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Users, Building2, PartyPopper } from "lucide-react";
import { NEUTRAL_MEDIA_FALLBACK } from "@/lib/media";

const occasions = [
  {
    icon: Users,
    image: NEUTRAL_MEDIA_FALLBACK,
    title: "Private Gatherings",
    subtitle: "Intimate Celebrations",
    description:
      "From milestone birthdays to anniversary dinners, create cherished memories in exclusive settings designed for your most personal moments.",
    features: ["Bespoke Menus", "Private Venues", "Personal Concierge"],
  },
  {
    icon: Building2,
    image: NEUTRAL_MEDIA_FALLBACK,
    title: "Corporate Experiences",
    subtitle: "Business Excellence",
    description:
      "Elevate your corporate events with world-class facilities and impeccable service. Where business meets Arabian hospitality.",
    features: ["Conference Halls", "Team Building", "Executive Dining"],
  },
  {
    icon: PartyPopper,
    image: NEUTRAL_MEDIA_FALLBACK,
    title: "Social Celebrations",
    subtitle: "Grand Festivities",
    description:
      "Host unforgettable galas, launches, and celebrations in venues that blend traditional grandeur with contemporary sophistication.",
    features: ["Grand Ballrooms", "Live Entertainment", "Gourmet Catering"],
  },
];

export function MemorableOccasions() {
  return (
    <section
      className="lux-section relative overflow-hidden"
      style={{ background: "var(--lux-surface)" }}
    >
      {/* Pattern Background */}
      <div className="absolute inset-0 lux-pattern opacity-30" />

      <div className="lux-container relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lux-eyebrow mb-6"
          >
            Exceptional Events
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lux-heading-lg mb-6"
          >
            Crafted For Memorable Occasions
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className="lux-divider mx-auto"
          />
        </div>

        {/* Premium Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {occasions.map((occasion, index) => {
            const Icon = occasion.icon;
            return (
              <motion.div
                key={occasion.title}
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="group"
              >
                <div
                  className="relative h-full flex flex-col overflow-hidden lux-card"
                  style={{ minHeight: "600px" }}
                >
                  {/* Image Section */}
                  <div className="relative h-[280px] overflow-hidden">
                    <Image
                      src={occasion.image}
                      alt={occasion.title}
                      fill
                      className="object-cover transition-transform duration-[1000ms] group-hover:scale-110"
                    />
                    {/* Overlay */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent 50%, var(--lux-surface) 100%)",
                      }}
                    />
                    {/* Icon Badge */}
                    <div
                      className="absolute top-6 left-6 w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
                      style={{
                        background: "rgba(5, 5, 5, 0.8)",
                        border: "1px solid var(--lux-gold)",
                        backdropFilter: "blur(10px)",
                      }}
                    >
                      <Icon size={24} style={{ color: "var(--lux-gold)" }} />
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="flex-1 flex flex-col p-8">
                    {/* Subtitle */}
                    <p className="lux-eyebrow mb-3">{occasion.subtitle}</p>

                    {/* Title */}
                    <h3 className="lux-heading-md mb-4">{occasion.title}</h3>

                    {/* Description */}
                    <p className="lux-body mb-6 flex-1">{occasion.description}</p>

                    {/* Features */}
                    <div className="mb-8">
                      <div className="flex flex-wrap gap-3">
                        {occasion.features.map((feature) => (
                          <span
                            key={feature}
                            className="px-4 py-2 text-xs"
                            style={{
                              background: "rgba(201, 163, 92, 0.1)",
                              border: "1px solid var(--lux-border)",
                              color: "var(--lux-muted)",
                            }}
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <Link
                      href={`/occasions/${occasion.title.toLowerCase().replace(" ", "-")}`}
                      className="inline-flex items-center gap-2 text-sm font-medium transition-all duration-300 group/link"
                      style={{ color: "var(--lux-gold)" }}
                    >
                      <span>Discover More</span>
                      <span className="transition-transform duration-300 group-hover/link:translate-x-2">
                        →
                      </span>
                    </Link>
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
