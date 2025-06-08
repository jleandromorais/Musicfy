/** @type {import('tailwindcss').Config} */
export default { // Use export default para Vite
  content: [
    "./index.html", // Adicione se seu index.html tiver classes Tailwind
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      // ... outras cores personalizadas
    },
  },
  plugins: [],
}