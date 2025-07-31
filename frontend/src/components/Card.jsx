import { useTheme } from '../hooks/useTheme'

const Card = ({
    children,
    className = '',
    padding = 'lg',
    variant = 'default',
    ...props
}) => {
    const { components } = useTheme()

    const baseClasses = components.card

    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        xl: 'p-10',
    }

    const variantClasses = {
        default: '',
        glass: 'bg-white/60 backdrop-blur-md',
        gradient: 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200',
    }

    const classes = `${baseClasses} ${paddingClasses[padding]} ${variantClasses[variant]} ${className}`

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    )
}

export default Card 