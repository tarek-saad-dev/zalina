"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface ExperienceCardProps {
  image: string;
  category: string;
  title: string;
  description: string;
  tags?: string[];
}

export function ExperienceCard({
  image,
  category,
  title,
  description,
  tags = [],
}: ExperienceCardProps) {
  return (
    <div
      className="flex-shrink-0 flex flex-col overflow-hidden hover-lift-luxury"
      style={{
        width: "140px",
        height: "220px",
        background: "var(--exp-bg-card)",
        border: "1px solid var(--exp-border)",
        borderRadius: "12px",
        padding: "12px",
      }}
    >
      {/* Image */}
      <div
        className="relative w-full overflow-hidden mb-2"
        style={{ height: "90px", borderRadius: "8px" }}
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      {/* Category */}
      <span
        className="text-[10px] mb-1"
        style={{ color: "var(--exp-gold)", letterSpacing: "0.05em" }}
      >
        {category}
      </span>

      {/* Title */}
      <h3 className="exp-card-title mb-1">{title}</h3>

      {/* Description */}
      <p
        className="text-[10px] mb-2 line-clamp-2"
        style={{
          color: "var(--exp-text-secondary)",
          lineHeight: "14px",
        }}
      >
        {description}
      </p>

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-auto">
          {tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="text-[9px] px-1.5 py-0.5"
              style={{
                background: "rgba(214, 185, 141, 0.1)",
                color: "var(--exp-text-secondary)",
                borderRadius: "4px",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Button */}
      <Link
        href="#"
        className="flex items-center justify-center w-full text-[10px] font-medium mt-2 transition-all duration-200 hover:bg-[var(--exp-gold)]/20"
        style={{
          height: "28px",
          background: "transparent",
          color: "var(--exp-gold)",
          borderRadius: "999px",
          border: "1px solid var(--exp-border)",
        }}
      >
        View Details
      </Link>
    </div>
  );
}
