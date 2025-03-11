/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        accent: {
          50: 'rgb(var(--color-accent-rgb), 0.05)',
          100: 'rgb(var(--color-accent-rgb), 0.1)',
          200: 'rgb(var(--color-accent-rgb), 0.2)',
          300: 'rgb(var(--color-accent-rgb), 0.3)',
          400: 'rgb(var(--color-accent-rgb), 0.4)',
          500: 'rgb(var(--color-accent-rgb), 0.7)',
          600: 'rgb(var(--color-accent-rgb), 0.8)',
          700: 'rgb(var(--color-accent-rgb), 0.9)',
          800: 'rgb(var(--color-accent-rgb), 0.95)',
          900: 'rgb(var(--color-accent-rgb), 1)',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-in': 'slideInUp 0.4s ease-out',
      },
    },
  },
  plugins: [
    // Remove tailwind-scrollbar plugin that's causing errors
  ],
  variants: {
    extend: {}
  }
};