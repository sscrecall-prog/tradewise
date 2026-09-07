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
          positive: '#35C98A',
          negative: '#F05D5E',
          warning: '#F2B84B',
          accent: '#C9A227',
          accentHover: '#E0B530',
        },
        dark: {
          950: '#080a0f',
          900: '#0d111a',
          850: '#111724',
          800: '#161e30',
          700: '#1f2940',
          600: '#2b3956',
        },
        trade: {
          green: '#10b981',
          'green-light': '#34d399',
          'green-dark': '#047857',
          'green-bg': 'rgba(16, 185, 129, 0.12)',
          red: '#ef4444',
          'red-light': '#f87171',
          'red-dark': '#b91c1c',
          'red-bg': 'rgba(239, 68, 68, 0.12)',
          blue: '#3b82f6',
          'blue-light': '#60a5fa',
          cyan: '#06b6d4',
          purple: '#a855f7',
          amber: '#f59e0b',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace']
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'subtle': '0 2px 10px rgba(0, 0, 0, 0.2)',
      }
    },
  },
  plugins: [],
}
