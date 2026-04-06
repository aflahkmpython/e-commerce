/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-dark': '#050505',
        'brand-accent': '#FF3366',
        'neon-teal': '#00F2FF',
        'glass-white': 'rgba(255, 255, 255, 0.1)',
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
      fontFamily: {
        'futuristic': ['Inter', 'Outfit', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
