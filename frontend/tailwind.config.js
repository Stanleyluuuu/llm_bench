/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    screens: {
      sm: '640px',     // mobile landscape
      md: '768px',     // tablet
      lg: '1280px',    // 13" laptop baseline
      xl: '1440px',    // 14-15" laptop / small desktop
      '2xl': '1600px', // 15-17" laptop / standard desktop
      '3xl': '1920px', // FHD desktop
      '4xl': '2560px', // QHD / large monitor
    },
    extend: {
      colors: {
        // 🏗️ 基底色 (Surface) — driven by CSS variables for theming
        'platform-bg': 'hsl(var(--background))',
        'platform-card': 'hsl(var(--card))',
        'platform-secondary': 'hsl(var(--secondary))',
        'platform-accent': 'hsl(var(--accent))',
        'platform-border': 'hsl(var(--border))',
        // ✏️ 文字色 (Typography)
        'platform-fg': 'hsl(var(--foreground))',
        'platform-muted': 'hsl(var(--muted-foreground))',
        'platform-whiteFg': 'hsl(var(--primary-foreground))',
        // 🎨 品牌與連結
        'brand-primary': 'hsl(var(--primary))',
        // 🚦 語義色 (Semantic)
        'semantic-pass': '#10B981',
        'semantic-fail': '#EF4444',

        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--foreground))',
        },
        border: 'hsl(var(--border))',
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        success: {
          DEFAULT: 'hsl(var(--success))',
          foreground: 'hsl(var(--success-foreground))',
        },
        warning: {
          DEFAULT: 'hsl(var(--warning))',
          foreground: 'hsl(var(--warning-foreground))',
        },
        tooltip: {
          DEFAULT: 'hsl(var(--tooltip-bg))',
          foreground: 'hsl(var(--tooltip-fg))',
        },
        'model-custom': {
          DEFAULT: 'hsl(var(--model-custom))',
          soft: 'hsl(var(--model-custom-soft))',
        },
        'model-builtin': {
          DEFAULT: 'hsl(var(--model-builtin))',
          soft: 'hsl(var(--model-builtin-soft))',
        },
      },
      borderRadius: {
        lg: '0.375rem', /* Map to 6px (rounded-md equivalent) to strictly avoid large rounding */
        md: '0.375rem',
        sm: '0.25rem',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 hsl(var(--primary) / 0.4)' },
          '50%': { boxShadow: '0 0 0 8px hsl(var(--primary) / 0)' },
        },
        'success-bounce': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'success-bounce': 'success-bounce 0.4s ease-in-out',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(to right, #41659b, #7297c7)',
      },
    },
  },
  plugins: [],
}
