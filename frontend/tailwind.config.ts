import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#071b25",
        harbor: {
          50: "#effcfb",
          100: "#d6f6f2",
          200: "#b0ebe5",
          300: "#78d8d2",
          400: "#3ebdb9",
          500: "#209f9e",
          600: "#187f81",
          700: "#176668",
          800: "#165254",
          900: "#154548"
        }
      },
      boxShadow: {
        soft: "0 18px 55px rgba(7, 27, 37, 0.10)",
        card: "0 8px 30px rgba(7, 27, 37, 0.07)"
      }
    }
  },
  plugins: []
} satisfies Config;
