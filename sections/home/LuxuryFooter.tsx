"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";

const footerLinks = {
  explore: [
    { label: "About", href: "/about" },
    { label: "Experiences", href: "/experiences" },
    { label: "Zones", href: "/zones" },
    { label: "Gallery", href: "/gallery" },
  ],
  occasions: [
    { label: "Weddings", href: "/weddings" },
    { label: "Private Events", href: "/events/private" },
    { label: "Celebrations", href: "/events/celebrations" },
  ],
  discover: [
    { label: "Day Experiences", href: "/experiences/day" },
    { label: "Night Experiences", href: "/experiences/night" },
    { label: "Dining", href: "/dining" },
    { label: "Wellness", href: "/wellness" },
  ],
  information: [
    { label: "Contact Us", href: "/contact" },
    { label: "Reservations", href: "/book" },
    { label: "FAQs", href: "/faq" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export function LuxuryFooter() {
  return (
    <footer
      className="relative overflow-hidden"
      style={{ background: "var(--lux-surface)" }}
    >
      {/* Pattern Background */}
      <div className="absolute inset-0 lux-pattern opacity-20" />

      {/* Top Border */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--lux-gold), transparent)",
        }}
      />

      <div className="lux-container relative z-10">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Logo */}
              <Link href="/" className="inline-block mb-4">
                <span
                  className="text-2xl font-medium tracking-wider"
                  style={{
                    fontFamily: "var(--font-display)",
                    background:
                      "linear-gradient(135deg, #F7E6C7 0%, #D8B27B 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Zalina Arabian Village
                </span>
              </Link>

              {/* Tagline */}
              <p
                className="text-sm mb-4 tracking-wide"
                style={{ color: "var(--lux-gold)", fontFamily: "var(--font-display, serif)" }}
              >
                Where Ancient Egypt Meets Modern Luxury
              </p>

              <p className="lux-body mb-6 max-w-sm text-sm" style={{ lineHeight: 1.6 }}>
                An immersive destination inspired by the legends, beauty, and timeless grandeur of Ancient Egypt.
              </p>

              {/* Contact Info */}
              <div className="space-y-2">
                <p className="text-sm" style={{ color: "rgba(246, 240, 232, 0.86)" }}>
                  <span style={{ color: "var(--lux-gold)" }}>Location:</span>{" "}
                  Egypt
                </p>
                <p className="text-sm" style={{ color: "rgba(246, 240, 232, 0.86)" }}>
                  <span style={{ color: "var(--lux-gold)" }}>Email:</span>{" "}
                  hanan.freestyledevelopmentllc@gmail.com
                </p>
                <p className="text-sm" style={{ color: "rgba(246, 240, 232, 0.86)" }}>
                  <span style={{ color: "var(--lux-gold)" }}>Phone:</span>{" "}
                  +1 623 204 1074
                </p>
              </div>
            </motion.div>
          </div>

          {/* Explore */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <h4
              className="text-sm font-medium mb-6 tracking-wider"
              style={{ color: "var(--lux-gold)" }}
            >
              EXPLORE
            </h4>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-300 hover:text-[var(--lux-gold)]"
                    style={{ color: "rgba(246, 240, 232, 0.8)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Occasions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h4
              className="text-sm font-medium mb-6 tracking-wider"
              style={{ color: "var(--lux-gold)" }}
            >
              OCCASIONS
            </h4>
            <ul className="space-y-3">
              {footerLinks.occasions.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-300 hover:text-[var(--lux-gold)]"
                    style={{ color: "rgba(246, 240, 232, 0.8)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Discover */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            <h4
              className="text-sm font-medium mb-6 tracking-wider"
              style={{ color: "var(--lux-gold)" }}
            >
              DISCOVER
            </h4>
            <ul className="space-y-3">
              {footerLinks.discover.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-300 hover:text-[var(--lux-gold)]"
                    style={{ color: "rgba(246, 240, 232, 0.8)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <h4
              className="text-sm font-medium mb-6 tracking-wider"
              style={{ color: "var(--lux-gold)" }}
            >
              INFORMATION
            </h4>
            <ul className="space-y-3">
              {footerLinks.information.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-300 hover:text-[var(--lux-gold)]"
                    style={{ color: "rgba(246, 240, 232, 0.8)" }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <div
          className="h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent, var(--lux-border), transparent)",
          }}
        />

        {/* Bottom Bar */}
        <div className="py-8 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <p className="text-xs" style={{ color: "rgba(246, 240, 232, 0.58)" }}>
            © 2026 Zalina Arabian Village. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              return (
                <Link
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:bg-[rgba(201,163,92,0.15)] hover:border-[var(--lux-gold)]"
                  style={{
                    border: "1px solid var(--lux-border)",
                  }}
                >
                  <Icon
                    size={16}
                    style={{ color: "rgba(246, 240, 232, 0.8)" }}
                    strokeWidth={1.5}
                  />
                </Link>
              );
            })}
          </div>

          {/* Legal Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-xs transition-colors duration-300 hover:text-[var(--lux-gold)]"
              style={{ color: "rgba(246, 240, 232, 0.58)" }}
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs transition-colors duration-300 hover:text-[var(--lux-gold)]"
              style={{ color: "rgba(246, 240, 232, 0.58)" }}
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
