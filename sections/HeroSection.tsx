"use client";

import { Container } from "@/components/ui/Container";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { SecondaryButton } from "@/components/ui/SecondaryButton";
import { OrnamentalDivider } from "@/components/ui/OrnamentalDivider";

export function HeroSection() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Background with Arch Motif */}
      <div className="absolute inset-0 bg-bg-main">
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-bg-main via-transparent to-bg-main" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-main/80 via-transparent to-bg-main/80" />
        
        {/* Arch Frame Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] opacity-20">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent-gold to-transparent" />
          <div className="absolute inset-x-[20%] top-0 bottom-0 border-x border-accent-gold/30 rounded-t-[200px]" />
        </div>
        
        {/* Subtle pattern overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0L60 30L30 60L0 30L30 0z' fill='%23C7A36A' fill-opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* Content */}
      <Container className="relative z-10 pt-32 pb-20">
        <div className="max-w-5xl mx-auto text-center">
          {/* Pre-title */}
          <div className="mb-8 animate-fade-in">
            <span className="text-xs md:text-sm tracking-[0.3em] uppercase text-accent-gold font-medium">
              Arabian Luxury Heritage
            </span>
          </div>

          {/* Decorative Line */}
          <div className="flex justify-center mb-8">
            <OrnamentalDivider size="large" variant="gold" />
          </div>

          {/* Main Title */}
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light text-text-primary leading-[1.1] tracking-tight mb-8 animate-fade-in-up">
            Zalina
            <br />
            <span className="text-gradient-gold">Arabian Village</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            An immersive destination where authentic Arabian heritage meets 
            uncompromising luxury. Experience the magic of the desert under 
            a blanket of stars.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <PrimaryButton href="#booking" size="large">
              Book Your Experience
            </PrimaryButton>
            <SecondaryButton href="#experiences" size="large" showArrow>
              Explore Experiences
            </SecondaryButton>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "0.8s" }}>
            <span className="text-xs tracking-widest uppercase text-text-muted">Scroll</span>
            <div className="w-px h-12 bg-gradient-to-b from-accent-gold/50 to-transparent" />
          </div>
        </div>
      </Container>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-bg-main to-transparent" />
    </section>
  );
}
