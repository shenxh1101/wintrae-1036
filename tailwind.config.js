/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        bg: {
          primary: "#1a120b",
          secondary: "#2d1f14",
          tertiary: "#3d2a1a",
          card: "#251a0f",
          hover: "#4a3520",
        },
        gold: {
          50: "#fdf6e3",
          100: "#f9e8b8",
          200: "#f3d77c",
          300: "#e8c04a",
          400: "#d4a82e",
          500: "#c9a227",
          600: "#b8891f",
          700: "#8b6914",
          800: "#6b5010",
          900: "#4a380a",
        },
        accent: {
          red: "#c94c4c",
          blue: "#4c7cc9",
          green: "#4cc97c",
          purple: "#9c4cc9",
          orange: "#d97b3a",
        },
        rarity: {
          common: "#9ca3af",
          uncommon: "#22c55e",
          rare: "#3b82f6",
          epic: "#a855f7",
          legendary: "#f59e0b",
        },
      },
      fontFamily: {
        serif: ["'Noto Serif SC'", "serif"],
      },
      boxShadow: {
        gold: "0 0 20px rgba(201, 162, 39, 0.3)",
        "gold-sm": "0 0 10px rgba(201, 162, 39, 0.2)",
        card: "0 4px 20px rgba(0, 0, 0, 0.5)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #c9a227 0%, #8b6914 100%)",
        "card-gradient":
          "linear-gradient(180deg, #2d1f14 0%, #1a120b 100%)",
        "btn-gradient":
          "linear-gradient(135deg, #c9a227 0%, #8b6914 50%, #c9a227 100%)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
        "float": "float 3s ease-in-out infinite",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 5px rgba(201, 162, 39, 0.5)" },
          "100%": { boxShadow: "0 0 20px rgba(201, 162, 39, 0.8)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};
