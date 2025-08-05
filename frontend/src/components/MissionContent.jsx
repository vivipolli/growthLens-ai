import React from 'react'
import { parseMissionDescription, formatConfidenceLevel } from '../utils'

/**
 * Component to display parsed mission content in a user-friendly format
 */
const MissionContent = ({ description }) => {
    if (!description) {
        return (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-gray-500 text-sm">No description available for this mission.</p>
            </div>
        )
    }

    const parsed = parseMissionDescription(description)
    const confidence = formatConfidenceLevel(parsed.confidenceLevel)

    return (
        <div className="space-y-6">
            {/* Explanation Section */}
            {parsed.explanation && (
                <div className="bg-blue-50 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2 flex items-center">
                        <span className="mr-2">💡</span>
                        Why This Mission Matters
                    </h4>
                    <p className="text-blue-700 text-sm leading-relaxed">{parsed.explanation}</p>
                </div>
            )}

            {/* Action Steps Section */}
            {parsed.actionSteps && parsed.actionSteps.length > 0 && (
                <div className="bg-green-50 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                        <span className="mr-2">✅</span>
                        Action Steps
                    </h4>
                    <ul className="space-y-2">
                        {parsed.actionSteps.map((step, index) => (
                            <li key={index} className="flex items-start text-green-800 text-sm">
                                <span className="inline-flex items-center justify-center w-5 h-5 bg-green-200 text-green-800 text-xs font-semibold rounded-full mr-3 mt-0.5 flex-shrink-0">
                                    {index + 1}
                                </span>
                                <span className="leading-relaxed text-green-700">{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Why It's Important Section */}
            {parsed.importance && (
                <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2 flex items-center">
                        <span className="mr-2">🎯</span>
                        Why It's Important
                    </h4>
                    <p className="text-purple-700 text-sm leading-relaxed">{parsed.importance}</p>
                </div>
            )}

            {/* Expected Impact & Timeline Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {parsed.expectedImpact && (
                    <div className="bg-orange-50 rounded-lg p-4">
                        <h4 className="font-semibold text-orange-900 mb-2 flex items-center">
                            <span className="mr-2">📈</span>
                            Expected Impact
                        </h4>
                        <p className="text-orange-700 text-sm leading-relaxed">{parsed.expectedImpact}</p>
                    </div>
                )}

                {parsed.timeline && (
                    <div className="bg-indigo-50 rounded-lg p-4">
                        <h4 className="font-semibold text-indigo-900 mb-2 flex items-center">
                            <span className="mr-2">⏰</span>
                            Timeline
                        </h4>
                        <p className="text-indigo-700 text-sm leading-relaxed">{parsed.timeline}</p>
                    </div>
                )}
            </div>

            {/* Confidence Level */}
            {parsed.confidenceLevel && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                            <span className="mr-2">🎓</span>
                            AI Confidence Level
                        </h4>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${confidence.bgColor} ${confidence.color}`}>
                            {confidence.text}
                        </span>
                    </div>
                    <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                style={{ width: `${parsed.confidenceLevel}%` }}
                            ></div>
                        </div>
                    </div>
                </div>
            )}

            {/* Fallback to cleaned text if no parsing was successful */}
            {!parsed.explanation && !parsed.actionSteps.length && !parsed.importance && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-2">Mission Details</h4>
                    <div className="text-white text-sm leading-relaxed">
                        {parsed.originalText.replace(/\*\*/g, '').replace(/- /g, '• ').trim()}
                    </div>
                </div>
            )}
        </div>
    )
}

export default MissionContent