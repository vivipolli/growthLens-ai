import { useState, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useDailyMissions } from '../hooks/useDailyMissions'
import {
    Card,
    Button,
    MissionLoadingSkeleton,
    GoalsLoadingSkeleton,
    InsightsLoadingSkeleton,
    MissionEmptyState,
    GoalsEmptyState,
    InsightsEmptyState
} from './index'
import { saveUserProfile } from '../utils/userProfile.js'

const Dashboard = ({ personalData, businessData, onBackToJourney, onEditPersonal, onEditBusiness }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const { gradients } = useTheme()

    const {
        missions,
        weeklyGoals,
        aiInsights,
        loading,
        error,
        lastGenerated,
        hasAttemptedLoad,
        completeMission,
        updateGoalProgress,
        generateAIMissions,
        refreshMissions,
        clearCache,
        getCompletedMissionsCount,
        getTotalMissionsCount
    } = useDailyMissions()

    useEffect(() => {
        if (personalData && businessData) {
            const userProfile = {
                personal: personalData,
                business: businessData
            }

            saveUserProfile(userProfile)

            if (!lastGenerated || !missions.length) {
                console.log('🚀 Dashboard: Triggering initial AI mission generation');
                generateAIMissions()
            }
        }
    }, [personalData, businessData, generateAIMissions, lastGenerated, missions.length])


    const handleMissionComplete = (missionId) => {
        completeMission(missionId)
    }

    const handleGoalUpdate = (goalId) => {
        console.log('Goal updated:', goalId)
    }

    const getTypeIcon = (type) => {
        const icons = {
            'social': '📱',
            'content': '✍️',
            'analytics': '📊',
            'strategy': '🎯',
            'growth': '📈'
        }
        return icons[type] || '✨'
    }

    const getInsightIcon = (type) => {
        const icons = {
            'tip': '💡',
            'opportunity': '🎯',
            'reminder': '⏰',
            'warning': '⚠️'
        }
        return icons[type] || '💡'
    }

    const getPriorityColor = (priority) => {
        const colors = {
            'high': 'border-red-400 bg-red-50',
            'medium': 'border-yellow-400 bg-yellow-50',
            'low': 'border-blue-400 bg-blue-50'
        }
        return colors[priority] || 'border-gray-400 bg-gray-50'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Missions & Goals */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Daily Missions */}
                        <Card>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <h2 className="text-xl font-bold text-gray-900">Daily Missions</h2>
                                    {personalData?.name && (
                                        <span className="text-sm text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                            Personalized for {personalData.name}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-3">
                                    <span className="text-sm text-gray-500">
                                        {getCompletedMissionsCount()}/{getTotalMissionsCount()} completed
                                    </span>
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => {
                                            console.log('🖱️ Refresh button clicked');
                                            refreshMissions();
                                        }}
                                        disabled={loading}
                                    >
                                        {loading ? '🔄' : '✨'} {loading ? 'Generating...' : 'Refresh'}
                                    </Button>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-orange-100 border border-orange-300 rounded-lg text-orange-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {loading && (
                                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                    <div className="flex items-center space-x-3">
                                        <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                        <span className="text-blue-700">🤖 AI is generating personalized missions based on your profile...</span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                {loading || (!hasAttemptedLoad && missions.length === 0) ? (
                                    <MissionLoadingSkeleton />
                                ) : missions.length === 0 ? (
                                    <MissionEmptyState onGenerate={refreshMissions} />
                                ) : (
                                    missions.map((mission) => (
                                        <div
                                            key={mission.id}
                                            className={`p-4 rounded-xl border-2 transition-all ${mission.status === 'completed'
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-white border-gray-200 hover:border-purple-300'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-2">
                                                        <span className="text-lg">
                                                            {getTypeIcon(mission.type || mission.category)}
                                                        </span>
                                                        <h3 className="font-semibold text-gray-900">{mission.title}</h3>
                                                        {mission.priority && (
                                                            <span className={`text-xs px-2 py-1 rounded-full ${mission.priority === 'high' ? 'bg-red-100 text-red-600' :
                                                                mission.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                                    'bg-blue-100 text-blue-600'
                                                                }`}>
                                                                {mission.priority}
                                                            </span>
                                                        )}
                                                        {mission.status === 'completed' && (
                                                            <span className="text-green-600">✓</span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600 mb-2">{mission.description}</p>
                                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                                        <span>⏱ {mission.estimatedTime}</span>
                                                        <span className="text-purple-600 font-medium">{mission.reward}</span>
                                                    </div>
                                                </div>
                                                {mission.status !== 'completed' && (
                                                    <Button
                                                        variant="primary"
                                                        size="sm"
                                                        onClick={() => handleMissionComplete(mission.id)}
                                                    >
                                                        Complete
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>

                        {/* Weekly Goals */}
                        <Card>
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Weekly Goals</h2>
                            <div className="space-y-6">
                                {loading || (!hasAttemptedLoad && weeklyGoals.length === 0) ? (
                                    <GoalsLoadingSkeleton />
                                ) : weeklyGoals.length === 0 ? (
                                    <GoalsEmptyState onGenerate={refreshMissions} />
                                ) : (
                                    weeklyGoals.map((goal) => (
                                        <div key={goal.id} className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-900">{goal.title}</h3>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-sm text-gray-500">
                                                        {goal.progress}/{goal.target} {goal.unit}
                                                    </span>
                                                    {goal.priority && (
                                                        <span className={`text-xs px-2 py-1 rounded-full ${goal.priority === 'high' ? 'bg-red-100 text-red-600' :
                                                            goal.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                                                                'bg-blue-100 text-blue-600'
                                                            }`}>
                                                            {goal.priority}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {goal.description && (
                                                <p className="text-sm text-gray-600">{goal.description}</p>
                                            )}
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${Math.min((goal.progress / goal.target) * 100, 100)}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>{goal.progress} {goal.unit}</span>
                                                <span>{goal.target} {goal.unit}</span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - AI Mentor & Insights */}
                    <div className="space-y-8">
                        {/* AI Insights */}
                        <Card>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-gray-900">AI Insights</h2>
                                <div className="flex items-center gap-2">
                                    {/* Debug button - temporary */}
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={clearCache}
                                        disabled={loading}
                                    >
                                        🗑️ Clear Cache
                                    </Button>
                                    {lastGenerated && (
                                        <span className="text-xs text-gray-500">
                                            Updated {new Date(lastGenerated).toLocaleTimeString()}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-4">
                                {loading || (!hasAttemptedLoad && aiInsights.length === 0) ? (
                                    <InsightsLoadingSkeleton />
                                ) : aiInsights.length === 0 ? (
                                    <InsightsEmptyState onGenerate={refreshMissions} />
                                ) : (
                                    aiInsights.map((insight) => (
                                        <div
                                            key={insight.id}
                                            className={`p-4 rounded-lg border-l-4 ${getPriorityColor(insight.priority)}`}
                                        >
                                            <div className="flex items-start space-x-3">
                                                <span className="text-lg">
                                                    {getInsightIcon(insight.type)}
                                                </span>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                                                    <p className="text-sm text-gray-700 mt-1">{insight.content}</p>
                                                    {insight.category && (
                                                        <span className="inline-block mt-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                                            {insight.category}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Floating button to return to journey overview */}
            {onBackToJourney && (
                <button
                    onClick={onBackToJourney}
                    className="fixed bottom-6 right-6 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-white/20 flex items-center justify-center text-gray-600 hover:text-purple-600 transition-colors"
                    title="Back to Journey Overview"
                >
                    🏠
                </button>
            )}
        </div>
    )
}

export default Dashboard 