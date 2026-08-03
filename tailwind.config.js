/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./{app,components,libs,pages,hooks}/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
        handwriting: ['Pacifico', 'cursive'],
      },
      colors: {
        // KORNA MALL brand — admin palette
        brand: {
          DEFAULT: '#153B6D', // navy blue (primary brand / chrome)
          green: '#153B6D', // legacy alias → navy
          navy: '#153B6D',
          dark: '#0F2A4F', // deeper navy hover
          soft: '#F5F5F5', // light gray section backgrounds
          accent: '#F28C28', // warm orange CTAs / promotions
          accentDark: '#D97716', // orange hover
          cta: '#F28C28',
          ink: '#333333', // charcoal text
          muted: '#6B6B6B', // secondary text
          surface: '#FFFFFF',
          line: '#E5E5E5',
        },
      },
    },
  },
  plugins: [],
};
