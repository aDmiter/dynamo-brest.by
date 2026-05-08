// tailwind.config.ts - Конфигурация Tailwind CSS v4
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
        'dynamo-blue': {
          DEFAULT: '#004da8',
          light: '#005bb5',
          dark: '#003d8a',
        },
        'dynamo-white': '#ffffff',
        'dynamo-red': '#d50000',
        'dynamo-gray': {
          100: '#f3f4f6',
          200: '#e5e7eb',
          800: '#1f2937',
        },
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
        condensed: ['Roboto Condensed', 'Arial', 'sans-serif'],
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [],
} satisfies Config;
