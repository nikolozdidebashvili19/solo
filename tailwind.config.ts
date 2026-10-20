import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      screens: {
        // Side-by-side copy layout. Keep in sync with isCompactViewport() in lib/sequence.ts.
        wide: { raw: "(min-width: 768px) and (min-aspect-ratio: 9/10)" },
      },
      colors: {
        // Eyedropped from the top edge of the image sequence — keep in sync with the frames.
        void: "#010205",
        ink: "#0A0A0C",
        accent: { DEFAULT: "#C7CBD1", light: "#EEF1F5", deep: "#8E97A3" },
        platinum: "#C7CBD1",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "BlinkMacSystemFont", "SF Pro Display", "Segoe UI", "sans-serif"],
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
    },
  },
  plugins: [],
};

export default config;
