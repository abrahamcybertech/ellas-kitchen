/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          gold: {
            50: '#FDF9EF',
            100: '#FAF2DC',
            200: '#F3E2B4',
            300: '#EBCF8A',
            400: '#E1BC5F',
            500: '#C9972C', // Signature Ella Gold
            600: '#A97A1E',
            700: '#875E17',
            800: '#694715',
            900: '#523714',
            accent: '#D4AF37',
          },
          brown: {
            50: '#F9F6F3',
            100: '#F1E9E4',
            200: '#E1D1C6',
            300: '#C7B1A2',
            400: '#A58B79',
            500: '#7F6452',
            600: '#5F4635',
            700: '#4A3425',
            800: '#3D2314', // Rich Ella Brown
            900: '#2A180E', // Deep kitchen wood
            950: '#1A0E08',
          },
          dark: {
            800: '#1F1A17',
            900: '#141210',
            950: '#0C0A09', // Pitch contrast
          },
          cream: {
            50: '#FFFFFF',
            100: '#FDFBF7', // Primary warm ivory
            200: '#FAF6F0',
            300: '#F4EFE6',
            400: '#ECE3D5',
          },
        },
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'gold-glow': '0 4px 20px -2px rgba(201, 151, 44, 0.25)',
        'rich': '0 10px 30px -5px rgba(26, 14, 8, 0.35)',
      },
    },
  },
  plugins: [],
};
