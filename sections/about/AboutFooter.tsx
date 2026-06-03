"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

const navigationLinks = [
  { label: "Home", href: "/" },
  { label: "The Village", href: "/village" },
  { label: "Experiences", href: "/experiences" },
  { label: "Occasions", href: "/occasions" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function AboutFooter() {
  return (
    <footer
      className="relative py-16 px-4 sm:px-6 lg:px-12"
      style={{
        background: "#0D1321",
        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Luxury Glow Effect */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: "inset 0 0 60px rgba(217, 176, 115, 0.05)",
        }}
      />

      <div className="max-w-[1200px] mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
          {/* LEFT: Logo */}
          <div className="text-center md:text-left">
            <Link href="/" className="inline-block">
              <span
                className="text-3xl tracking-[0.2em] uppercase"
                style={{
                  color: "#D9B073",
                  fontFamily: "var(--font-display)",
                  fontWeight: 600,
                }}
              >
                Zalina
              </span>
            </Link>
            <p
              className="mt-3 text-sm"
              style={{ color: "rgba(214, 210, 203, 0.6)" }}
            >
              A Village for the Soul
            </p>
          </div>

          {/* CENTER: Navigation */}
          <nav className="flex flex-wrap justify-center gap-6">
            {navigationLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm tracking-wide transition-colors duration-300 hover:text-[#D9B073]"
                style={{ color: "rgba(214, 210, 203, 0.8)" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* RIGHT: Contact & Social */}
          <div className="text-center md:text-right">
            {/* Contact Info */}
            <div className="mb-4">
              <p
                className="text-sm mb-1"
                style={{ color: "rgba(214, 210, 203, 0.6)" }}
              >
                reservations@zalina.com
              </p>
              <p
                className="text-sm"
                style={{ color: "rgba(214, 210, 203, 0.6)" }}
              >
                +971 4 123 4567
              </p>
            </div>

            {/* Social Links */}
            <div className="flex justify-center md:justify-end gap-4">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <Link
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-[#D9B073]/10"
                    style={{
                      border: "1px solid rgba(217, 176, 115, 0.3)",
                    }}
                  >
                    <Icon
                      className="w-4 h-4"
                      style={{ color: "#D9B073" }}
                      strokeWidth={1.5}
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
          style={{ borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}
        >
          <p
            className="text-xs"
            style={{ color: "rgba(214, 210, 203, 0.4)" }}
          >
            © 2024 Zalina Arabian Village. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="text-xs transition-colors duration-300 hover:text-[#D9B073]"
              style={{ color: "rgba(214, 210, 203, 0.4)" }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs transition-colors duration-300 hover:text-[#D9B073]"
              style={{ color: "rgba(214, 210, 203, 0.4)" }}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
