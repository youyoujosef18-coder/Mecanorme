import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}', './preview/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#14235A',
          deep: '#0C1638',
          night: '#080F26',
          soft: '#1D3070',
          line: '#24356E',
        },
        brand: {
          orange: '#F57A1C',
          amber: '#FF9440',
          ember: '#D96410',
        },
        paper: '#F4F5F8',
        steel: {
          100: '#E6E9F2',
          300: '#B9C0D4',
          500: '#7C87A6',
          700: '#4A5578',
        },
        ok: '#2FBF71',
        warn: '#E8B931',
        danger: '#E23D28',
      },
      fontFamily: {
        display: ['"Archivo Variable"', 'Archivo', 'system-ui', 'sans-serif'],
        sans: ['"Inter Variable"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        wider2: '0.18em',
        wide3: '0.32em',
      },
    },
  },
  plugins: [],
};
export default config;
