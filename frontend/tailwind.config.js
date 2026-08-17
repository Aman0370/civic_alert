/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#0B1220',
          surface: '#131B2C',
          raised: '#1B2740',
          border: '#263352',
        },
        text: {
          primary: '#E8ECF1',
          muted: '#8B96AC',
          faint: '#5B6684',
        },
        severity: {
          low: '#4C8DFF',
          medium: '#F5A623',
          high: '#FF7A45',
          critical: '#E4483C',
        },
        verified: '#2DD4BF',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['"Inter"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 8px 24px -12px rgba(0,0,0,0.6)',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(0.6)', opacity: '0.7' },
          '100%': { transform: 'scale(1)', opacity: '0' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 2s cubic-bezier(0,0,0.2,1) infinite',
      },
    },
  },
  plugins: [],
};
