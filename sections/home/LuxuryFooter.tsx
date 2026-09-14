"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Instagram, Facebook, Twitter, Linkedin, Youtube } from "lucide-react";

const footerLinkGroups = {
  explore: [
    { key: "about" as const, href: "/about" },
    { key: "experiences" as const, href: "/experiences" },
    { key: "zones" as const, href: "/zones" },
    { key: "gallery" as const, href: "/gallery" },
  ],
  occasions: [
    { key: "weddings" as const, href: "/weddings" },
  ],
  discover: [
    { key: "dayExperience" as const, href: "/experiences?category=Day" },
    { key: "nightExperience" as const, href: "/experiences?category=Night" },
    { key: "bookNow" as const, href: "/book-now" },
  ],
  information: [
    { key: "reservations" as const, href: "/book-now" },
    { key: "gallery" as const, href: "/gallery" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#", key: "instagram" as const },
  { icon: Facebook, href: "#", key: "facebook" as const },
  { icon: Twitter, href: "#", key: "twitter" as const },
  { icon: Linkedin, href: "#", key: "linkedin" as const },
  { icon: Youtube, href: "#", key: "youtube" as const },
];

export function LuxuryFooter() {
  const t = useTranslations("footer");

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
                  {t("brand")}
                </span>
              </Link>

              {/* Tagline */}
              <p
                className="text-sm mb-4 tracking-wide"
                style={{ color: "var(--lux-gold)", fontFamily: "var(--font-display, serif)" }}
              >
                {t("tagline")}
              </p>

              <p className="lux-body mb-6 max-w-sm text-sm" style={{ lineHeight: 1.6 }}>
                {t("description")}
              </p>

              {/* Contact Info */}
              <div className="space-y-2">
                <p className="text-sm" style={{ color: "rgba(246, 240, 232, 0.86)" }}>
                  <span style={{ color: "var(--lux-gold)" }}>{t("locationLabel")}</span>{" "}
                  {t("locationValue")}
                </p>
                <p className="text-sm" style={{ color: "rgba(246, 240, 232, 0.86)" }}>
                  <span style={{ color: "var(--lux-gold)" }}>{t("emailLabel")}</span>{" "}
                  {t("emailValue")}
                </p>
                <p className="text-sm" style={{ color: "rgba(246, 240, 232, 0.86)" }}>
                  <span style={{ color: "var(--lux-gold)" }}>{t("phoneLabel")}</span>{" "}
                  {t("phoneValue")}
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
              {t("sections.explore")}
            </h4>
            <ul className="space-y-3">
              {footerLinkGroups.explore.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-300 hover:text-[var(--lux-gold)]"
                    style={{ color: "rgba(246, 240, 232, 0.8)" }}
                  >
                    {t(`links.${link.key}`)}
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
              {t("sections.occasions")}
            </h4>
            <ul className="space-y-3">
              {footerLinkGroups.occasions.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-300 hover:text-[var(--lux-gold)]"
                    style={{ color: "rgba(246, 240, 232, 0.8)" }}
                  >
                    {t(`links.${link.key}`)}
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
              {t("sections.discover")}
            </h4>
            <ul className="space-y-3">
              {footerLinkGroups.discover.map((link) => (
                <li key={link.key}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-300 hover:text-[var(--lux-gold)]"
                    style={{ color: "rgba(246, 240, 232, 0.8)" }}
                  >
                    {t(`links.${link.key}`)}
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
              {t("sections.information")}
            </h4>
            <ul className="space-y-3">
              {footerLinkGroups.information.map((link) => (
                <li key={`${link.key}-${link.href}`}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-300 hover:text-[var(--lux-gold)]"
                    style={{ color: "rgba(246, 240, 232, 0.8)" }}
                  >
                    {t(`links.${link.key}`)}
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
            {t("copyright")}
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {socialLinks.map((social) => {
              const Icon = social.icon;
              const label = t(`social.${social.key}`);
              return (
                <Link
                  key={social.key}
                  href={social.href}
                  aria-label={label}
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
              {t("links.privacy")}
            </Link>
            <Link
              href="/terms"
              className="text-xs transition-colors duration-300 hover:text-[var(--lux-gold)]"
              style={{ color: "rgba(246, 240, 232, 0.58)" }}
            >
              {t("links.terms")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
