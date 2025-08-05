import { useTheme } from '../hooks/useTheme'
import { Button, MissionContent } from './index'

const MissionDetailModal = ({ mission, isOpen, onClose }) => {
    const { gradients } = useTheme()

    if (!isOpen || !mission) return null

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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-start space-x-4">
                        <div className={`w-16 h-16 bg-gradient-to-r ${getMissionColor(mission.type)} rounded-xl flex items-center justify-center text-white text-2xl`}>
                            {getMissionIcon(mission.type)}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-gray-900">{mission.title}</h2>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-gray-600 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="flex items-center space-x-4 mt-2">
                                <span className="text-sm text-gray-500">⏱ {mission.estimatedTime}</span>
                                <span className="text-sm text-gray-500">🏆 {mission.reward}</span>
                                {mission.streak > 0 && (
                                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                        🔥 {mission.streak} day streak
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <MissionContent description={mission.description || mission.content} />

                    {/* Progress Section */}
                    {mission.target > 1 && (
                        <div className="mt-6 mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">Progress</h3>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="flex justify-between text-sm text-gray-600 mb-2">
                                    <span>Current Progress</span>
                                    <span>{mission.progress}/{mission.target}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3">
                                    <div
                                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                                        style={{ width: `${(mission.progress / mission.target) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tips section if available */}
                    {mission.tips && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Tips</h3>
                            <div className="bg-blue-50 rounded-lg p-4">
                                <ul className="space-y-2">
                                    {mission.tips.map((tip, index) => (
                                        <li key={index} className="text-sm text-blue-700 flex items-start">
                                            <span className="text-blue-500 mr-2">•</span>
                                            {tip}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Status and Actions */}
                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${mission.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : mission.status === 'in-progress'
                                        ? 'bg-purple-100 text-purple-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {mission.status === 'completed' ? '✓ Completed' :
                                        mission.status === 'in-progress' ? '⏳ In Progress' : '📋 Pending'}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button variant="secondary" onClick={onClose}>
                                    Close
                                </Button>
                                {mission.status !== 'completed' && (
                                    <Button variant="primary" onClick={() => {
                                        // Trigger mission action and close modal
                                        if (mission.onAction) {
                                            mission.onAction()
                                        }
                                        onClose()
                                    }}>
                                        {mission.target > 1 ? 'Update Progress' : 'Complete Mission'}
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MissionDetailModal