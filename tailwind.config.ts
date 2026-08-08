import type { Config } from 'tailwindcss';

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Body: legibilidad perfecta en texto largo (instrucciones, enunciados).
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Math: simbolos y formulas fuera de KaTeX (KaTeX ya trae su propia fuente via katex.min.css).
        // STIX Two Math no esta disponible en Google Fonts CDN; STIX Two Text es el sustituto cargado.
        math: ['"STIX Two Math"', '"STIX Two Text"', 'serif'],
        // Display: titulos matematicos elegantes.
        display: ['"Playfair Display"', 'serif'],
        // Mono: numeros, puntajes, datos tabulares.
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        // Namespace explicito de la paleta profesional matematica (bg-math-cyan, text-math-gold, etc).
        // Tema claro: los nombres se mantienen (navy, midnight...) para no tener que renombrar
        // cientos de clases ya escritas, pero ahora describen un ROL, no un color literal —
        // `math-navy` es el fondo de pagina (claro), `math-white` es el color de texto principal
        // (oscuro). Es el mismo patron que "on-primary" en otros design systems.
        math: {
          navy: '#f8fafc',
          midnight: '#ffffff',
          blue: '#1d4ed8',
          cyan: '#0891b2',
          gold: '#d97706',
          silver: '#64748b',
          white: '#0f172a',
          success: '#16a34a',
          error: '#dc2626',
        },
        // Tokens semanticos (usados por la mayoria de los componentes existentes) remapeados
        // a la nueva paleta, para que toda la app se reskinee de forma consistente.
        border: 'rgba(8, 145, 178, 0.18)',
        input: 'rgba(8, 145, 178, 0.18)',
        ring: '#0891b2',
        background: '#f8fafc',
        foreground: '#0f172a',
        primary: {
          DEFAULT: '#0891b2',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#1d4ed8',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: '#f1f5f9',
          foreground: '#64748b',
        },
        accent: {
          DEFAULT: 'rgba(8, 145, 178, 0.1)',
          foreground: '#0891b2',
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#ffffff',
        },
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0f172a',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        ripple: {
          '0%': { transform: 'scale(0)', opacity: '0.45' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 2s ease-in-out infinite',
        ripple: 'ripple 600ms ease-out forwards',
        'fade-up': 'fade-up 0.3s ease-out',
      },
    },
  },
  plugins: [],
} satisfies Config;
