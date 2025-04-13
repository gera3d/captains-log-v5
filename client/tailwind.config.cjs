/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Avenir', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        'brand-gradient-start': '#311B92',
        'brand-gradient-end': '#0D47A1',
        'brand-primary-text': '#FFFFFF',
        'brand-accent-yellow': '#FFD600',
        'brand-button-text': '#1A237E',
        'brand-link': '#81D4FA',
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(90deg, #311B92 0%, #0D47A1 100%)',
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
    require('@tailwindcss/typography'),
  ],
}
