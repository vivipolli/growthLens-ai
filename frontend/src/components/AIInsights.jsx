import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { Card, Button } from './index'

const AIInsights = () => {
    const [insights, setInsights] = useState([
        {
            id: 1,
            type: "performance",
            title: "Content Performance Alert",
            content: "Your video content performs 40% better than images. Consider creating more video content this week.",
            priority: "high",
            category: "content",
            action: "Create video content",
            impact: "+25% engagement",
            confidence: 92
        },
        {
            id: 2,
            type: "opportunity",
            title: "Trending Topic Alert",
            content: "#DigitalMarketing is trending in your niche. Great opportunity to create relevant content!",
            priority: "medium",
            category: "trending",
            action: "Create trending content",
            impact: "+15% reach",
            confidence: 78
        },
        {
            id: 3,
            type: "reminder",
            title: "Weekly Review Due",
            content: "Don't forget to review your weekly metrics and adjust your strategy accordingly.",
            priority: "low",
            category: "planning",
            action: "Review metrics",
            impact: "Better decisions",
            confidence: 95
        },
        {
            id: 4,
            type: "warning",
            title: "Engagement Rate Dropping",
            content: "Your engagement rate has decreased by 12% this week. Consider posting at optimal times.",
            priority: "high",
            category: "analytics",
            action: "Optimize posting schedule",
            impact: "+18% engagement",
            confidence: 85
        },
        {
            id: 5,
            type: "success",
            title: "Goal Achievement",
            content: "Congratulations! You've reached 80% of your monthly follower growth goal.",
            priority: "medium",
            category: "milestone",
            action: "Celebrate & plan next goal",
            impact: "Motivation boost",
            confidence: 100
        }
    ])

    const [activeFilter, setActiveFilter] = useState('all')

    const getInsightIcon = (type) => {
        const icons = {
            performance: '📈',
            opportunity: '🎯',
            reminder: '⏰',
            warning: '⚠️',
            success: '🎉',
            trend: '🔥'
        }
        return icons[type] || '💡'
    }

    const getPriorityColor = (priority) => {
        const colors = {
            high: 'border-red-400 bg-red-50',
            medium: 'border-yellow-400 bg-yellow-50',
            low: 'border-blue-400 bg-blue-50'
        }
        return colors[priority] || 'border-gray-400 bg-gray-50'
    }

    const getCategoryColor = (category) => {
        const colors = {
            content: 'from-purple-500 to-pink-500',
            trending: 'from-orange-500 to-red-500',
            planning: 'from-blue-500 to-cyan-500',
            analytics: 'from-green-500 to-emerald-500',
            milestone: 'from-indigo-500 to-purple-500'
        }
        return colors[category] || 'from-gray-500 to-slate-500'
    }

    const filteredInsights = activeFilter === 'all'
        ? insights
        : insights.filter(insightGroup =>
            insightGroup.insights && insightGroup.insights.some(insight => insight.priority === activeFilter)
        ).map(insightGroup => ({
            ...insightGroup,
            insights: insightGroup.insights.filter(insight => insight.priority === activeFilter)
        }))

    const handleInsightAction = (insightId) => {
        console.log('Taking action on insight:', insightId)
    }

    const handleDismissInsight = (insightId) => {
        setInsights(prev => prev.filter(insight => insight.id !== insightId))
    }

    return (
        <Card>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Business Observations</h2>
                    <p className="text-sm text-gray-600">Strategic insights and recommendations for your business</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">
                        {insights.reduce((total, group) => total + (group.insights?.length || 0), 0)}
                    </div>
                    <div className="text-sm text-gray-500">observations</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex space-x-1 bg-white/50 rounded-xl p-1 mb-6">
                {['all', 'high', 'medium', 'low'].map((filter) => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeFilter === filter
                            ? 'bg-white text-purple-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {filteredInsights.map((insightGroup, groupIndex) => (
                    <div key={groupIndex} className="space-y-3">
                        {/* Summary and personalized message */}
                        {insightGroup.summary && (
                            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-800 font-medium">{insightGroup.summary}</p>
                                {insightGroup.personalizedMessage && (
                                    <p className="text-xs text-blue-600 mt-1">{insightGroup.personalizedMessage}</p>
                                )}
                            </div>
                        )}

                        {/* Individual insights */}
                        {insightGroup.insights && insightGroup.insights.map((insight, insightIndex) => (
                            <div
                                key={`${groupIndex}-${insightIndex}`}
                                className={`p-4 rounded-lg border-l-4 ${getPriorityColor(insight.priority)}`}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className={`w-10 h-10 bg-gradient-to-r ${getCategoryColor(insight.category)} rounded-lg flex items-center justify-center text-white text-lg`}>
                                        {getInsightIcon(insight.type)}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                                                <p className="text-sm text-gray-700 mt-1">{insight.content}</p>
                                            </div>
                                            <button
                                                onClick={() => handleDismissInsight(insight.id)}
                                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                            >
                                                ✕
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500">Impact:</span>
                                                    <span className="text-xs font-medium text-green-600">{insight.impact}</span>
                                                </div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500">Confidence:</span>
                                                    <span className="text-xs font-medium text-purple-600">{insight.confidence}%</span>
                                                </div>
                                            </div>

                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={() => handleInsightAction(insight.id)}
                                            >
                                                {insight.action}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Next steps */}
                        {insightGroup.nextSteps && insightGroup.nextSteps.length > 0 && (
                            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                                <h4 className="text-sm font-medium text-green-800 mb-2">Next Steps:</h4>
                                <ul className="text-xs text-green-700 space-y-1">
                                    {insightGroup.nextSteps.map((step, stepIndex) => (
                                        <li key={stepIndex} className="flex items-center">
                                            <span className="mr-2">•</span>
                                            {step}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* AI Learning Section */}
            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900">🤖 AI Learning</h3>
                        <p className="text-sm text-gray-600">Your AI mentor is getting smarter about your business</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">87%</div>
                        <div className="text-sm text-gray-500">accuracy</div>
                    </div>
                </div>
                <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                            style={{ width: '87%' }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Learning Progress</span>
                        <span>87%</span>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default AIInsights 