/** @type {import('tailwindcss').Config} */
const config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Light Theme (Storm Marble)
        light: {
          background: "#E4E9EC",   // Very light gray
          surface: "#7B8FA1",      // Soft steel blue
          text: "#2A2E35",         // Dark text
          accent: "#A3B8CC",       // Optional accent
        },

        // Dark Theme (Royal Jade)
        dark: {
          background: "#0A2010",   // Deep green
          surface: "#256D5A",      // Mid green
          text: "#9EDFC7",         // Light mint
          accent: "#0E3D2D",       // Darker green for hover/focus
        },
      },
      backgroundImage: {
        light: "linear-gradient(135deg, #E4E9EC 0%, #7B8FA1 100%)",
        dark: "linear-gradient(135deg, #0A2010 0%, #256D5A 100%)",
      },
      fontFamily: {
        sans: ['"Inter"', "ui-sans-serif", "system-ui"],
      },
      animation: {
        "fade-in": "fadeIn 1s ease-out",
        "pulse-slow": "pulse 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0, transform: "translateY(10px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
