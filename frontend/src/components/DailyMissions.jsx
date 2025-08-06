import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { Card, Button, MissionDetailModal } from './index'

const DailyMissions = ({
    missions = [],
    onMissionComplete,
    onMissionProgress,
    loading = false,
    completedCount = 0,
    totalCount = 0,
    onRefresh,
    refreshLoading = false
}) => {
    const [selectedMission, setSelectedMission] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Use only props data - no hardcoded fallback
    const missionsList = missions || []

    const { gradients } = useTheme()

    // Function to truncate text for preview
    const truncateText = (text, maxLength = 80) => {
        if (!text || typeof text !== 'string') return ''
        if (text.length <= maxLength) return text
        return text.substring(0, maxLength) + '...'
    }



    // Function to open mission detail modal
    const openMissionDetail = (mission) => {
        setSelectedMission({
            ...mission,
            onAction: () => {
                if (mission.target > 1 && onMissionProgress) {
                    onMissionProgress(mission.id, 1)
                } else if (onMissionComplete) {
                    onMissionComplete(mission.id)
                }
            }
        })
        setIsModalOpen(true)
    }

    const getMissionIcon = (type) => {
        const icons = {
            social: '📱',
            content: '✍️',
            analytics: '📊',
            networking: '🤝',
            learning: '📚',
            planning: '📋'
        }
        return icons[type] || '🎯'
    }

    const getMissionColor = (type) => {
        const colors = {
            social: 'from-blue-500 to-cyan-500',
            content: 'from-purple-500 to-pink-500',
            analytics: 'from-green-500 to-emerald-500',
            networking: 'from-orange-500 to-red-500',
            learning: 'from-indigo-500 to-purple-500',
            planning: 'from-gray-500 to-slate-500'
        }
        return colors[type] || 'from-purple-500 to-pink-500'
    }

    const handleMissionProgress = (missionId, increment = 1) => {
        if (onMissionProgress) {
            onMissionProgress(missionId, increment)
        }
    }

    const handleMissionComplete = (missionId) => {
        if (onMissionComplete) {
            onMissionComplete(missionId)
        }
    }

    const completedMissions = completedCount || missionsList?.filter(m => m.status === 'completed').length || 0
    const totalMissions = totalCount || missionsList?.length || 0

    return (
        <Card>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Daily Missions</h2>
                    <p className="text-sm text-gray-600">Complete tasks to grow your business</p>
                </div>
                <div className="flex items-center space-x-4">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-purple-600">{completedMissions}/{totalMissions}</div>
                        <div className="text-sm text-gray-500">completed</div>
                    </div>
                    {onRefresh && (
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={onRefresh}
                            disabled={refreshLoading}
                        >
                            {refreshLoading ? '🔄' : '✨'} {refreshLoading ? 'Generating...' : 'Refresh'}
                        </Button>
                    )}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${(completedMissions / totalMissions) * 100}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Daily Progress</span>
                    <span>{Math.round((completedMissions / totalMissions) * 100)}%</span>
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <div className="animate-pulse space-y-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="p-4 bg-gray-100 rounded-xl">
                                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                ) : missionsList?.map((mission) => (
                    <div
                        key={mission.id}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${mission.status === 'completed'
                            ? 'bg-green-50 border-green-200 hover:border-green-300'
                            : mission.status === 'in-progress'
                                ? 'bg-purple-50 border-purple-300 hover:border-purple-400'
                                : 'bg-white border-gray-200 hover:border-purple-300'
                            }`}
                        onClick={() => openMissionDetail(mission)}
                    >
                        <div className="flex items-start space-x-4">
                            {/* Mission Icon */}
                            <div className={`w-12 h-12 bg-gradient-to-r ${getMissionColor(mission.type)} rounded-xl flex items-center justify-center text-white text-xl`}>
                                {getMissionIcon(mission.type)}
                            </div>

                            {/* Mission Content */}
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="font-semibold text-gray-900">{mission.title}</h3>
                                    <div className="flex items-center space-x-2">
                                        {mission.streak > 0 && (
                                            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                                🔥 {mission.streak} day streak
                                            </span>
                                        )}
                                        {mission.status === 'completed' && (
                                            <span className="text-green-600 text-lg">✓</span>
                                        )}
                                    </div>
                                </div>

                                <p className="text-sm text-gray-600 mb-3">{truncateText(mission.description)}</p>

                                {/* Progress Bar for Multi-step Missions */}
                                {mission.target > 1 && (
                                    <div className="mb-3">
                                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                                            <span>Progress</span>
                                            <span>{mission.progress}/{mission.target}</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                                                style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                                        <span>⏱ {mission.estimatedTime}</span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center space-x-2">
                                        {mission.status === 'completed' ? (
                                            <span className="text-green-600 text-sm font-medium">Completed!</span>
                                        ) : mission.target > 1 ? (
                                            <div className="flex space-x-1">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleMissionProgress(mission.id, 1)
                                                    }}
                                                    disabled={mission.progress >= mission.target}
                                                >
                                                    +1
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleMissionComplete(mission.id)
                                                    }}
                                                >
                                                    Complete
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                variant="primary"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleMissionComplete(mission.id)
                                                }}
                                            >
                                                Complete
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Daily Streak Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900">🔥 Daily Streak</h3>
                        <p className="text-sm text-gray-600">Keep the momentum going!</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-white">7 days</div>
                        <div className="text-sm text-gray-500">current streak</div>
                    </div>
                </div>
            </div>

            {/* Mission Detail Modal */}
            <MissionDetailModal
                mission={selectedMission}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setSelectedMission(null)
                }}
            />
        </Card>
    )
}

export default DailyMissions 