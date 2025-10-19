/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        zync: {
          50:  "#f5f7ff",
          100: "#e9ebff",
          200: "#cdd3ff",
          300: "#aeb6ff",
          400: "#7C86FF",
          500: "#6D5EFC",
          600: "#5A48F5",
          700: "#4937d9",
          800: "#3729b3",
          900: "#241f7a",
        },
        ink: {
          800: "#13182A",
          900: "#0b1020",
        },
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,.06), 0 2px 8px rgba(0,0,0,.04)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
