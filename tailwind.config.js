/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['"Playfair Display"', 'serif'],
      },
      colors: {
        background: '#050505',
        surface: '#111111',
        'surface-light': '#1A1A1A',
        primary: '#FB790B',
        secondary: '#FF9900',
        text: {
          primary: '#FFFFFF',
          secondary: '#A1A1AA',
          muted: '#71717A',
        }
      },
      animation: {
        'gradient': 'gradient 15s ease infinite',
        'spotlight': 'spotlight 2s ease .75s 1 forwards',
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
      },
      keyframes: {
        'gradient': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          },
        },
        'spotlight': {
          '0%': {
            opacity: 0,
            transform: 'translate(-50%, -50%) scale(0.5)',
          },
          '100%': {
            opacity: 1,
            transform: 'translate(-50%, -50%) scale(1)',
          },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0%)' },
        }
      },
    },
  },
  plugins: [],
}