/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          red: "#c8102e",
          "red-dark": "#a00d25",
          "red-light": "#f9e6e9",
        },
      },
      fontFamily: {
        sans: ["Sarabun", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};

