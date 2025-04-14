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
      padding: "2rem",
      screens: {
        "2xl": "1400px"
      }
    },
    extend: {
      colors: {
        border: 'hsl(0 0% 20%)', // Dark border
        input: 'hsl(0 0% 20%)', // Dark input
        ring: 'hsl(0 0% 70%)', // Lighter ring
        background: 'hsl(0 0% 95%)', // Light background
        foreground: 'hsl(0 0% 10%)', // Almost black text
        primary: {
          DEFAULT: 'hsl(263 70% 50%)', // Bright purple
          foreground: 'hsl(0 0% 10%)' // Black text
        },
        secondary: {
          DEFAULT: 'hsl(198 93% 55%)', // Bright blue
          foreground: 'hsl(0 0% 10%)' // Black text
        },
        destructive: {
          DEFAULT: 'hsl(0 62.8% 50%)', // Destructive color
          foreground: 'hsl(0 0% 10%)' // Black text
        },
        muted: {
          DEFAULT: 'hsl(0 0% 90%)', // Light muted background
          foreground: 'hsl(0 0% 30%)' // Dark muted text
        },
        accent: {
          DEFAULT: 'hsl(263 70% 50%)', // Purple accent
          foreground: 'hsl(0 0% 10%)' // Black text
        },
        popover: {
          DEFAULT: 'hsl(0 0% 100%)', // White popover
          foreground: 'hsl(0 0% 10%)' // Black text
        },
        card: {
          DEFAULT: 'hsl(0 0% 100%)', // White card background
          foreground: 'hsl(0 0% 10%)' // Black text
        }
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)"
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
