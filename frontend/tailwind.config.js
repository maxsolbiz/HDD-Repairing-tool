// tailwind.config.js
module.exports = {
  darkMode: 'class',
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        themeBlue: '#2563eb',
        themeGreen: '#16a34a',
        themePurple: '#7c3aed',
      },
    },
  },
  plugins: [],
};
