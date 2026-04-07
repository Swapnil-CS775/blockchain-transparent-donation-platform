/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Adding your NGO theme colors here
        primary: "#0052CC",
        secondary: "#00875A",
      }
    },
  },
  plugins: [],
}