"use client";

import { Container } from "@/components/ui/Container";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { OrnamentalDivider } from "@/components/ui/OrnamentalDivider";
import { Heart, Sparkles, Flower2, Wine } from "lucide-react";

const features = [
  {
    icon: Heart,
    title: "Romantic Setting",
    description: "Breathtaking desert backdrop for your special day",
  },
  {
    icon: Sparkles,
    title: "Custom Design",
    description: "Personalized themes from intimate to grand",
  },
  {
    icon: Flower2,
    title: "Floral Artistry",
    description: "Exquisite arrangements inspired by Arabian gardens",
  },
  {
    icon: Wine,
    title: "Gourmet Dining",
    description: "Bespoke menus crafted by master chefs",
  },
];

export function WeddingsSection() {
  return (
    <section id="weddings" className="relative py-24 md:py-32 overflow-hidden">
      {/* Warm Background */}
      <div className="absolute inset-0 bg-bg-section">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-bronze/5 via-transparent to-accent-gold/5" />
      </div>

      <Container size="large" className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <span className="text-sm tracking-[0.2em] uppercase text-accent-gold font-medium">
              Celebrations
            </span>

            <div className="my-6">
              <OrnamentalDivider variant="gold" className="justify-start" size="medium" />
            </div>

            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light text-text-primary leading-tight mb-6">
              Weddings &
              <br />
              <span className="text-gradient-gold">Special Events</span>
            </h2>

            <p className="text-text-secondary text-lg leading-relaxed mb-8 max-w-lg">
              Create unforgettable memories in a setting of unparalleled beauty.
              From intimate ceremonies to grand celebrations, our dedicated team
              crafts bespoke experiences that reflect your unique love story.
            </p>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-6 mb-10">
              {features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent-gold/10 flex items-center justify-center shrink-0">
                    <feature.icon className="w-5 h-5 text-accent-gold" />
                  </div>
                  <div>
                    <h4 className="font-display text-text-primary text-lg mb-1">
                      {feature.title}
                    </h4>
                    <p className="text-text-muted text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <PrimaryButton href="#" size="large">
              Plan Your Celebration
            </PrimaryButton>
          </div>

          {/* Image */}
          <div className="order-1 lg:order-2 relative">
            <div className="relative rounded-card overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80"
                alt="Luxury Wedding Setup"
                className="w-full h-[500px] lg:h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg-main/40 to-transparent" />
            </div>

            {/* Decorative Frame */}
            <div className="absolute -top-4 -left-4 w-24 h-24 border-l-2 border-t-2 border-accent-gold/30 rounded-tl-card" />
            <div className="absolute -bottom-4 -right-4 w-24 h-24 border-r-2 border-b-2 border-accent-gold/30 rounded-br-card" />
          </div>
        </div>
      </Container>
    </section>
  );
}
