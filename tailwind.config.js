// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class", // Enable class-based dark mode
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"], // Better, modern font
        display: ["Inter", "system-ui", "sans-serif"], // For headings
      },
      colors: {
        // Custom purple theme that works for both light and dark modes
        primary: {
          // Light mode purples (your current colors)
          50: "#faf5ff", // Very light purple
          100: "#f3e8ff", // Light purple
          200: "#e9d5ff", // Lighter purple
          300: "#d8b4fe", // Light-medium purple
          400: "#c084fc", // Medium purple
          500: "#a855f7", // Base purple
          600: "#9333ea", // Your current purple-600
          700: "#7c3aed", // Darker purple
          800: "#6b21a8", // Your current purple-800
          900: "#581c87", // Your current purple-900
          950: "#3b0764", // Very dark purple
        },
        // Dark mode specific colors
        dark: {
          // Dark backgrounds
          bg: {
            primary: "#0f0f23", // Very dark blue-purple
            secondary: "#1a1a2e", // Dark blue-purple
            tertiary: "#16213e", // Medium dark blue-purple
          },
          // Dark mode purple variants (lighter for better contrast)
          purple: {
            50: "#f8f4ff",
            100: "#ede9fe",
            200: "#ddd6fe",
            300: "#c4b5fd",
            400: "#a78bfa", // Lighter purple for dark mode
            500: "#8b5cf6", // Medium purple for dark mode
            600: "#7c3aed", // Base purple (same as light)
            700: "#6d28d9", // Darker purple
            800: "#5b21b6", // Dark purple
            900: "#4c1d95", // Very dark purple
          },
        },
        // Text colors for better contrast
        text: {
          light: {
            primary: "#1f2937", // Dark gray for light mode
            secondary: "#6b7280", // Medium gray for light mode
            tertiary: "#9ca3af", // Light gray for light mode
          },
          dark: {
            primary: "#f9fafb", // Very light for dark mode
            secondary: "#e5e7eb", // Light gray for dark mode
            tertiary: "#d1d5db", // Medium light for dark mode
          },
        },
      },
      // Better spacing and sizing
      spacing: {
        18: "4.5rem",
        88: "22rem",
      },
      // Enhanced shadows for depth
      boxShadow: {
        purple: "0 4px 14px 0 rgba(139, 92, 246, 0.25)",
        "purple-lg": "0 10px 25px 0 rgba(139, 92, 246, 0.35)",
        dark: "0 4px 14px 0 rgba(0, 0, 0, 0.4)",
        "dark-lg": "0 10px 25px 0 rgba(0, 0, 0, 0.5)",
      },
      // Smooth transitions
      transitionDuration: {
        250: "250ms",
        350: "350ms",
      },
    },
  },
  plugins: [],
};
