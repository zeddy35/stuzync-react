import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

export default {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        zync: { 400: "#7C86FF", 500: "#6D5EFC", 600: "#5A48F5" },
        ink: { 800: "#13182A", 900: "#0b1020" },
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.04)",
      },
      borderRadius: { xl: "1rem", "2xl": "1.25rem" },
    },
  },
  plugins: [forms, typography],
} satisfies Config;

