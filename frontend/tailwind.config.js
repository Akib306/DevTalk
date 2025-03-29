/** @type {import('tailwindcss').Config} */
import { heroui } from "@heroui/react"
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6", // blue-500
        accent: "#60A5FA", // blue-400
        background: "#0B1120", // dark background
        foreground: "#F1F5F9", // light foreground
      },
      animation: {
        'gradient-x': 'gradient-x 12s ease infinite',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            backgroundPosition: '0% 50%',
          },
          '50%': {
            backgroundPosition: '100% 50%',
          },
        },
      },
    },
  },
  darkMode: "class",
  plugins: [heroui()]
}

