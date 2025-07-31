import React from 'react'

export const MissionLoadingSkeleton = ({ count = 3 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }, (_, i) => (
            <div key={i} className="p-4 rounded-xl border-2 border-gray-200 animate-pulse">
                <div className="flex items-center space-x-3 mb-2">
                    <div className="w-6 h-6 bg-gray-300 rounded"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </div>
                <div className="h-3 bg-gray-300 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
        ))}
    </div>
)

export const GoalsLoadingSkeleton = ({ count = 3 }) => (
    <div className="space-y-6">
        {Array.from({ length: count }, (_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-300 rounded w-16"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-300 h-2 rounded-full w-1/2"></div>
                </div>
            </div>
        ))}
    </div>
)

export const InsightsLoadingSkeleton = ({ count = 3 }) => (
    <div className="space-y-4">
        {Array.from({ length: count }, (_, i) => (
            <div key={i} className="p-4 rounded-lg border-l-4 border-gray-300 bg-gray-50 animate-pulse">
                <div className="flex items-start space-x-3">
                    <div className="w-5 h-5 bg-gray-300 rounded"></div>
                    <div className="flex-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
)

export const GenericLoadingSkeleton = ({
    count = 3,
    className = "",
    itemClassName = "",
    children
}) => (
    <div className={`space-y-4 ${className}`}>
        {Array.from({ length: count }, (_, i) => (
            <div key={i} className={`animate-pulse ${itemClassName}`}>
                {children || (
                    <>
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-full mb-1"></div>
                        <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                    </>
                )}
            </div>
        ))}
    </div>
) 