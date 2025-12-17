/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#0a0a0a',
          primary: '#00ffff',
          success: '#00ff88',
          warning: '#ffaa00',
          error: '#ff6666',
          muted: '#888888',
          border: 'rgba(0, 255, 255, 0.2)',
        },
      },
      fontFamily: {
        mono: ['"SF Mono"', 'Monaco', 'Inconsolata', '"Fira Code"', 'monospace'],
      },
      boxShadow: {
        'cyber': '0 0 40px rgba(0, 255, 255, 0.1), inset 0 0 20px rgba(0, 255, 255, 0.02)',
        'cyber-hover': '0 0 30px rgba(0, 255, 255, 0.1), inset 0 0 30px rgba(0, 255, 255, 0.02)',
        'cyber-glow': '0 0 20px rgba(0, 255, 255, 0.4), inset 0 0 20px rgba(0, 255, 255, 0.1)',
      },
      backgroundImage: {
        'cyber-gradient': 'radial-gradient(ellipse at top left, rgba(0, 80, 120, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(120, 0, 80, 0.15) 0%, transparent 50%)',
      },
    },
  },
  plugins: [],
}
