/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    fontFamily: {
      serif: ['Spectral'],
      cursive: ['Alex Brush'],
    },
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
  },
  plugins: [],
};
