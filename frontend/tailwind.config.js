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
        },
        cyan:  "#22D3EE",
        text:  "#F1F5F9",
        sub:   "#5A6481",
        green: "#10B981",
        red:   "#F43F5E",
        amber: "#F59E0B",
      },
    },
  },
  plugins: [],
};
