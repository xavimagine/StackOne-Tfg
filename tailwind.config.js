/** @type {import('tailwindcss').Config} */
export default {
    content: ["./public/**/*.html", "./public/**/*.js"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                primary: "#7C3AED",
                "background-light": "#F3F4F6",
                "background-dark": "#111827",
                "card-light": "#FFFFFF",
                "card-dark": "#1F2937",
                "accent-brown": "#7f5550",
            },
            fontFamily: {
                sans: ["Inter", "sans-serif"],
            },
            borderRadius: {
                DEFAULT: "0.75rem",
            },
        },
    },
    plugins: [],
};
