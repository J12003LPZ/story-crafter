/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#131313',
        surface: '#131313',
        'surface-container-lowest': '#0e0e0e',
        'surface-container-low': '#1c1b1b',
        'surface-container': '#201f1f',
        'surface-container-high': '#2a2a2a',
        'surface-container-highest': '#353534',
        'surface-variant': '#353534',
        'on-surface': '#e5e2e1',
        'on-surface-variant': '#c2c6d8',
        'on-background': '#e5e2e1',
        primary: '#b0c6ff',
        'on-primary': '#002d6f',
        'primary-container': '#568dff',
        'on-primary-container': '#002661',
        secondary: '#bdf4ff',
        'secondary-container': '#00e3fd',
        outline: '#8c90a1',
      },
      fontFamily: {
        ui: ['Geist', 'system-ui', 'sans-serif'],
        story: ['Literata', 'Georgia', 'serif'],
      },
      fontSize: {
        'display-lg': ['48px', { lineHeight: '56px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['32px', { lineHeight: '40px', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '32px', fontWeight: '500' }],
        'story-lg': ['20px', { lineHeight: '34px', fontWeight: '400' }],
        'story-md': ['16px', { lineHeight: '28px', fontWeight: '400' }],
        'ui-lg': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '600' }],
        'ui-md': ['12px', { lineHeight: '16px', fontWeight: '500' }],
      },
      borderRadius: { DEFAULT: '0.25rem', lg: '0.5rem', xl: '0.75rem', '2xl': '1rem' },
    },
  },
  plugins: [],
};
