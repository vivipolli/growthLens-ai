import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'
import { useDailyMissions } from '../hooks/useDailyMissions'
import { useBlockchainData } from '../hooks/useBlockchainData'
import { useUser } from '@clerk/clerk-react'
import {
    Card,
    Button,
    DailyMissions,
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
    const navigate = useNavigate()
    const { user } = useUser()

    // Use only Clerk user ID - no fallback needed
    const userId = user?.id;
    const { userData: blockchainData, loading: blockchainLoading } = useBlockchainData(userId)

    // Clean localStorage when user changes
    useEffect(() => {
        if (user?.id) {
            const lastUserId = localStorage.getItem('lastLoggedInUserId');

            if (lastUserId && lastUserId !== user.id) {
                console.log(`🔄 New user logged in: ${user.id} (was: ${lastUserId})`);
                console.log('🔄 User changed, data will be loaded from blockchain');
            }

            // Save current user ID
            localStorage.setItem('lastLoggedInUserId', user.id);
        }
    }, [user?.id]);

    const {
        dailyMissions: missions,

        aiInsights,
        error,
        lastGenerated,
        hasAttemptedLoad,
        completeMission,
        updateGoalProgress,
        generateAIMissions,
        refreshMissions,
        clearCache,
        getCompletedMissionsCount,
        getTotalMissionsCount,
        // Individual loading states
        missionsLoading,
        goalsLoading,
        insightsLoading,
        // Individual refresh functions
        generateDailyMissions,

        generateBusinessObservations
    } = useDailyMissions()

    useEffect(() => {
        if (personalData && businessData) {
            const userProfile = {
                personal: personalData,
                business: businessData
            }

            saveUserProfile(userProfile)

            // Don't auto-generate on load - let user click individual refresh buttons
            console.log('🚀 Dashboard: Profile loaded, ready for individual generation')
        }
    }, [personalData, businessData])

    // Log blockchain data status
    useEffect(() => {
        if (blockchainData) {
            console.log('📊 Dashboard: Blockchain data loaded:', {
                userProfile: !!blockchainData.userProfile,
                businessData: !!blockchainData.businessData,
                aiInsights: blockchainData.aiInsights?.length || 0,
                missionCompletions: blockchainData.missionCompletions?.length || 0
            })
        }
    }, [blockchainData])


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
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Blockchain Status Indicator */}
                {blockchainData && (
                    <div className="mb-4 flex items-center justify-end">
                        <div className="flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-700 font-medium">Blockchain Connected</span>
                        </div>
                    </div>
                )}

                {/* Progress Navigation */}
                <div className="mb-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => navigate('/progress')}
                        >
                            📊 See My Progress
                        </Button>
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => navigate('/chat')}
                        >
                            💬 AI Business Coach
                        </Button>
                        <span className="text-sm text-gray-600">
                            Track your achievements and goals
                        </span>
                    </div>
                </div>

                {/* Main Content */}
                <div className="space-y-8">
                    {/* Daily Missions */}
                    <div className="lg:col-span-2">
                        {missionsLoading ? (
                            <Card>
                                <MissionLoadingSkeleton />
                            </Card>
                        ) : missions && missions.length > 0 ? (
                            <DailyMissions
                                missions={missions}
                                onMissionComplete={handleMissionComplete}
                                loading={false}
                                completedCount={getCompletedMissionsCount()}
                                totalCount={getTotalMissionsCount()}
                                onRefresh={generateDailyMissions}
                                refreshLoading={missionsLoading}
                            />
                        ) : (
                            <Card>
                                <MissionEmptyState onGenerate={generateDailyMissions} />
                            </Card>
                        )}
                    </div>

                    {/* Business Insights - Full Width */}
                    <Card>
                        <div className="flex items-center justify-between mb-6 w-full">
                            <h2 className="text-xl font-bold text-gray-900">Business Insights</h2>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                        console.log('🖱️ AI insights refresh button clicked');
                                        generateBusinessObservations();
                                    }}
                                    disabled={insightsLoading}
                                >
                                    {insightsLoading ? '🔄' : '💡'} {insightsLoading ? 'Generating...' : 'Refresh'}
                                </Button>
                                {lastGenerated && (
                                    <span className="text-xs text-gray-500">
                                        Updated {new Date(lastGenerated).toLocaleTimeString()}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            {insightsLoading ? (
                                <InsightsLoadingSkeleton />
                            ) : (!aiInsights || aiInsights.length === 0) ? (
                                <InsightsEmptyState onGenerate={generateBusinessObservations} />
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