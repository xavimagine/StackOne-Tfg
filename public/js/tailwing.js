tailwind.config = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED", // A deep purple similar to the logo in screenshot
        "background-light": "#F3F4F6", // Light gray background
        "background-dark": "#111827", // Dark gray/almost black background
        "card-light": "#FFFFFF",
        "card-dark": "#1F2937",
        "accent-brown": "#7f5550", // Matching the brown tone from the screenshot header background
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.75rem",
      },
    },
  },
};
