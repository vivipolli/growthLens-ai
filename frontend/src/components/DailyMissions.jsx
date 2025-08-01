import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'
import { Card, Button } from './index'

const DailyMissions = () => {
    const [missions, setMissions] = useState([
        {
            id: 1,
            title: "Engage with 3 followers",
            description: "Like, comment, or share content from your target audience",
            reward: "50 XP",
            status: "pending",
            type: "social",
            estimatedTime: "10 min",
            progress: 0,
            target: 3,
            streak: 5
        },
        {
            id: 2,
            title: "Create one piece of content",
            description: "Write a post, create a video, or design a graphic",
            reward: "100 XP",
            status: "completed",
            type: "content",
            estimatedTime: "20 min",
            progress: 1,
            target: 1,
            streak: 12
        },
        {
            id: 3,
            title: "Analyze your metrics",
            description: "Review your social media or website analytics",
            reward: "75 XP",
            status: "pending",
            type: "analytics",
            estimatedTime: "15 min",
            progress: 0,
            target: 1,
            streak: 3
        },
        {
            id: 4,
            title: "Network with 2 creators",
            description: "Connect with other creators in your niche",
            reward: "60 XP",
            status: "pending",
            type: "networking",
            estimatedTime: "15 min",
            progress: 0,
            target: 2,
            streak: 0
        }
    ])

    const { gradients } = useTheme()

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
        setMissions(prev => prev.map(mission => {
            if (mission.id === missionId) {
                const newProgress = Math.min(mission.progress + increment, mission.target)
                const newStatus = newProgress >= mission.target ? 'completed' : 'in-progress'
                return {
                    ...mission,
                    progress: newProgress,
                    status: newStatus
                }
            }
            return mission
        }))
    }

    const handleMissionComplete = (missionId) => {
        setMissions(prev => prev.map(mission => {
            if (mission.id === missionId) {
                return {
                    ...mission,
                    progress: mission.target,
                    status: 'completed'
                }
            }
            return mission
        }))
    }

    const completedMissions = missions?.filter(m => m.status === 'completed').length || 0
    const totalMissions = missions?.length || 0

    return (
        <Card>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Daily Missions</h2>
                    <p className="text-sm text-gray-600">Complete tasks to grow your business</p>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-purple-600">{completedMissions}/{totalMissions}</div>
                    <div className="text-sm text-gray-500">completed</div>
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
                {missions?.map((mission) => (
                    <div
                        key={mission.id}
                        className={`p-4 rounded-xl border-2 transition-all ${mission.status === 'completed'
                            ? 'bg-green-50 border-green-200'
                            : mission.status === 'in-progress'
                                ? 'bg-purple-50 border-purple-300'
                                : 'bg-white border-gray-200 hover:border-purple-300'
                            }`}
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

                                <p className="text-sm text-gray-600 mb-3">{mission.description}</p>

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
                                                    onClick={() => handleMissionProgress(mission.id, 1)}
                                                    disabled={mission.progress >= mission.target}
                                                >
                                                    +1
                                                </Button>
                                                <Button
                                                    variant="primary"
                                                    size="sm"
                                                    onClick={() => handleMissionComplete(mission.id)}
                                                >
                                                    Complete
                                                </Button>
                                            </div>
                                        ) : (
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
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Daily Streak Info */}
            <div className="mt-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg border border-orange-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900">🔥 Daily Streak</h3>
                        <p className="text-sm text-gray-600">Keep the momentum going!</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-orange-600">7 days</div>
                        <div className="text-sm text-gray-500">current streak</div>
                    </div>
                </div>
            </div>
        </Card>
    )
}

export default DailyMissions 