import { useMemo } from 'react'
import { theme, colors } from '../theme/colors'

export const useTheme = () => {
  const themeUtils = useMemo(() => ({
    // Color utilities
    colors,
    
    // Gradient utilities - Dark theme
    gradients: {
      primary: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      secondary: 'bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500',
      background: 'bg-gradient-to-br from-gray-900 via-blue-900 to-black',
      card: 'bg-gradient-to-r from-gray-800 to-gray-900',
    },
    
    // Status utilities - Dark theme
    status: {
      active: {
        bg: 'bg-blue-900/20',
        border: 'border-blue-400',
        text: 'text-blue-300',
        icon: 'bg-blue-500 text-white',
      },
      completed: {
        bg: 'bg-green-900/20',
        border: 'border-green-400',
        text: 'text-green-300',
        icon: 'bg-green-500 text-white',
      },
      locked: {
        bg: 'bg-gray-800/20',
        border: 'border-gray-600',
        text: 'text-gray-400',
        icon: 'bg-gray-600 text-gray-300',
      },
    },
    
    // Component styles - Dark theme
    components: {
      card: 'bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-blue-400/20',
      button: {
        primary: 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg',
        secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-200 font-semibold transition-colors',
        ghost: 'bg-transparent hover:bg-blue-900/20 text-blue-300 transition-colors',
      },
      header: 'bg-gray-800/80 backdrop-blur-sm border-b border-blue-400/20',
    },
    
    // Spacing utilities
    spacing: theme.spacing,
    
    // Border radius utilities
    borderRadius: theme.borderRadius,
    
    // Shadow utilities
    shadows: theme.shadows,
  }), [])

  return themeUtils
} 