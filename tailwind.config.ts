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
        background: "#FFF9F5",
        "background-secondary": "#FFF0E8",
        foreground: "#2D2A26",
        "foreground-secondary": "#7A7067",
        accent: {
          DEFAULT: "#E8567F",
          hover: "#D94470",
          light: "#FFF0F3",
        },
        destructive: {
          DEFAULT: "#DC2626",
          hover: "#B91C1C",
          light: "#FEF2F2",
        },
        success: {
          DEFAULT: "#16A34A",
          hover: "#15803D",
          light: "#F0FDF4",
        },
        border: "rgba(0, 0, 0, 0.06)",
        card: "#FFFFFF",
      },
      fontFamily: {
        sans: ["Nunito", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        card: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
        "card-hover": "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.03)",
        drawer: "-4px 0 24px rgba(0, 0, 0, 0.08)",
        dropdown: "0 10px 30px rgba(0, 0, 0, 0.08)",
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        30: "7.5rem",
      },
      lineHeight: {
        heading: "1.2",
        body: "1.6",
      },
    },
  },
  plugins: [],
};

export default config;
