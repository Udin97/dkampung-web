/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        charcoal:  "#0C1710",
        forest:    "#1B4332",
        forest2:   "#2D6A4F",
        sage:      "#52796F",
        leaf:      "#74C69D",
        brown:     "#5C3317",
        brown2:    "#8B5E3C",
        gold:      "#C9A84C",
        gold2:     "#E8C76D",
        terra:     "#B5541C",
        cream:     "#FEF9F0",
        cream2:    "#F5E6C8",
        stone:     "#FDFAF5",
        parchment: "#EDD9A3",
        ink:       "#1A1008",
        muted:     "#6B5744",
      },
      fontFamily: {
        fraunces: ["Fraunces", "serif"],
        jost:     ["Jost", "sans-serif"],
        playfair: ["Playfair Display", "serif"],
      },
    },
  },
  plugins: [],
};
