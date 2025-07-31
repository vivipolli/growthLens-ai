import { useTheme } from '../hooks/useTheme'

const StepItem = ({
    step,
    status,
    onClick,
    className = ''
}) => {
    const { status: statusStyles } = useTheme()

    const currentStatus = statusStyles[status] || statusStyles.locked

    const baseClasses = 'relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer'
    const statusClasses = `${currentStatus.bg} ${currentStatus.border}`

    const classes = `${baseClasses} ${statusClasses} ${className}`

    return (
        <div className={classes} onClick={onClick}>
            <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${currentStatus.icon}`}>
                    {status === 'completed' ? '✓' : step.icon}
                </div>
                <div className="flex-1">
                    <div className="flex items-center space-x-2">
                        <h3 className={`font-semibold ${currentStatus.text}`}>
                            {step.title}
                        </h3>
                        {step.optional && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                Optional
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">{step.subtitle}</p>
                    <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-400">⏱ {step.estimatedTime}</span>
                    </div>
                </div>
            </div>
            {status === 'active' && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            )}
        </div>
    )
}

export default StepItem 