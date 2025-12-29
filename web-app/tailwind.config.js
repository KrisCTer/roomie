/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  theme: {
    extend: {
      colors: {
        // Light mode colors
        background: {
          light: '#ffffff',
          dark: '#0f1419', // Darker, richer base
        },
        foreground: {
          light: '#0f172a',
          dark: '#e8edf3', // Softer white
        },
        
        // Enhanced dark mode palette with better contrast and readability
        dark: {
          // Background shades - warmer tones
          50: '#f8f9fa',
          100: '#f1f3f5',
          200: '#e9ecef',
          300: '#dee2e6',
          400: '#ced4da',
          500: '#adb5bd',
          600: '#6c757d',
          700: '#495057',
          800: '#212529', // Main background
          850: '#1a1d23', // Card background
          900: '#0f1419', // Deep background
          950: '#0a0d11', // Deepest shade
        },
        
        // Accent colors for dark mode
        accent: {
          blue: {
            light: '#60a5fa',
            DEFAULT: '#3b82f6',
            dark: '#2563eb',
          },
          purple: {
            light: '#a78bfa',
            DEFAULT: '#8b5cf6',
            dark: '#7c3aed',
          },
          emerald: {
            light: '#34d399',
            DEFAULT: '#10b981',
            dark: '#059669',
          },
          amber: {
            light: '#fbbf24',
            DEFAULT: '#f59e0b',
            dark: '#d97706',
          },
        }
      },
      
      backgroundColor: {
        // Primary backgrounds
        'dark-primary': '#0f1419',      // Main app background
        'dark-secondary': '#1a1d23',    // Cards, modals
        'dark-tertiary': '#212529',     // Elevated elements
        'dark-quaternary': '#2d3139',   // Hover states
        
        // Interactive elements
        'dark-hover': 'rgba(255, 255, 255, 0.05)',
        'dark-active': 'rgba(255, 255, 255, 0.1)',
        'dark-selected': 'rgba(59, 130, 246, 0.15)',
      },
      
      textColor: {
        // Text hierarchy
        'dark-primary': '#e8edf3',      // Main text
        'dark-secondary': '#b8c1cc',    // Secondary text
        'dark-tertiary': '#8b95a5',     // Muted text
        'dark-quaternary': '#6c757d',   // Disabled text
        
        // Semantic colors
        'dark-success': '#34d399',
        'dark-warning': '#fbbf24',
        'dark-error': '#f87171',
        'dark-info': '#60a5fa',
      },
      
      borderColor: {
        'dark-primary': '#2d3139',      // Main borders
        'dark-secondary': '#212529',    // Subtle borders
        'dark-tertiary': '#1a1d23',     // Very subtle
        'dark-focus': '#3b82f6',        // Focus rings
      },
      
      // Shadows for dark mode
      boxShadow: {
        'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        'dark': '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
        'dark-md': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4)',
        'dark-2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        'dark-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
      },
      
      // Gradients
      backgroundImage: {
        'dark-gradient-1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'dark-gradient-2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'dark-gradient-3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'dark-gradient-subtle': 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
      },
      
      // Ring colors for focus states
      ringColor: {
        'dark-focus': '#3b82f6',
      },
      
      // Divider colors
      divideColor: {
        'dark': '#2d3139',
      },
    },
  },
  plugins: [
    // Optional: Add plugin for automatic dark mode utilities
    function({ addUtilities }) {
      const darkModeUtilities = {
        '.dark-scrollbar': {
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#1a1d23',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#2d3139',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#3d4149',
          },
        },
        '.dark-glass': {
          backgroundColor: 'rgba(26, 29, 35, 0.7)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        },
        '.dark-card': {
          backgroundColor: '#1a1d23',
          borderRadius: '0.75rem',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
        },
        '.dark-input': {
          backgroundColor: '#212529',
          borderColor: '#2d3139',
          color: '#e8edf3',
          '&:focus': {
            borderColor: '#3b82f6',
            outline: 'none',
            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
          },
          '&::placeholder': {
            color: '#6c757d',
          },
        },
      }
      addUtilities(darkModeUtilities)
    }
  ],
}