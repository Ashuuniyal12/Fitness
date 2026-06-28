/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        yellow: {
          300: "hsl(var(--brand-accent-light) / <alpha-value>)",
          400: "hsl(var(--brand-accent) / <alpha-value>)",
          500: "hsl(var(--brand-accent-dark) / <alpha-value>)",
        }
      },
    },
  },
  plugins: [],
};
