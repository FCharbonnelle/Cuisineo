/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Si vous utilisez le App Router plus tard
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // Étendre avec les couleurs primaires de Cuisineo comme spécifié dans le guide
      colors: {
        primary: {
          DEFAULT: '#F97316', // orange-500
          light: '#FB923C', // orange-400
          dark: '#EA580C',  // orange-600
        }
      }
    },
  },
  plugins: [],
} 