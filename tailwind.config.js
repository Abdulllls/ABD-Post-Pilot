/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          black: "#0a0a0b",
          panel: "#121214",
          border: "#232326",
        },
        maroon: {
          50: "#fbe9eb",
          200: "#e7a7ae",
          400: "#b8404d",
          500: "#8c1c28",
          600: "#6e1520",
          700: "#4f0f17",
        },
      },
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};
