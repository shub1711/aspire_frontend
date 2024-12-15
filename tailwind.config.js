/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",           // This includes the root index.html
    "./src/**/*.{js,ts,jsx,tsx}", // This scans all files in the `src` directory
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
