/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',   // Full HD+
      '4xl': '2560px',   // QHD / 2K
    },
    extend: {
      colors: {
        // Custom dark theme palette - Balanced contrast with clear hierarchy
        dark: {
          900: '#0a0a0f',   // Darkest background
          800: '#12121a',   // Panel background
          700: '#1a1a24',   // Card background
          600: '#2a2a38',   // Borders
          500: '#6b7280',   // Subtle text (for labels like "Sources:")
          400: '#9ca3af',   // Muted text (for citations, tertiary info)
          300: '#d1d5db',   // Secondary text (for descriptions, subheadings)
          200: '#e5e7eb',   // Body text (for paragraphs, readable content)
          100: '#ffffff',   // Primary text (for main headlines only)
        },
        accent: {
          primary: '#818cf8',    // Brighter Indigo
          secondary: '#22d3ee',  // Cyan
          danger: '#f87171',     // Brighter Red for cameras
          success: '#4ade80',    // Brighter Green for avoidance
          warning: '#fbbf24',    // Brighter Amber
          DEFAULT: '#dc2626',    // Red accent
        },
        // Landing page theme colors - direct values for Tailwind v3
        background: '#0a0a0f',
        foreground: '#f3f4f6',
        card: {
          DEFAULT: '#12121a',
          foreground: '#f3f4f6',
        },
        popover: {
          DEFAULT: '#12121a',
          foreground: '#f3f4f6',
        },
        primary: {
          DEFAULT: '#dc2626',
          foreground: '#fafafa',
        },
        secondary: {
          DEFAULT: '#1a1a24',
          foreground: '#f3f4f6',
        },
        muted: {
          DEFAULT: '#2a2a38',
          foreground: '#9ca3af',
        },
        destructive: {
          DEFAULT: '#dc2626',
          foreground: '#fafafa',
        },
        border: '#2a2a38',
        input: '#1a1a24',
        ring: '#dc2626',
      },
      fontFamily: {
        // Use Space Grotesk as primary - much more readable
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
      },
      fontSize: {
        // Slightly larger base sizes for readability
        'xs': ['0.8125rem', { lineHeight: '1.25rem' }],   // 13px
        'sm': ['0.9375rem', { lineHeight: '1.375rem' }],  // 15px
        'base': ['1rem', { lineHeight: '1.5rem' }],       // 16px
        'lg': ['1.125rem', { lineHeight: '1.625rem' }],   // 18px
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],     // 20px
        '2xl': ['1.5rem', { lineHeight: '2rem' }],        // 24px
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-red': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
