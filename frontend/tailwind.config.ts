import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: { DEFAULT: '#6f4e37', dark: '#4a3424', light: '#f3ebe4' },
      },
    },
  },
  plugins: [],
};

export default config;
