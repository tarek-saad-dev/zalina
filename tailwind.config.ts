import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./sections/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Background Colors — prefer CSS vars for Phase -1 consolidation
        "bg-main": "var(--bg-main)",
        "bg-section": "var(--bg-section)",
        "bg-surface": "var(--bg-surface)",

        // Text Colors
        "text-primary": "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted": "var(--text-muted)",

        // Accent Colors
        "accent-gold": "var(--accent-gold)",
        "accent-gold-hover": "var(--accent-gold-hover)",
        "accent-sand": "var(--accent-sand)",
        "accent-bronze": "var(--accent-bronze)",

        // Canonical Zalina tokens
        zalina: {
          bg: "var(--zalina-bg)",
          surface: "var(--zalina-surface)",
          text: "var(--zalina-text)",
          muted: "var(--zalina-text-muted)",
          gold: "var(--zalina-gold)",
          highlight: "var(--zalina-gold-highlight)",
          soft: "var(--zalina-gold-soft)",
          border: "var(--zalina-border)",
        },

        // Border Colors
        "border-subtle": "var(--border-subtle)",
        "border-gold-soft": "var(--border-gold-soft)",

        // Status Colors
        "status-success": "#7A9B6A",
        "status-warning": "#B88A4A",
        "status-error": "#A85A4A",
      },
      fontFamily: {
        display: ["Cormorant Garamond", "Georgia", "serif"],
        "heading-ar": ["Alexandria", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        serif: ["Cormorant Garamond", "Georgia", "serif"],
      },
      maxWidth: {
        zalina: "var(--zalina-container-max)",
      },
      borderRadius: {
        card: "22px",
        button: "14px",
        zalina: "var(--zalina-btn-radius)",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0, 0, 0, 0.25)",
        premium: "0 20px 60px rgba(0, 0, 0, 0.35)",
        "glow-gold": "0 0 40px var(--zalina-gold-soft)",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
        "zalina-cinematic": "var(--zalina-space-cinematic)",
        "zalina-standard": "var(--zalina-space-standard)",
        "zalina-compact": "var(--zalina-space-compact)",
        "zalina-gutter": "var(--zalina-gutter)",
      },
      fontSize: {
        "zalina-hero": "var(--zalina-text-hero)",
        "zalina-section": "var(--zalina-text-section)",
        "zalina-body": "var(--zalina-text-body)",
        "zalina-eyebrow": "var(--zalina-text-eyebrow)",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "arch-gradient":
          "linear-gradient(180deg, rgba(201, 163, 92, 0.08) 0%, transparent 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
