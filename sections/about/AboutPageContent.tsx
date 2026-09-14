"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { motion, useScroll, useTransform } from "framer-motion";

import { NEUTRAL_MEDIA_FALLBACK } from "@/lib/media";
import { useMarkHeroReady } from "@/components/media/HeroRevealGate";
import {
  HERO_BLUR_DATA_URL,
  HERO_IMAGE_QUALITY,
} from "@/components/media/heroImage";

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  show: { opacity: 1 },
};

const STARS = [
  { top: "8%", left: "10%", size: 2, delay: "0s", dur: "3.4s" },
  { top: "13%", left: "30%", size: 1.5, delay: "1.2s", dur: "4.6s" },
  { top: "5%", left: "55%", size: 2.5, delay: "0.5s", dur: "2.9s" },
  { top: "18%", left: "75%", size: 1.5, delay: "2.1s", dur: "5.0s" },
  { top: "10%", left: "90%", size: 2, delay: "0.9s", dur: "3.8s" },
  { top: "22%", left: "20%", size: 1, delay: "1.7s", dur: "4.1s" },
  { top: "7%", left: "68%", size: 2, delay: "2.0s", dur: "4.3s" },
];

const MANIFESTO_KEYS = ["heritage", "presence", "evenings"] as const;
const PILLAR_KEYS = ["heritage", "atmosphere", "celebration"] as const;
const STORY_KEYS = [
  "dining",
  "gatherings",
  "evenings",
  "weddings",
  "private",
] as const;
const DIFFERENCE_KEYS = [
  "atmosphere",
  "experiences",
  "service",
  "evening",
  "events",
] as const;

/* ─── Section: Hero ─────────────────────────────────────── */
function AboutHeroSection() {
  const t = useTranslations("about");
  const ref = useRef<HTMLDivElement>(null);
  const markHeroReady = useMarkHeroReady();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.07]);
  const fadeOut = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100vh", background: "transparent" }}
    >
      <motion.div className="absolute inset-0" style={{ y: bgY, scale: bgScale }}>
        <Image
          src={NEUTRAL_MEDIA_FALLBACK}
          alt={t("hero.imageAlt")}
          fill
          className="object-cover object-center"
          priority
          fetchPriority="high"
          quality={HERO_IMAGE_QUALITY}
          sizes="100vw"
          placeholder="blur"
          blurDataURL={HERO_BLUR_DATA_URL}
          onLoadingComplete={markHeroReady}
        />
      </motion.div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(5,5,5,0.78) 0%, rgba(5,5,5,0.2) 35%, transparent 60%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, transparent 50%, rgba(5,5,5,0.8) 82%, #050505 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 38%, rgba(5,5,5,0.52) 100%)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 65% 45% at 50% 55%, rgba(212,175,55,0.1) 0%, transparent 70%)",
          animation: "hero-glow-pulse 7s ease-in-out infinite",
        }}
      />

      {STARS.map((s, i) => (
        <div
          key={i}
          className="hero-star pointer-events-none"
          style={{
            top: s.top,
            left: s.left,
            width: `${s.size}px`,
            height: `${s.size}px`,
            animationDelay: s.delay,
            animationDuration: s.dur,
          }}
        />
      ))}

      <motion.div
        className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 md:px-12"
        style={{ opacity: fadeOut, paddingTop: "100px", paddingBottom: "80px" }}
      >
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.8, delay: 0.1 }}
          className="lux-eyebrow mb-6"
        >
          {t("hero.eyebrow")}
        </motion.p>

        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.9, delay: 0.3 }}
          style={{
            fontFamily: "var(--font-display, 'Cormorant Garamond', serif)",
            fontSize: "clamp(46px, 7vw, 100px)",
            fontWeight: 400,
            lineHeight: 1.02,
            color: "#F8F5ED",
            letterSpacing: "-0.01em",
            maxWidth: "900px",
          }}
        >
          {t("hero.titleLine1")}
          <br />
          <span style={{ color: "#D4AF37", fontStyle: "italic" }}>
            {t("hero.titleAccent")}
          </span>
        </motion.h1>

        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1.1, delay: 0.7 }}
          className="lux-divider mx-auto mt-8 mb-8"
          style={{ maxWidth: "160px" }}
        />

        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="show"
          transition={{ duration: 0.8, delay: 0.85 }}
          style={{
            fontFamily: "var(--font-body, sans-serif)",
            fontSize: "clamp(15px, 1.4vw, 18px)",
            color: "rgba(248,245,237,0.68)",
            lineHeight: 1.8,
            maxWidth: "600px",
          }}
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <motion.div
            animate={{ y: [0, 9, 0] }}
            transition={{ duration: 2.3, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center gap-3"
          >
            <span
              style={{
                fontSize: "8px",
                letterSpacing: "0.3em",
                textTransform: "uppercase",
                color: "rgba(212,175,55,0.45)",
                fontFamily: "var(--font-body)",
              }}
            >
              {t("hero.scroll")}
            </span>
            <div
              className="w-px"
              style={{
                height: "44px",
                background:
                  "linear-gradient(to bottom, rgba(212,175,55,0.45), transparent)",
              }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ─── Section: Brand Story ───────────────────────────────── */
function BrandStorySection() {
  const t = useTranslations("about");

  return (
    <section
      className="w-full"
      style={{
        background: "transparent",
        paddingTop: "120px",
        paddingBottom: "120px",
      }}
    >
      <div
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(212,175,55,0.3), transparent)",
          marginBottom: "0",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.1 }}
            className="flex-1 relative hidden md:block"
            style={{ minHeight: "520px" }}
          >
            <div
              className="absolute"
              style={{
                top: 0,
                left: "10%",
                width: "72%",
                height: "380px",
                border: "1px solid rgba(212,175,55,0.2)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
              }}
            >
              <Image
                src={NEUTRAL_MEDIA_FALLBACK}
                alt={t("story.imageAltPrimary")}
                fill
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(5,5,5,0.35) 0%, transparent 60%)",
                }}
              />
            </div>
            <div
              className="absolute"
              style={{
                bottom: 0,
                right: 0,
                width: "58%",
                height: "280px",
                border: "1px solid rgba(212,175,55,0.25)",
                boxShadow: "0 32px 64px rgba(0,0,0,0.7)",
                zIndex: 2,
              }}
            >
              <Image
                src={NEUTRAL_MEDIA_FALLBACK}
                alt={t("story.imageAltSecondary")}
                fill
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(5,5,5,0.25) 0%, transparent 70%)",
                }}
              />
            </div>
            <div
              className="absolute"
              style={{
                bottom: "60px",
                left: "8%",
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "#D4AF37",
                boxShadow: "0 0 12px rgba(212,175,55,0.6)",
                zIndex: 3,
              }}
            />
            <div
              className="absolute"
              style={{
                top: "20%",
                left: "4%",
                width: "1px",
                height: "120px",
                background:
                  "linear-gradient(to bottom, transparent, rgba(212,175,55,0.5), transparent)",
              }}
            />
          </motion.div>

          <div className="flex-1 max-w-xl">
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lux-eyebrow mb-5"
            >
              {t("story.eyebrow")}
            </motion.p>

            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.1 }}
              style={{
                fontFamily: "var(--font-display, serif)",
                fontSize: "clamp(32px, 4vw, 56px)",
                fontWeight: 400,
                lineHeight: 1.1,
                color: "#F8F5ED",
                letterSpacing: "-0.01em",
                marginBottom: "24px",
              }}
            >
              {t("story.title")}
              <br />
              <span style={{ color: "#D4AF37", fontStyle: "italic" }}>
                {t("story.titleAccent")}
              </span>
            </motion.h2>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.2 }}
              className="lux-divider mb-8"
              style={{ transformOrigin: "left", maxWidth: "140px" }}
            />

            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.25 }}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(14px, 1.3vw, 16px)",
                color: "rgba(248,245,237,0.65)",
                lineHeight: 1.85,
                marginBottom: "32px",
              }}
            >
              {t("story.body")}
            </motion.p>

            <motion.blockquote
              variants={fadeIn}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 1.1, delay: 0.4 }}
              className="relative pl-6"
              style={{ borderLeft: "2px solid rgba(212,175,55,0.45)" }}
            >
              <p
                style={{
                  fontFamily: "var(--font-display, serif)",
                  fontSize: "clamp(16px, 1.6vw, 20px)",
                  fontStyle: "italic",
                  color: "rgba(212,175,55,0.85)",
                  lineHeight: 1.6,
                }}
              >
                &ldquo;{t("story.quote")}&rdquo;
              </p>
            </motion.blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section: Manifesto ─────────────────────────────────── */
function ManifestoSection() {
  const t = useTranslations("about");

  return (
    <section
      className="w-full relative"
      style={{
        background: "var(--lux-surface)",
        paddingTop: "120px",
        paddingBottom: "120px",
        overflow: "hidden",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(circle, #D4AF37 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 60%, rgba(212,175,55,0.06) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-center mb-20"
        >
          <p className="lux-eyebrow mb-5">{t("manifesto.eyebrow")}</p>
          <h2
            style={{
              fontFamily: "var(--font-display, serif)",
              fontSize: "clamp(34px, 4.5vw, 62px)",
              fontWeight: 400,
              lineHeight: 1.08,
              color: "#F8F5ED",
            }}
          >
            {t("manifesto.title")}{" "}
            <span style={{ color: "#D4AF37", fontStyle: "italic" }}>
              {t("manifesto.titleAccent")}
            </span>
          </h2>
        </motion.div>

        <div className="flex flex-col">
          {MANIFESTO_KEYS.map((key, i) => (
            <motion.div
              key={key}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.9, delay: i * 0.12 }}
              className="flex flex-col md:flex-row md:items-start gap-6 md:gap-12 py-10"
              style={{ borderTop: "1px solid rgba(212,175,55,0.12)" }}
            >
              <span
                style={{
                  fontFamily: "var(--font-display, serif)",
                  fontSize: "clamp(48px, 5vw, 72px)",
                  fontWeight: 300,
                  color: "rgba(212,175,55,0.18)",
                  lineHeight: 1,
                  flexShrink: 0,
                  minWidth: "80px",
                }}
              >
                {t(`manifesto.items.${key}.num`)}
              </span>
              <div className="flex-1 pt-2">
                <h3
                  style={{
                    fontFamily: "var(--font-display, serif)",
                    fontSize: "clamp(20px, 2.2vw, 28px)",
                    fontWeight: 400,
                    color: "#F8F5ED",
                    marginBottom: "12px",
                    letterSpacing: "0.01em",
                  }}
                >
                  {t(`manifesto.items.${key}.title`)}
                </h3>
                <p
                  style={{
                    fontFamily: "var(--font-body)",
                    fontSize: "clamp(14px, 1.2vw, 16px)",
                    color: "rgba(248,245,237,0.55)",
                    lineHeight: 1.8,
                    maxWidth: "560px",
                  }}
                >
                  {t(`manifesto.items.${key}.body`)}
                </p>
              </div>
              <div
                className="hidden lg:block flex-shrink-0"
                style={{
                  width: "1px",
                  height: "60px",
                  background:
                    "linear-gradient(to bottom, rgba(212,175,55,0.4), transparent)",
                  marginTop: "8px",
                }}
              />
            </motion.div>
          ))}
          <div
            style={{
              height: "1px",
              background:
                "linear-gradient(90deg, rgba(212,175,55,0.12), transparent)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

/* ─── Section: Signature Pillars ─────────────────────────── */
function PillarsSection() {
  const t = useTranslations("about");

  return (
    <section
      className="w-full"
      style={{
        background: "transparent",
        paddingTop: "120px",
        paddingBottom: "120px",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="text-center mb-16"
        >
          <p className="lux-eyebrow mb-5">{t("pillars.eyebrow")}</p>
          <h2
            style={{
              fontFamily: "var(--font-display, serif)",
              fontSize: "clamp(32px, 4vw, 56px)",
              fontWeight: 400,
              lineHeight: 1.1,
              color: "#F8F5ED",
            }}
          >
            {t("pillars.title")}{" "}
            <span style={{ color: "#D4AF37", fontStyle: "italic" }}>
              {t("pillars.titleAccent")}
            </span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PILLAR_KEYS.map((key, i) => {
            const title = t(`pillars.items.${key}.title`);
            return (
              <motion.div
                key={key}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.9, delay: i * 0.14 }}
                className="relative overflow-hidden group"
                style={{
                  height: "480px",
                  border: "1px solid rgba(212,175,55,0.16)",
                  background: "rgba(8,8,8,0.8)",
                }}
              >
                <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
                  <Image
                    src={NEUTRAL_MEDIA_FALLBACK}
                    alt={title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(5,5,5,0.15) 0%, rgba(5,5,5,0.75) 70%, rgba(5,5,5,0.95) 100%)",
                  }}
                />
                <div
                  className="absolute top-0 left-0 right-0"
                  style={{
                    height: "2px",
                    background:
                      "linear-gradient(90deg, transparent, rgba(212,175,55,0.5), transparent)",
                  }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <div
                    className="mb-4"
                    style={{
                      width: "36px",
                      height: "1px",
                      background: "rgba(212,175,55,0.6)",
                    }}
                  />
                  <h3
                    style={{
                      fontFamily: "var(--font-display, serif)",
                      fontSize: "clamp(24px, 2.5vw, 32px)",
                      fontWeight: 400,
                      color: "#F8F5ED",
                      marginBottom: "10px",
                      letterSpacing: "0.01em",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "13px",
                      color: "rgba(248,245,237,0.55)",
                      lineHeight: 1.7,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {t(`pillars.items.${key}.desc`)}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Section: Immersive Stories ─────────────────────────── */
function ImmersiveStoriesSection() {
  const t = useTranslations("about");

  return (
    <section
      className="w-full"
      style={{
        background: "var(--lux-surface)",
        paddingTop: "120px",
        paddingBottom: "120px",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
          <div className="flex-1 max-w-lg">
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lux-eyebrow mb-5"
            >
              {t("stories.eyebrow")}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.1 }}
              style={{
                fontFamily: "var(--font-display, serif)",
                fontSize: "clamp(30px, 3.8vw, 52px)",
                fontWeight: 400,
                lineHeight: 1.1,
                color: "#F8F5ED",
                marginBottom: "20px",
              }}
            >
              {t("stories.title")}
              <br />
              <span style={{ color: "#D4AF37", fontStyle: "italic" }}>
                {t("stories.titleAccent")}
              </span>
            </motion.h2>

            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lux-divider mb-8"
              style={{ transformOrigin: "left", maxWidth: "130px" }}
            />

            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "clamp(14px, 1.3vw, 16px)",
                color: "rgba(248,245,237,0.62)",
                lineHeight: 1.85,
                marginBottom: "36px",
              }}
            >
              {t("stories.body")}
            </motion.p>

            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 1.0, delay: 0.35 }}
              className="flex flex-col gap-0"
            >
              {STORY_KEYS.map((key, i) => {
                const label = t(`stories.items.${key}`);
                return (
                  <div
                    key={key}
                    className="flex items-center gap-4 py-4"
                    style={{
                      borderBottom:
                        i < STORY_KEYS.length - 1
                          ? "1px solid rgba(212,175,55,0.09)"
                          : "none",
                    }}
                  >
                    <div
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: "#D4AF37", opacity: 0.7 }}
                    />
                    <span
                      style={{
                        fontFamily: "var(--font-display, serif)",
                        fontSize: "15px",
                        color: "rgba(248,245,237,0.72)",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {label}
                    </span>
                  </div>
                );
              })}
            </motion.div>
          </div>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.1 }}
            className="flex-1 relative"
            style={{ minHeight: "580px" }}
          >
            <div className="relative w-full h-full" style={{ minHeight: "580px" }}>
              <Image
                src={NEUTRAL_MEDIA_FALLBACK}
                alt={t("stories.imageAlt")}
                fill
                className="object-cover"
                style={{ border: "1px solid rgba(212,175,55,0.18)" }}
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(5,5,5,0.3) 0%, transparent 60%)",
                }}
              />
              <div
                className="absolute top-4 left-4 w-10 h-10 pointer-events-none"
                style={{
                  borderTop: "1px solid rgba(212,175,55,0.5)",
                  borderLeft: "1px solid rgba(212,175,55,0.5)",
                }}
              />
              <div
                className="absolute bottom-4 right-4 w-10 h-10 pointer-events-none"
                style={{
                  borderBottom: "1px solid rgba(212,175,55,0.5)",
                  borderRight: "1px solid rgba(212,175,55,0.5)",
                }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section: The Zalina Difference ─────────────────────── */
function DifferenceSection() {
  const t = useTranslations("about");

  return (
    <section
      className="w-full"
      style={{
        background: "transparent",
        paddingTop: "120px",
        paddingBottom: "120px",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-24">
          <div className="flex-1 max-w-xl">
            <motion.p
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lux-eyebrow mb-5"
            >
              {t("difference.eyebrow")}
            </motion.p>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.1 }}
              style={{
                fontFamily: "var(--font-display, serif)",
                fontSize: "clamp(30px, 3.8vw, 52px)",
                fontWeight: 400,
                lineHeight: 1.1,
                color: "#F8F5ED",
                marginBottom: "16px",
              }}
            >
              {t("difference.title")}{" "}
              <span style={{ color: "#D4AF37", fontStyle: "italic" }}>
                {t("difference.titleAccent")}
              </span>
            </motion.h2>
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="lux-divider mb-10"
              style={{ transformOrigin: "left", maxWidth: "130px" }}
            />

            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              transition={{ duration: 1.0, delay: 0.2 }}
              className="flex flex-col"
            >
              {DIFFERENCE_KEYS.map((key, i) => (
                <div
                  key={key}
                  className="flex items-start gap-5 py-5"
                  style={{ borderTop: "1px solid rgba(212,175,55,0.1)" }}
                >
                  <div className="flex flex-col items-center gap-1 pt-1 flex-shrink-0">
                    <div
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: "#D4AF37" }}
                    />
                    {i < DIFFERENCE_KEYS.length - 1 && (
                      <div
                        className="w-px flex-1"
                        style={{
                          height: "24px",
                          background:
                            "linear-gradient(to bottom, rgba(212,175,55,0.3), transparent)",
                        }}
                      />
                    )}
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-body)",
                      fontSize: "clamp(13px, 1.2vw, 15px)",
                      color: "rgba(248,245,237,0.68)",
                      lineHeight: 1.7,
                    }}
                  >
                    {t(`difference.items.${key}`)}
                  </p>
                </div>
              ))}
              <div style={{ borderTop: "1px solid rgba(212,175,55,0.1)" }} />
            </motion.div>
          </div>

          <motion.div
            variants={fadeIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 1.1 }}
            className="flex-1 relative hidden lg:block"
            style={{ minHeight: "520px" }}
          >
            <div
              className="absolute"
              style={{
                top: 0,
                right: 0,
                width: "75%",
                height: "360px",
                border: "1px solid rgba(212,175,55,0.18)",
                boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
              }}
            >
              <Image
                src={NEUTRAL_MEDIA_FALLBACK}
                alt={t("difference.imageAltNight")}
                fill
                className="object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(5,5,5,0.3) 0%, transparent 60%)",
                }}
              />
            </div>
            <div
              className="absolute"
              style={{
                bottom: 0,
                left: 0,
                width: "55%",
                height: "240px",
                border: "1px solid rgba(212,175,55,0.22)",
                boxShadow: "0 32px 64px rgba(0,0,0,0.7)",
                zIndex: 2,
              }}
            >
              <Image
                src={NEUTRAL_MEDIA_FALLBACK}
                alt={t("difference.imageAltDay")}
                fill
                className="object-cover"
              />
            </div>
            <div
              className="absolute"
              style={{
                top: "40px",
                left: "20%",
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "#D4AF37",
                boxShadow: "0 0 10px rgba(212,175,55,0.5)",
                zIndex: 3,
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ─── Section: Final CTA ─────────────────────────────────── */
function AboutCTASection() {
  const t = useTranslations("about");

  return (
    <section
      className="w-full relative overflow-hidden"
      style={{ paddingTop: "120px", paddingBottom: "120px" }}
    >
      <div className="absolute inset-0">
        <Image
          src={NEUTRAL_MEDIA_FALLBACK}
          alt={t("cta.imageAlt")}
          fill
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(5,5,5,0.88) 0%, rgba(5,5,5,0.7) 50%, rgba(5,5,5,0.92) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(212,175,55,0.09) 0%, transparent 70%)",
          }}
        />
      </div>
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(212,175,55,0.4), transparent)",
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 md:px-12 text-center">
        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="lux-eyebrow mb-6"
        >
          {t("cta.eyebrow")}
        </motion.p>

        <motion.h2
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.1 }}
          style={{
            fontFamily: "var(--font-display, serif)",
            fontSize: "clamp(34px, 4.5vw, 64px)",
            fontWeight: 400,
            lineHeight: 1.08,
            color: "#F8F5ED",
            marginBottom: "20px",
          }}
        >
          {t("cta.title")}
          <br />
          <span style={{ color: "#D4AF37", fontStyle: "italic" }}>
            {t("cta.titleAccent")}
          </span>
        </motion.h2>

        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.2 }}
          className="lux-divider mx-auto mb-8"
          style={{ maxWidth: "130px" }}
        />

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.25 }}
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "clamp(14px, 1.3vw, 17px)",
            color: "rgba(248,245,237,0.62)",
            lineHeight: 1.8,
            marginBottom: "44px",
          }}
        >
          {t("cta.body")}
        </motion.p>

        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.35 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/experiences"
            className="inline-flex items-center justify-center px-10 py-4 text-xs font-medium uppercase transition-all duration-300"
            style={{
              fontFamily: "var(--font-body)",
              background: "linear-gradient(135deg, #D4AF37 0%, #B8963E 100%)",
              color: "#050505",
              borderRadius: "2px",
              letterSpacing: "0.18em",
              boxShadow: "0 8px 28px rgba(212,175,55,0.28)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-2px)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 14px 36px rgba(212,175,55,0.44)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLElement).style.boxShadow =
                "0 8px 28px rgba(212,175,55,0.28)";
            }}
          >
            {t("cta.primary")}
          </Link>
          <Link
            href="/book-now"
            className="inline-flex items-center justify-center px-10 py-4 text-xs font-medium uppercase transition-all duration-300"
            style={{
              fontFamily: "var(--font-body)",
              background: "transparent",
              color: "rgba(248,245,237,0.8)",
              border: "1px solid rgba(212,175,55,0.38)",
              borderRadius: "2px",
              letterSpacing: "0.18em",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor = "#D4AF37";
              (e.currentTarget as HTMLElement).style.color = "#D4AF37";
              (e.currentTarget as HTMLElement).style.transform =
                "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.borderColor =
                "rgba(212,175,55,0.38)";
              (e.currentTarget as HTMLElement).style.color =
                "rgba(248,245,237,0.8)";
              (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
            }}
          >
            {t("cta.secondary")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── Main Export ────────────────────────────────────────── */
export function AboutPageContent() {
  return (
    <div className="lux-page w-full">
      <AboutHeroSection />
      <BrandStorySection />
      <ManifestoSection />
      <PillarsSection />
      <ImmersiveStoriesSection />
      <DifferenceSection />
      <AboutCTASection />
    </div>
  );
}
