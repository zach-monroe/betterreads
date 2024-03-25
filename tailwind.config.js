/** @type {import('tailwindcss').Config} */
export default {
  content: ["./views/**/*.{html,js,ejs}"],
  theme: {
    screens: {
      sm: "480px",
      md: "768px",
      lg: "976px",
      xl: "1440px",
    },
    container: {
      center: true,
    },
    extend: {},
  },
  plugins: [],
};
