import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "var(--ink)",
        muted: "var(--muted)",
        surface: "var(--surface)",
        accent: "var(--accent)",
        accentSoft: "var(--accent-soft)",
        success: "var(--success)",
        danger: "var(--danger)"
      },
      boxShadow: {
        card: "0 10px 30px rgba(10, 24, 39, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
