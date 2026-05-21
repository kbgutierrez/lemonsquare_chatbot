/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        background: '#08110f',
        panel: '#101816',
        'panel-light': '#15211d',
        border: '#25332d',
        'text-primary': '#ffffff',
        'text-secondary': '#8ea59b',
        accent: '#f5d547',
        'accent-green': '#95c11f',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        lg: '0 20px 80px rgba(0, 0, 0, 0.45)',
      },
    },
  },
  plugins: [],
}
