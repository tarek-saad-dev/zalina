"use client";

import React from "react";
import Link from "next/link";
import { Instagram, Facebook, Twitter, Linkedin } from "lucide-react";

const footerLinks = [
  { label: "Home", href: "/" },
  { label: "Zones", href: "/zones" },
  { label: "Experiences", href: "/experiences" },
  { label: "Weddings", href: "/weddings" },
  { label: "Contact", href: "/contact" },
];

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
];

export function Footer() {
  return (
    <footer
      className="h-20 flex items-center"
      style={{
        background: "var(--zones-surface)",
        borderTop: "1px solid var(--zones-border)",
      }}
    >
      <div className="zones-container flex flex-col lg:flex-row items-center justify-between gap-4 w-full">
        {/* Copyright Left */}
        <p
          className="text-xs"
          style={{ color: "var(--zones-text-muted)" }}
        >
          © 2024 Zalina Arabian Village. All rights reserved.
        </p>

        {/* Links Center */}
        <nav className="flex items-center gap-6">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-xs transition-colors duration-200 hover:text-[var(--zones-text-light)]"
              style={{ color: "var(--zones-text-muted)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Social Icons Right */}
        <div className="flex items-center gap-3">
          {socialLinks.map((social) => {
            const Icon = social.icon;
            return (
              <Link
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 hover:bg-[var(--zones-gold)]/10"
                style={{ border: "1px solid var(--zones-border)" }}
              >
                <Icon
                  size={14}
                  style={{ color: "var(--zones-text-muted)" }}
                  strokeWidth={1.5}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </footer>
  );
}
