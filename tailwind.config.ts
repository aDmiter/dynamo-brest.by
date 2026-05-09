// tailwind.config.ts - Конфигурация Tailwind CSS
import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/modules/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'club-dark': '#242C41',
        'club-blue': '#14516c',
        'club-light': '#a5b3d5',
        'club-brown': '#a6725c',
        'club-orange': '#ee862c',
        'club-gold': '#f0ac74',
        'club-gray': {
          100: '#F5F5F5',
          200: '#E0E0E0',
          800: '#1A1A1A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', 'Arial', 'sans-serif'],
        heading: ['Inter Tight', 'sans-serif'],
        jersey: ['Jersey 10 Charted', 'monospace'],
      },
      borderRadius: {
        DEFAULT: '0',
        none: '0',
        sm: '0',
        md: '0',
        lg: '0',
        xl: '0',
        '2xl': '0',
        '3xl': '0',
        full: '0',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      },
    },
  },
  plugins: [],
} satisfies Config;
