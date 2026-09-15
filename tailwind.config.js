/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        page: "var(--page)",
        surface: "var(--surface)",
        surface2: "var(--surface-2)",
        ink: "var(--ink)",
        ink2: "var(--ink-2)",
        muted: "var(--ink-muted)",
        grid: "var(--grid)",
        axis: "var(--axis)",
        hairline: "var(--hairline)",
        brand: {
          DEFAULT: "var(--brand)",
          ink: "var(--brand-ink)",
          soft: "var(--brand-soft)",
        },
        seqA: "var(--seq-a)",
        seqB: "var(--seq-b)",
        good: "var(--st-good)",
        warning: "var(--st-warning)",
        serious: "var(--st-serious)",
        critical: "var(--st-critical)",
      },
      borderColor: { DEFAULT: "var(--hairline)" },
      maxWidth: { content: "1200px" },
    },
  },
  plugins: [],
};
