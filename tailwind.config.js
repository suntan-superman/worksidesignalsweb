/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    colors: {
      // White & transparent
      white: '#ffffff',
      transparent: 'transparent',
      // Neutrals
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
      // Green color scheme for Workside Signals
      primary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e', // Primary green
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#145231',
      },
      green: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
        800: '#166534',
        900: '#145231',
      },
      emerald: {
        50: '#ecfdf5',
        600: '#059669',
      },
      teal: {
        50: '#f0fdfa',
        200: '#99f6e4',
      },
      // Severity colors for alerts
      red: {
        50: '#fef2f2',
        100: '#fee2e2',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
      },
      orange: {
        50: '#fff7ed',
        100: '#ffedd5',
        500: '#f97316',
        600: '#ea580c',
        700: '#c2410c',
        800: '#9a3412',
      },
      yellow: {
        50: '#fefce8',
        100: '#fef3c7',
        500: '#eab308',
        600: '#ca8a04',
        800: '#b45309',
      },
      amber: {
        50: '#fffbeb',
        300: '#fcd34d',
        500: '#f59e0b',
        600: '#d97706',
      },
      blue: {
        50: '#eff6ff',
        100: '#dbeafe',
        300: '#93c5fd',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
      },
      indigo: {
        50: '#eef2ff',
      },
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
    },
  },
  plugins: [],
}

