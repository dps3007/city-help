export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary: Indigo/Blue
        primary: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c3d66",
          950: "#051e3e",
        },
        // Accent: Cyan
        accent: {
          50: "#ecfdfd",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
          950: "#0c2d3a",
        },
        // Semantic colors
        background: "#ffffff",
        foreground: "#0f172a",
        card: "#f8fafc",
        "card-foreground": "#0f172a",
        muted: "#e2e8f0",
        "muted-foreground": "#64748b",
        border: "#e2e8f0",
      },
      fontFamily: {
        sans: ["Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "sans-serif"],
        mono: ["Fira Code", "Courier New", "monospace"],
      },
      spacing: {
        "safe-top": "var(--safe-area-inset-top)",
        "safe-bottom": "var(--safe-area-inset-bottom)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      boxShadow: {
        sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
        xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in",
        "slide-in": "slideIn 0.3s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
