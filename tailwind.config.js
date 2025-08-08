/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'primary': '#7100EB',
        'secondary': '#95F4A0',
        'risk-high': '#D42828',
        'risk-medium': '#EFC728',
        'risk-safe': '#95F4A0',
      },
      animation: {
        'pulse-once': 'pulse-once 1s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'live-poll': 'live-poll 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
