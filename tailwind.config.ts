
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(240 3.7% 15.9%)', // Dark border
        input: 'hsl(240 3.7% 15.9%)', // Dark input
        ring: 'hsl(240 4.9% 83.9%)', // Slightly lighter ring
        background: 'hsl(240 10% 3.9%)', // Very dark background
        foreground: 'hsl(0 0% 98%)', // Almost white text
        primary: {
          DEFAULT: 'hsl(263 70% 50%)', // Brighter purple to match the image
          foreground: 'hsl(222.2 47.4% 11.2%)'
        },
        secondary: {
          DEFAULT: 'hsl(198 93% 55%)', // Brighter blue to match the image
          foreground: 'hsl(210 40% 98%)'
        },
        destructive: {
          DEFAULT: 'hsl(0 62.8% 30.6%)', // Darker destructive color
          foreground: 'hsl(0 0% 98%)'
        },
        muted: {
          DEFAULT: 'hsl(240 3.7% 15.9%)', // Dark muted background
          foreground: 'hsl(240 5% 64.9%)' // Lighter muted text
        },
        accent: {
          DEFAULT: 'hsl(263 70% 50%)', // Purple accent to match the image
          foreground: 'hsl(0 0% 98%)'
        },
        popover: {
          DEFAULT: 'hsl(240 10% 3.9%)', // Very dark popover
          foreground: 'hsl(0 0% 98%)'
        },
        card: {
          DEFAULT: 'hsl(240 6% 10%)', // Dark card background to match the image
          foreground: 'hsl(0 0% 98%)'
        },
        sidebar: {
          DEFAULT: 'hsl(240 5.9% 10%)', // Extremely dark sidebar
          foreground: 'hsl(240 4.8% 95.9%)', // Almost white sidebar text
          primary: 'hsl(263 76.3% 55%)', // Bright purple sidebar primary
          'primary-foreground': 'hsl(0 0% 100%)',
          accent: 'hsl(240 3.7% 15.9%)', // Dark sidebar accent
          'accent-foreground': 'hsl(240 4.8% 95.9%)',
          border: 'hsl(240 3.7% 15.9%)', // Dark sidebar border
          ring: 'hsl(217.2 91.2% 59.8%)' // Bright sidebar ring
        },
        'text-primary': {
          DEFAULT: 'hsl(var(--text-primary))', // White text for dark backgrounds
          foreground: 'hsl(var(--text-primary))'
        },
        'text-secondary': {
          DEFAULT: 'hsl(var(--text-secondary))', // Bright interactive text
          foreground: 'hsl(var(--text-secondary))'
        },
        'text-accent': {
          DEFAULT: 'hsl(var(--text-accent))', // Accent text color
          foreground: 'hsl(var(--text-accent))'
        },
        'text-highlight': {
          DEFAULT: 'hsl(var(--text-highlight))', // Highlight text color
          foreground: 'hsl(var(--text-highlight))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        },
        'pulse-warm': {
          '0%, 100%': { backgroundColor: 'rgb(254, 202, 202)' },
          '50%': { backgroundColor: 'rgb(254, 226, 226)' }
        },
        'pulse-hot': {
          '0%, 100%': { backgroundColor: 'rgb(252, 165, 165)' },
          '50%': { backgroundColor: 'rgb(248, 113, 113)' }
        },
        'pulse-cold': {
          '0%, 100%': { backgroundColor: 'rgb(191, 219, 254)' },
          '50%': { backgroundColor: 'rgb(219, 234, 254)' }
        },
        'pulse-ice': {
          '0%, 100%': { backgroundColor: 'rgb(147, 197, 253)' },
          '50%': { backgroundColor: 'rgb(96, 165, 250)' }
        },
        'bounce-subtle': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        },
        'float': {
          '0%, 100%': { transform: 'translate(0, 0)' },
          '50%': { transform: 'translate(0, -10px)' }
        },
        'spin-slow': {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'pulse-warm': 'pulse-warm 2s infinite',
        'pulse-hot': 'pulse-hot 1s infinite',
        'pulse-cold': 'pulse-cold 2s infinite',
        'pulse-ice': 'pulse-ice 1s infinite',
        'bounce-subtle': 'bounce-subtle 2s infinite',
        'float': 'float 3s ease-in-out infinite',
        'spin-slow': 'spin-slow 8s linear infinite'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
