/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["ui-sans-serif", "system-ui", "Segoe UI", "Inter", "Roboto", "Arial", "sans-serif"]
      },
      boxShadow: {
        "soft-lg": "0 16px 50px rgba(0,0,0,.35)",
        glass: "0 10px 30px rgba(0,0,0,.28)"
      },
      borderRadius: {
        "2.5xl": "1.35rem"
      },
      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-60%)" },
          "100%": { transform: "translateX(60%)" }
        }
      },
      animation: {
        shimmer: "shimmer 1.35s ease-in-out infinite"
      }
    }
  },
  plugins: []
};

