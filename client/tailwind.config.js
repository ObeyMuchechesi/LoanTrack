export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff', 100: '#d9eaff', 200: '#bcdaff', 300: '#8ebfff',
          400: '#5a9bff', 500: '#2563eb', 600: '#1d4ed8', 700: '#1e40af', 800: '#1e3a8a', 900: '#172554',
        },
      },
      fontFamily: { sans: ['Inter', 'system-ui', 'sans-serif'] },
    },
  },
  plugins: [],
};
