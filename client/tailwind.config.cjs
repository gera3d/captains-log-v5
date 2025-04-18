/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: '1rem',
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px',
      },
    },
    extend: {
      fontFamily: {
        display: ['Poppins', 'Inter', 'ui-sans-serif', 'system-ui'],
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      fontSize: {
        'h1': ['3rem', { lineHeight: '1.1' }],
        'h2': ['2.5rem', { lineHeight: '1.2' }],
        'h3': ['2rem', { lineHeight: '1.3' }],
        'h4': ['1.5rem', { lineHeight: '1.4' }],
        'h5': ['1.25rem', { lineHeight: '1.5' }],
        'h6': ['1rem', { lineHeight: '1.6' }],
      },
      colors: {
        primary: '#311B92',
        secondary: '#0D47A1',
        accent: '#FFD600',
        'primary-text': '#FFFFFF',
        'link': '#81D4FA',
        neutral: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(90deg, #311B92 0%, #0D47A1 100%)',
      },
      keyframes: {
        'mic-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(129, 212, 250, 0.7)' },
          '50%': { boxShadow: '0 0 40px 10px rgba(129, 212, 250, 0.9)' },
        },
        'wave-bounce': {
          '0%, 100%': { transform: 'scaleY(1)' },
          '50%': { transform: 'scaleY(2.2)' },
        },
        'listening-dots': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.3' },
        },
      },
      animation: {
        'mic-glow': 'mic-glow 1.2s infinite ease-in-out',
        'wave-bounce': 'wave-bounce 1s infinite ease-in-out',
        'listening-dots': 'listening-dots 1s infinite steps(3, jump-none)',
      },
    },
  },
  plugins: [
    require('daisyui'),
    require('@tailwindcss/typography'),
  ],
  daisyui: {
    themes: ['light', 'dark'],
    base: true,
    styled: true,
    utils: true,
  },
}
