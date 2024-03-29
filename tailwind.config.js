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
    extend: {
      colors: {
        sumiInk: "#1F1F28",
        samuraiRed: "#E82424",
        roninYellow: "#FF9E3B",
        oldWhite: "#e9e4d3",
        notGray: "#c8c093",
      },
      fontFamily: {
        deca: ["Lexend Deca"],
        moda: ["Bodoni Moda"],
        tenor: ["Tenor Sans"],
      },
    },
  },
  plugins: [],
};
