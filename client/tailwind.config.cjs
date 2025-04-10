/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  // Removed DaisyUI themes to avoid conflicts, use Tailwind default light mode
  plugins: [
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
}
