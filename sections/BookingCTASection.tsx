"use client";

import { Container } from "@/components/ui/Container";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { OrnamentalDivider } from "@/components/ui/OrnamentalDivider";

export function BookingCTASection() {
  return (
    <section id="booking" className="relative py-24 md:py-32 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=1600&q=80")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-bg-main via-bg-main/95 to-bg-main/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-main via-transparent to-bg-main" />
      </div>

      {/* Arch Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] opacity-10">
        <div className="absolute inset-x-[15%] top-0 bottom-0 border-x border-t border-accent-gold rounded-t-[150px]" />
      </div>

      <Container className="relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Pre-title */}
          <span className="text-sm tracking-[0.2em] uppercase text-accent-gold font-medium">
            Begin Your Journey
          </span>

          {/* Divider */}
          <div className="my-6 flex justify-center">
            <OrnamentalDivider size="medium" variant="gold" />
          </div>

          {/* Title */}
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-text-primary leading-tight mb-6">
            Reserve Your
            <br />
            <span className="text-gradient-gold">Arabian Escape</span>
          </h2>

          {/* Description */}
          <p className="text-text-secondary text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            Whether you seek a peaceful retreat, an adventure-filled escape, or a 
            celebration to remember, our concierge team is ready to craft your 
            perfect Zalina experience.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <PrimaryButton href="#" size="large">
              Book Now
            </PrimaryButton>
            <a 
              href="tel:+971234567890" 
              className="text-text-secondary hover:text-accent-gold transition-colors duration-300"
            >
              <span className="text-sm tracking-wide">Or call us at</span>
              <span className="block text-lg font-medium">+971 2 345 6789</span>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 pt-8 border-t border-border-subtle">
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              <div className="text-center">
                <p className="font-display text-2xl text-accent-gold">24/7</p>
                <p className="text-xs text-text-muted tracking-wide uppercase">Concierge</p>
              </div>
              <div className="w-px h-10 bg-border-subtle hidden sm:block" />
              <div className="text-center">
                <p className="font-display text-2xl text-accent-gold">100%</p>
                <p className="text-xs text-text-muted tracking-wide uppercase">Secure Booking</p>
              </div>
              <div className="w-px h-10 bg-border-subtle hidden sm:block" />
              <div className="text-center">
                <p className="font-display text-2xl text-accent-gold">Free</p>
                <p className="text-xs text-text-muted tracking-wide uppercase">Cancellation</p>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
