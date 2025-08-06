import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';
import Button from './Button';
import { useDailyMissions, useUserProfile } from '../hooks';

const ProgressPage = () => {
    const navigate = useNavigate();
    const { userProfile, loading: profileLoading } = useUserProfile();
    const { dailyMissions, missionCompletions, loading: missionsLoading } = useDailyMissions();

    const [selectedPeriod, setSelectedPeriod] = useState('all'); // 'week', 'month', 'all'
    const [completedMissions, setCompletedMissions] = useState([]);

    // Filter completed missions based on selected period
    useEffect(() => {
        if (missionCompletions && missionCompletions.length > 0) {
            const now = new Date();
            const filteredCompletions = missionCompletions.filter(completion => {
                const completionDate = new Date(completion.completedAt);

                switch (selectedPeriod) {
                    case 'week':
                        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        return completionDate >= weekAgo;
                    case 'month':
                        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return completionDate >= monthAgo;
                    case 'all':
                    default:
                        return true;
                }
            });

            setCompletedMissions(filteredCompletions);
        }
    }, [missionCompletions, selectedPeriod]);

    // Get completion streak
    const getCompletionStreak = () => {
        if (!missionCompletions || missionCompletions.length === 0) return 0;

        const sortedCompletions = missionCompletions
            .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));

        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        for (let i = 0; i < sortedCompletions.length; i++) {
            const completionDate = new Date(sortedCompletions[i].completedAt);
            completionDate.setHours(0, 0, 0, 0);

            const daysDiff = Math.floor((today - completionDate) / (1000 * 60 * 60 * 24));

            if (daysDiff === streak) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    };

    if (profileLoading || missionsLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
                    <p className="text-blue-200">Loading progress...</p>
                </div>
            </div>
        );
    }

    const completionStreak = getCompletionStreak();

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-black py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate('/')}
                            className="text-blue-300 hover:text-blue-200"
                        >
                            ← Back to Dashboard
                        </Button>
                    </div>
                    <h1 className="text-3xl font-bold text-blue-300 neon-text mb-2">Your Progress</h1>
                    <p className="text-blue-200">Track your achievements and stay focused on your goals</p>
                </div>

                {/* Period Filter */}
                <div className="mb-6">
                    <div className="flex space-x-2">
                        {[
                            { key: 'week', label: 'This Week' },
                            { key: 'month', label: 'This Month' },
                            { key: 'all', label: 'All Time' }
                        ].map((period) => (
                            <Button
                                key={period.key}
                                variant={selectedPeriod === period.key ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setSelectedPeriod(period.key)}
                            >
                                {period.label}
                            </Button>
                        ))}
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Total Completed Missions */}
                    <Card>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                {completedMissions.length}
                            </div>
                            <div className="text-sm text-gray-400">Completed Missions</div>
                        </div>
                    </Card>

                    {/* Completion Streak */}
                    <Card>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-600 mb-2">
                                {getCompletionStreak()}
                            </div>
                            <div className="text-sm text-gray-400">Day Streak</div>
                            <div className="mt-2">
                                <div className="flex justify-center space-x-1">
                                    {[...Array(Math.min(getCompletionStreak(), 7))].map((_, i) => (
                                        <div key={i} className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Period Filter */}
                    <Card>
                        <div className="text-center">
                            <div className="text-sm text-gray-400 mb-2">Showing</div>
                            <div className="flex justify-center space-x-1">
                                {[
                                    { key: 'week', label: 'Week' },
                                    { key: 'month', label: 'Month' },
                                    { key: 'all', label: 'All' }
                                ].map((period) => (
                                    <Button
                                        key={period.key}
                                        variant={selectedPeriod === period.key ? 'primary' : 'secondary'}
                                        size="xs"
                                        onClick={() => setSelectedPeriod(period.key)}
                                        className="text-xs"
                                    >
                                        {period.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Completed Missions List */}
                {completedMissions.length > 0 ? (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-blue-300 neon-text mb-4">Completed Daily Missions</h2>
                        <div className="space-y-4">
                            {completedMissions
                                .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                                .map((completion, index) => (
                                    <Card key={index}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                                        <span className="text-green-600 text-lg">✅</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900">{completion.title || completion.missionTitle || 'Daily Mission'}</h3>
                                                    <p className="text-sm text-gray-500">
                                                        {completion.description || completion.missionDescription || 'Daily mission completed'}
                                                    </p>
                                                    <div className="flex items-center space-x-4 mt-1">
                                                        <span className="text-xs text-gray-400">
                                                            {completion.category || 'General'}
                                                        </span>
                                                        <span className="text-xs text-gray-400">
                                                            {completion.estimatedTime || '15-60 min'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm text-gray-500">
                                                    {new Date(completion.completedAt).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    {new Date(completion.completedAt).toLocaleTimeString('en-US', {
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                        </div>
                    </div>
                ) : (
                    <div className="mb-8">
                        <Card>
                            <div className="text-center py-8">
                                <div className="text-4xl mb-4">🎯</div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Completed Missions Yet</h3>
                                <p className="text-gray-500 mb-4">
                                    {selectedPeriod === 'week'
                                        ? "Complete your daily missions this week to see your progress here."
                                        : selectedPeriod === 'month'
                                            ? "Complete your daily missions this month to see your progress here."
                                            : "Complete your daily missions to see your progress here."}
                                </p>
                                <Button
                                    variant="primary"
                                    onClick={() => navigate('/')}
                                >
                                    Go to Dashboard
                                </Button>
                            </div>
                        </Card>
                    </div>
                )}

                {/* Motivation Section */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg p-6 text-white neon-border">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Keep it up! 🚀</h2>
                        <p className="text-blue-100 mb-4">
                            {completedMissions.length >= 10
                                ? "You're on fire! Your consistency is creating amazing results."
                                : completedMissions.length >= 5
                                    ? "Great progress! Keep focused and continue with your daily missions."
                                    : "Every completed mission brings you closer to your goals. Let's go!"}
                        </p>
                        <div className="flex justify-center space-x-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{completedMissions.length}</div>
                                <div className="text-sm text-blue-200">Completed Missions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{getCompletionStreak()}</div>
                                <div className="text-sm text-blue-200">Day Streak</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{selectedPeriod}</div>
                                <div className="text-sm text-blue-200">Period</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressPage; 