/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      serif: ['Spectral'],
      cursive: ['Alex Brush'],
    },
    extend: {
      colors: {
        felineGreen: {
          light: '#75a185',
          DEFAULT: '#5d826a',
          dark: '#3a5945',
        },
        felineOrange: {
          light: '#f7a45c',
          DEFAULT: '#ec8e3e',
          dark: '#a15412',
        },
        felineLove: {
          light: '#fc876a',
          DEFAULT: '#ef6c4a',
          dark: '#a13113',
        },
        felineBg: {
          light: '#f3dfad',
          DEFAULT: '#beb9a2',
          dark: '#706c55',
        },
      },
      keyframes: {
        shake: {
          '0%, 100%': { transform: 'rotate(0deg)' },
          '20%': { transform: 'rotate(-10deg)' },
          '40%': { transform: 'rotate(10deg)' },
          '60%': { transform: 'rotate(-10deg)' },
          '80%': { transform: 'rotate(10deg)' },
        },
      },
      animation: {
        shake: 'shake 0.8s ease-in-out',
      },
    },
  },
  plugins: [],
};
