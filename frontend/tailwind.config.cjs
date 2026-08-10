/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'feud-blue': '#1e40af',
        'feud-red': '#dc2626',
        'feud-yellow': '#f59e0b',
        'feud-green': '#16a34a',
      },
      fontFamily: {
        'game': ['Arial Black', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
