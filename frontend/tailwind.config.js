/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:      "#0E1120",
        sidebar: "#0B0E1B",
        card:    "#141829",
        card2:   "#1A1F35",
        border:  "#232840",
        accent: {
          DEFAULT: "#6366F1",
          light:   "#818CF8",
          dark:    "#4338CA",
        },
        cyan: {
          DEFAULT: "#22D3EE",
          dark: "#0E7490",
        },
        text:  "#F1F5F9",
        sub:   "#8790AC",
        green: {
          DEFAULT: "#10B981",
          dark: "#047857",
        },
        red: {
          DEFAULT: "#F43F5E",
          dark: "#BE123C",
        },
        amber: {
          DEFAULT: "#F59E0B",
          dark: "#B45309",
        },
      },
    },
  },
  plugins: [],
};
