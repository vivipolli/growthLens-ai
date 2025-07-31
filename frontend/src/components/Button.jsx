import { useTheme } from '../hooks/useTheme'

const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    onClick,
    disabled = false,
    type = 'button',
    ...props
}) => {
    const { components } = useTheme()

    const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2'

    const variantClasses = {
        primary: components.button.primary + ' focus:ring-purple-500',
        secondary: components.button.secondary + ' focus:ring-gray-500',
        ghost: components.button.ghost + ' focus:ring-purple-500',
    }

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm rounded-lg',
        md: 'px-4 py-2 rounded-lg',
        lg: 'px-6 py-3 rounded-lg text-lg',
        xl: 'px-8 py-4 rounded-xl text-lg',
    }

    const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : ''

    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`

    return (
        <button
            type={type}
            className={classes}
            onClick={onClick}
            disabled={disabled}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button 