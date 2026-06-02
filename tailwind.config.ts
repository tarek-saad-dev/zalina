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
        // Background Colors
        "bg-main": "#0D0B0A",
        "bg-section": "#171312",
        "bg-surface": "#1E1816",

        // Text Colors
        "text-primary": "#F3EBDD",
        "text-secondary": "#C8B8A4",
        "text-muted": "#A8937A",

        // Accent Colors
        "accent-gold": "#C7A36A",
        "accent-gold-hover": "#D7B47D",
        "accent-sand": "#DCC7A3",
        "accent-bronze": "#9B6A4A",

        // Border Colors
        "border-subtle": "#342A24",
        "border-gold-soft": "rgba(199, 163, 106, 0.32)",

        // Status Colors
        "status-success": "#7A9B6A",
        "status-warning": "#B88A4A",
        "status-error": "#A85A4A",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "serif"],
        "heading-ar": ["var(--font-alexandria)", "sans-serif"],
        body: ["var(--font-inter)", "sans-serif"],
        serif: ["Cormorant Garamond", "Georgia", "serif"],
      },
      borderRadius: {
        card: "22px",
        button: "14px",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0, 0, 0, 0.25)",
        premium: "0 20px 60px rgba(0, 0, 0, 0.35)",
        "glow-gold": "0 0 40px rgba(199, 163, 106, 0.15)",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      transitionDuration: {
        "400": "400ms",
        "600": "600ms",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "arch-gradient":
          "linear-gradient(180deg, rgba(199, 163, 106, 0.08) 0%, transparent 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
