/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sansExo: ["Exo"],
      },
      backgroundImage: {
        domain: "url('https://tenmien.vn/themes/img/background-hp.jpg')",
      },
      colors: {
        customBlue: "#133c8b",
        customOrange: "#F37032",
      },
    },
  },
  plugins: [],
};
