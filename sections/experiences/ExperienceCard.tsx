"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { ExperienceItem } from "./types";

interface ExperienceCardProps {
  experience: ExperienceItem;
  index: number;
}

export function ExperienceCard({ experience, index: _index }: ExperienceCardProps) {
  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-sm exp-card"
    >
      <div
        className="pointer-events-none absolute -inset-px -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(212,175,55,0.1) 0%, transparent 70%)",
          filter: "blur(14px)",
        }}
        aria-hidden="true"
      />

      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={experience.image}
          alt={`${experience.title} — ${experience.description}`}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover transition-transform duration-[750ms] ease-out group-hover:scale-[1.04]"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, transparent 40%, rgba(5,5,5,0.8) 100%)",
          }}
          aria-hidden="true"
        />
        <span
          className="absolute left-4 top-4 text-[10px] font-medium uppercase tracking-[0.18em]"
          style={{ color: "var(--exp-gold-soft)" }}
        >
          {experience.label}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 md:p-6">
        <h3
          className="mb-2 min-h-[2.5rem] text-xl leading-snug md:min-h-[3rem] md:text-[1.375rem]"
          style={{
            fontFamily: "var(--font-display)",
            color: "var(--exp-text-primary)",
            fontWeight: 400,
          }}
        >
          {experience.title}
        </h3>

        <p className="exp-body mb-4 min-h-[2.75rem] line-clamp-2 text-sm">
          {experience.description}
        </p>

        <div className="mb-5 flex flex-wrap gap-2">
          {experience.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-sm px-2 py-1 text-[10px] uppercase tracking-[0.1em]"
              style={{
                color: "var(--exp-text-muted)",
                border: "1px solid var(--exp-border-soft)",
                background: "rgba(212,175,55,0.05)",
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        <Link
          href={experience.href}
          className="mt-auto inline-flex items-center gap-2 self-start text-xs font-medium uppercase tracking-[0.12em] transition-colors hover:text-[var(--exp-gold-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--exp-gold)]"
          style={{ color: "var(--exp-gold)" }}
          aria-label={`View details for ${experience.title}`}
        >
          View Details
          <ArrowRight
            size={14}
            strokeWidth={1.5}
            className="transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
      </div>
    </article>
  );
}
