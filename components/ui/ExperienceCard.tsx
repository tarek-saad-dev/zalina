"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface ExperienceCardProps {
  title: string;
  description: string;
  image: string;
  duration?: string;
  price?: string;
  className?: string;
}

export function ExperienceCard({
  title,
  description,
  image,
  duration,
  price,
  className,
}: ExperienceCardProps) {
  return (
    <article
      className={cn(
        "group relative bg-bg-surface border border-border-subtle rounded-card overflow-hidden",
        "transition-all duration-500 hover:border-border-gold-soft hover:shadow-premium",
        className
      )}
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-bg-surface/20 to-transparent" />
        
        {/* Duration Badge */}
        {duration && (
          <div className="absolute top-4 left-4 px-3 py-1.5 bg-bg-main/80 backdrop-blur-sm rounded-full">
            <span className="text-xs text-text-secondary tracking-wide">{duration}</span>
          </div>
        )}
        
        {/* Price Badge */}
        {price && (
          <div className="absolute top-4 right-4 px-3 py-1.5 bg-accent-gold/90 rounded-full">
            <span className="text-xs font-medium text-bg-main">{price}</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="font-display text-xl md:text-2xl text-text-primary mb-3 group-hover:text-accent-gold transition-colors duration-300">
          {title}
        </h3>
        <p className="text-text-muted text-sm leading-relaxed mb-4 line-clamp-2">
          {description}
        </p>
        
        {/* CTA */}
        <a
          href="#"
          className="inline-flex items-center gap-2 text-sm text-accent-gold font-medium group/link"
        >
          <span>Discover More</span>
          <ArrowUpRight className="w-4 h-4 transition-transform duration-300 group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
        </a>
      </div>
    </article>
  );
}
