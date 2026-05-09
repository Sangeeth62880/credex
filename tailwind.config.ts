import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-base":      "var(--bg-base)",
        "bg-surface":   "var(--bg-surface)",
        "bg-elevated":  "var(--bg-elevated)",
        "bg-overlay":   "var(--bg-overlay)",
        "border-subtle":  "var(--border-subtle)",
        "border-default": "var(--border-default)",
        "border-strong":  "var(--border-strong)",
        "text-primary":   "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-muted":     "var(--text-muted)",
        "text-inverse":   "var(--text-inverse)",
        "accent":       "var(--accent)",
        "accent-dim":   "var(--accent-dim)",
        "accent-hover": "var(--accent-hover)",
        "positive":    "var(--positive)",
        "positive-bg": "var(--positive-bg)",
        "warning":     "var(--warning)",
        "warning-bg":  "var(--warning-bg)",
        "negative":    "var(--negative)",
        "negative-bg": "var(--negative-bg)",
        "neutral":     "var(--neutral)",
        "credex-cta-bg":     "var(--credex-cta-bg)",
        "credex-cta-border": "var(--credex-cta-border)",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input:  "hsl(var(--input))",
        ring:   "hsl(var(--ring))",
      },
      fontFamily: {
        serif: ['"DM Serif Display"', "Georgia", "serif"],
        sans:  ['"Geist"', "system-ui", "-apple-system", "sans-serif"],
        mono:  ['"IBM Plex Mono"', '"Menlo"', "monospace"],
      },
      fontSize: {
        "xs":  ["11px",  { lineHeight: "16px" }],
        "sm":  ["13px",  { lineHeight: "20px" }],
        "base":["15px",  { lineHeight: "24px" }],
        "lg":  ["18px",  { lineHeight: "28px" }],
        "xl":  ["24px",  { lineHeight: "32px" }],
        "2xl": ["32px",  { lineHeight: "40px" }],
        "3xl": ["48px",  { lineHeight: "56px" }],
        "4xl": ["72px",  { lineHeight: "80px" }],
        "5xl": ["96px",  { lineHeight: "1" }],
      },
      spacing: {
        "1":  "4px",
        "2":  "8px",
        "3":  "12px",
        "4":  "16px",
        "5":  "20px",
        "6":  "24px",
        "8":  "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
      },
      borderRadius: {
        sm:  "4px",
        md:  "8px",
        lg:  "12px",
        xl:  "16px",
      },
      maxWidth: {
        content: "760px",
        results: "960px",
        hero:    "640px",
      },
      keyframes: {
        stepIn: {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        countUp: {
          "0%":   { opacity: "0.4" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "step-in":  "stepIn 0.25s ease forwards",
        "count-up": "countUp 1.2s ease-out forwards",
      },
    },
  },
  plugins: [],
};
export default config;
