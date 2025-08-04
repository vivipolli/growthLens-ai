export const colors = {
  // Primary gradient colors - Neon Blue
  primary: {
    50: '#00f5ff',
    100: '#00e6ff',
    200: '#00d4ff',
    300: '#00c2ff',
    400: '#00b0ff',
    500: '#0099ff',
    600: '#0080ff',
    700: '#0066ff',
    800: '#004dff',
    900: '#0033ff',
  },
  
  // Secondary gradient colors - Dark Blue
  secondary: {
    50: '#001a33',
    100: '#00264d',
    200: '#003366',
    300: '#004080',
    400: '#004d99',
    500: '#0059b3',
    600: '#0066cc',
    700: '#0073e6',
    800: '#0080ff',
    900: '#008cff',
  },

  // Accent colors - Neon variants
  accent: {
    purple: '#8b00ff',
    pink: '#ff00ff',
    indigo: '#4d00ff',
    blue: '#00ffff',
  },

  // Status colors - Dark theme
  status: {
    success: {
      50: '#00ff41',
      100: '#00e639',
      200: '#00cc31',
      300: '#00b329',
      400: '#009921',
      500: '#008019',
      600: '#006611',
      700: '#004d09',
      800: '#003301',
      900: '#001a00',
    },
    warning: {
      50: '#ffff00',
      100: '#e6e600',
      200: '#cccc00',
      300: '#b3b300',
      400: '#999900',
      500: '#808000',
      600: '#666600',
      700: '#4d4d00',
      800: '#333300',
      900: '#1a1a00',
    },
    error: {
      50: '#ff0040',
      100: '#e60039',
      200: '#cc0033',
      300: '#b3002d',
      400: '#990026',
      500: '#800020',
      600: '#66001a',
      700: '#4d0013',
      800: '#33000d',
      900: '#1a0006',
    },
  },

  // Neutral colors - Dark theme
  neutral: {
    50: '#0a0a0a',
    100: '#1a1a1a',
    200: '#2a2a2a',
    300: '#3a3a3a',
    400: '#4a4a4a',
    500: '#5a5a5a',
    600: '#6a6a6a',
    700: '#7a7a7a',
    800: '#8a8a8a',
    900: '#9a9a9a',
  },

  // Background gradients - Dark theme
  gradients: {
    primary: 'from-blue-500 to-cyan-500',
    secondary: 'from-indigo-500 via-blue-500 to-cyan-500',
    background: 'from-gray-900 via-blue-900 to-black',
    card: 'from-gray-800 to-gray-900',
  },
}

export const theme = {
  colors,
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  },
} 