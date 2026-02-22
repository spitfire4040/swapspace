import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: '#FF4458',
          blue: '#2979FF',
        },
      },
    },
  },
  plugins: [],
};

export default config;
