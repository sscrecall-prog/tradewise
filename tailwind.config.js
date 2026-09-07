/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--color-bg-primary)',
          secondary: 'var(--color-bg-secondary)',
          card: 'var(--color-bg-card)',
          elevated: 'var(--color-bg-elevated)',
        },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          muted: 'var(--color-text-muted)',
        },
        border: {
          subtle: 'var(--color-border)',
        },
        brand: {
          positive: '#b8f331',          // Electric Volt Lime Green
          positiveLight: '#d6f96b',
          negative: '#fb7185',          // Soft Coral Salmon Pink/Red
          negativeLight: '#fda4af',
          warning: '#facc15',
          accent: '#b8f331',            // Signature Electric Lime
          accentHover: '#c6f849',
          accentDark: '#4d7c0f',
          cyan: '#38bdf8',              // Doughnut/Chart secondary
        },
        dark: {
          950: '#090e09',               // Deepest obsidian forest black
          900: '#0f150f',               // Dark moss secondary
          850: '#141c14',               // Card surface
          800: '#1c261c',               // Elevated surface
          700: '#233223',               // Subtle moss border
          600: '#2f422f',
        },
        trade: {
          green: '#b8f331',             // Electric lime
          'green-light': '#d6f96b',
          'green-dark': '#4d7c0f',
          'green-bg': 'rgba(184, 243, 49, 0.14)',
          red: '#fb7185',               // Coral salmon
          'red-light': '#fda4af',
          'red-dark': '#be123c',
          'red-bg': 'rgba(251, 113, 133, 0.14)',
          blue: '#38bdf8',
          'blue-light': '#7dd3fc',
          cyan: '#22d3ee',
          purple: '#c084fc',
          amber: '#fbbf24',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.3)',
        'lime-glow': '0 0 25px -3px rgba(184, 243, 49, 0.28)',
        'lime-sm': '0 0 12px -2px rgba(184, 243, 49, 0.35)',
        'coral-glow': '0 0 25px -3px rgba(251, 113, 133, 0.28)',
        'card-glow': '0 18px 40px -15px rgba(0, 0, 0, 0.6)',
      }
    },
  },
  plugins: [],
}
