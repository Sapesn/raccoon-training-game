/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        raccoon: {
          50:  '#fff8f0',
          100: '#ffecd4',
          200: '#ffd4a0',
          300: '#ffb560',
          400: '#ff9020',
          500: '#e87010',
          600: '#c05508',
          700: '#9a4008',
          800: '#7a330d',
          900: '#632b0f',
        },
      },
      fontFamily: {
        sans: ['"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
