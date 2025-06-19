/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // Enable dark mode using class strategy
  content: [
    "./app/templates/**/*.html",
    "./app/static/**/*.js",
    // Add other template paths if needed
  ],
  theme: {
    extend: {
      colors: {
        // Add any custom colors here
      },
    },
  },
  plugins: [],
}
