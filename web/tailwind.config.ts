import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Quicksand"', 'system-ui', 'sans-serif'],
        body: ['"Nunito Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: '#faf8ff',
        cream: '#fffdf9',
        ink: '#171b2b',
        pebble: '#4f5d73',
        outline: '#f0eae1',
        coral: {
          50: '#fff5f2',
          100: '#ffdad4',
          200: '#ffb4a6',
          300: '#ff9e8b',
          400: '#ff7e67',
          500: '#e2634d',
          700: '#731709',
        },
        mint: {
          100: '#dffbe9',
          200: '#95f7bb',
          300: '#7adaa1',
          600: '#006d41',
          700: '#005230',
        },
        honey: {
          100: '#ffdf9b',
          200: '#ffd166',
          300: '#edc157',
          700: '#785a00',
        },
        lavender: {
          100: '#f3f2ff',
          200: '#e4e7fe',
          300: '#dee1f8',
          400: '#bdb2ff',
          500: '#9a8cff',
        },
        sky: {
          100: '#eaf2ff',
          300: '#a0c4ff',
        },
        brand: {
          50: '#fff5f2',
          100: '#ffdad4',
          200: '#ffb4a6',
          300: '#ff9e8b',
          400: '#ff7e67',
          500: '#ff7e67',
          600: '#e2634d',
          700: '#731709',
        },
        warm: {
          50: '#fffdf9',
          100: '#ffdf9b',
          300: '#ffd166',
          400: '#edc157',
          500: '#785a00',
        },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '3rem',
      },
      boxShadow: {
        card: '0 4px 14px rgba(45, 49, 66, 0.05), 0 2px 0 #f0eae1',
        nav: '0 10px 30px rgba(45, 49, 66, 0.08), 0 2px 0 #f0eae1',
        button: '0 4px 0 #e2634d, 0 8px 20px rgba(255, 126, 103, 0.25)',
        soft: '0 12px 32px rgba(45, 49, 66, 0.12)',
      },
    },
  },
  plugins: [],
} satisfies Config
