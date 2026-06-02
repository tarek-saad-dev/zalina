"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface ZoneCardProps {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  className?: string;
  size?: "default" | "large";
}

export function ZoneCard({
  title,
  subtitle,
  description,
  image,
  className,
  size = "default",
}: ZoneCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-card",
        "transition-all duration-500 hover:shadow-premium",
        className
      )}
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-bg-main/40 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-end p-6 md:p-8 min-h-[360px]">
        <span className="text-xs tracking-[0.2em] uppercase text-accent-gold mb-2">
          {subtitle}
        </span>
        <h3 className={cn(
          "font-display text-text-primary mb-3",
          size === "large" ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"
        )}>
          {title}
        </h3>
        <p className="text-text-secondary text-sm md:text-base leading-relaxed mb-6 max-w-md">
          {description}
        </p>
        
        <a
          href="#"
          className="inline-flex items-center gap-2 text-accent-gold font-medium group/link"
        >
          <span>Explore Zone</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-1" />
        </a>
      </div>
    </article>
  );
}
