/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'df-primary': '#0A0A0A',
        'df-surface': '#1A1A1A',
        'df-elevated': '#252525',
        'df-text': '#FFFFFF',
        'df-text-secondary': '#888888',
        'df-accent-red': '#FF3366',
        'df-accent-cyan': '#00FFFF',
        'df-border': '#333333',
      },
      fontFamily: {
        'bebas': ['"Bebas Neue"', 'sans-serif'],
        'space': ['"Space Grotesk"', 'sans-serif'],
        'mono': ['"JetBrains Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
