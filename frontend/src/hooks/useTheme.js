import { useMemo } from 'react'
import { theme, colors } from '../theme/colors'

export const useTheme = () => {
  const themeUtils = useMemo(() => ({
    // Color utilities
    colors,
    
    // Gradient utilities
    gradients: {
      primary: 'bg-gradient-to-r from-purple-500 to-pink-500',
      secondary: 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
      background: 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50',
      card: 'bg-gradient-to-r from-purple-50 to-pink-50',
    },
    
    // Status utilities
    status: {
      active: {
        bg: 'bg-purple-50',
        border: 'border-purple-300',
        text: 'text-purple-800',
        icon: 'bg-purple-500 text-white',
      },
      completed: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        icon: 'bg-green-500 text-white',
      },
      locked: {
        bg: 'bg-gray-50',
        border: 'border-gray-200',
        text: 'text-gray-600',
        icon: 'bg-gray-300 text-gray-600',
      },
    },
    
    // Component styles
    components: {
      card: 'bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20',
      button: {
        primary: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg',
        secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition-colors',
        ghost: 'bg-transparent hover:bg-white/20 text-gray-700 transition-colors',
      },
      header: 'bg-white/80 backdrop-blur-sm border-b border-white/20',
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