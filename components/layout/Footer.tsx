"use client";

import { Container } from "@/components/ui/Container";
import { OrnamentalDivider } from "@/components/ui/OrnamentalDivider";
import { 
  MapPin, 
  Phone, 
  Mail, 
  Instagram, 
  Facebook, 
  Youtube,
  ArrowUpRight 
} from "lucide-react";

const footerLinks = {
  explore: [
    { label: "About Us", href: "#about" },
    { label: "Experiences", href: "#experiences" },
    { label: "Zones", href: "#zones" },
    { label: "Weddings", href: "#weddings" },
    { label: "Gallery", href: "#gallery" },
  ],
  services: [
    { label: "Private Events", href: "#" },
    { label: "Corporate Retreats", href: "#" },
    { label: "Dining", href: "#" },
    { label: "Spa & Wellness", href: "#" },
    { label: "Concierge", href: "#" },
  ],
  legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Cookie Policy", href: "#" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Youtube, href: "#", label: "Youtube" },
];

export function Footer() {
  return (
    <footer className="bg-bg-section border-t border-border-subtle">
      {/* Main Footer */}
      <Container size="large" className="py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <a href="#home" className="inline-block">
              <span className="font-display text-3xl text-text-primary">
                Zalina
              </span>
              <span className="block text-xs tracking-[0.3em] uppercase text-text-muted mt-1">
                Arabian Village
              </span>
            </a>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              An immersive Arabian luxury destination where heritage meets elegance. 
              Experience authentic hospitality in a breathtaking setting.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-10 h-10 rounded-full border border-border-subtle flex items-center justify-center text-text-muted hover:text-accent-gold hover:border-accent-gold/40 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Explore Links */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-display text-lg text-text-primary mb-6">
              Explore
            </h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-text-muted hover:text-accent-gold transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div className="lg:col-span-2">
            <h4 className="font-display text-lg text-text-primary mb-6">
              Services
            </h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-text-muted hover:text-accent-gold transition-colors duration-300"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-3">
            <h4 className="font-display text-lg text-text-primary mb-6">
              Contact
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-accent-gold mt-0.5 shrink-0" />
                <span className="text-sm text-text-muted">
                  Desert Road, Al Ain Region<br />
                  Abu Dhabi, United Arab Emirates
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-accent-gold shrink-0" />
                <a 
                  href="tel:+971234567890" 
                  className="text-sm text-text-muted hover:text-accent-gold transition-colors"
                >
                  +971 2 345 6789
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-accent-gold shrink-0" />
                <a 
                  href="mailto:reservations@zalina.ae" 
                  className="text-sm text-text-muted hover:text-accent-gold transition-colors"
                >
                  reservations@zalina.ae
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>

      {/* Bottom Bar */}
      <div className="border-t border-border-subtle">
        <Container size="large" className="py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-text-muted">
              © {new Date().getFullYear()} Zalina Arabian Village. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {footerLinks.legal.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs text-text-muted hover:text-accent-gold transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </Container>
      </div>
    </footer>
  );
}
