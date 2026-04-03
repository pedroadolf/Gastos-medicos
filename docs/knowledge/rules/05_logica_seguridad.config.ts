import type { Config } from 'tailwindcss'

const config: Config = {
  // 1. Rutas de archivos para escanear clases
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  
  // 2. Modo oscuro basado en preferencias del sistema
  darkMode: 'media', 

  theme: {
    extend: {
      // 🎨 Mapeo de Design Tokens a clases de Tailwind
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
        },
        calm: {
          DEFAULT: 'var(--color-calm)',
        },
        amber: {
          DEFAULT: 'var(--color-amber)',
        },
        orange: {
          DEFAULT: 'var(--color-orange)',
        },
        // Estructura semántica de la guía
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        foreground: 'var(--color-text)',
        muted: {
          DEFAULT: 'var(--color-bg-muted)',
          foreground: 'var(--color-text-muted)',
        },
        border: 'var(--color-border)',
      },

      // 📐 Tipografía
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular'],
      },

      // 📏 Radios de borde y sombras
      borderRadius: {
        'sm': 'var(--radius-sm)',
        'md': 'var(--radius-md)',
        'lg': 'var(--radius-lg)',
        'xl': 'var(--radius-xl)',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'sm': 'var(--shadow-sm)',
        'md': 'var(--shadow-md)',
        'lg': 'var(--shadow-lg)',
      },

      // ✨ Animaciones personalizadas
      animation: {
        'shimmer': 'shimmer 1.5s infinite',
        'fade-in': 'fadeIn 200ms ease-in-out',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
