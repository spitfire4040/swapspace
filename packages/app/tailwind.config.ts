import type { Config } from 'tailwindcss';
import plugin from 'tailwindcss/plugin';

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
      spacing: {
        'safe-top': 'var(--sat)',
        'safe-bottom': 'var(--sab)',
        'safe-left': 'var(--sal)',
        'safe-right': 'var(--sar)',
        'header': 'var(--header-h)',
        'tab-bar': 'var(--tab-bar-h)',
        'tab-bar-total': 'var(--tab-bar-total)',
      },
    },
  },
  plugins: [
    plugin(({ addUtilities }) => {
      addUtilities({
        '.pt-safe': { paddingTop: 'var(--sat)' },
        '.pb-safe': { paddingBottom: 'var(--sab)' },
        '.pl-safe': { paddingLeft: 'var(--sal)' },
        '.pr-safe': { paddingRight: 'var(--sar)' },
      });
    }),
  ],
};

export default config;
