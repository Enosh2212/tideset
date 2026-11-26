import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        tide: {
          bg: "#FAFBF9",
          text: "#142325",
          muted: "#596C70",
          teal: "#087F80",
          "teal-hover": "#066A6B",
          mint: "#BEE9DE",
          surface: "#F2F6F5",
          border: "#DDE7E3",
          warm: "#F2D89B",
        },
        trust: {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          500: "#0066E5",
          600: "#0052CC",
          700: "#003D99",
          800: "#002970",
          900: "#001D4D",
        },
        slate: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
          950: "#020617",
        },
        paypal: {
          blue: "#0070BA",
          darkblue: "#003087",
          lightblue: "#009CDE",
        },
        // Legacy mappings preserved for backwards compatibility
        midnight: {
          950: "#0F172A",
          900: "#1E293B",
          800: "#334155",
          700: "#475569",
        },
        offwhite: "#0F172A", // Remapped to dark readable text in light mode
        ice: {
          100: "#0052CC",
          200: "#0066E5",
          50: "#EFF6FF",
        },
        periwinkle: {
          400: "#0052CC",
          500: "#003D99",
          300: "#2563EB",
        },
        teal: {
          500: "#059669",
          400: "#10B981",
          600: "#047857",
        },
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        "card-hover": "0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
        "card-elevated": "0 10px 15px -3px rgba(0, 0, 0, 0.08), 0 4px 6px -4px rgba(0, 0, 0, 0.04)",
        glass: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)",
        "glass-elevated": "0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        "glass-subtle": "0 1px 2px 0 rgba(0, 0, 0, 0.04)",
      },
    },
  },
  plugins: [],
};

export default config;
