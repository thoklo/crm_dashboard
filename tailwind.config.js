/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        "muted-foreground": "var(--muted-foreground)",
        border: "var(--border)",
        muted: "#f8f9fa",
        accent: "#f1f3f4",
        "accent-foreground": "#1f2937",
        ring: "var(--primary)",
        destructive: "#dc2626",
        input: "#e5e7eb",
        popover: "var(--card)",
        "popover-foreground": "var(--card-foreground)",
        secondary: "#f3f4f6",
        "secondary-foreground": "#111827",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;