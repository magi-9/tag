/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2b2d42',
          dark: '#1a1b2e',
          light: '#3d4059'
        },
        accent: {
          DEFAULT: '#f28d35',
          dark: '#d97625',
          light: '#f5a963'
        },
        background: {
          DEFAULT: '#f4f7f6',
          card: '#ffffff',
          hover: '#e0e4e8'
        },
        highlight: '#ff6b6b',
        success: '#51cf66',
        warning: '#ffd43b',
        error: '#ff6b6b'
      },
      fontFamily: {
        sans: ['Roboto', 'system-ui', 'sans-serif']
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  plugins: [],
}
