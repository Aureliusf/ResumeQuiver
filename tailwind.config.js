/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'df-primary': 'var(--df-primary)',
        'df-surface': 'var(--df-surface)',
        'df-elevated': 'var(--df-elevated)',
        'df-text': 'var(--df-text)',
        'df-text-secondary': 'var(--df-text-secondary)',
        'df-accent-red': 'var(--df-accent-red)',
        'df-accent-cyan': 'var(--df-accent-cyan)',
        'df-accent-purple': 'var(--df-accent-purple)',
        'df-accent-green': 'var(--df-accent-green)',
        'df-accent-yellow': 'var(--df-accent-yellow)',
        'df-accent-amber': 'var(--df-accent-amber)',
        'df-border': 'var(--df-border)',
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
