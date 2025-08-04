import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from './Card';
import Button from './Button';
import { useDailyMissions, useUserProfile } from '../hooks';

const ProgressPage = () => {
    const navigate = useNavigate();
    const { userProfile, loading: profileLoading } = useUserProfile();
    const { dailyMissions, weeklyGoals, missionCompletions, loading: missionsLoading } = useDailyMissions();

    const [selectedPeriod, setSelectedPeriod] = useState('week'); // 'week', 'month', 'all'
    const [completionStats, setCompletionStats] = useState({
        dailyCompleted: 0,
        dailyTotal: 0,
        weeklyCompleted: 0,
        weeklyTotal: 0,
        completionRate: 0
    });

    // Calculate completion statistics
    useEffect(() => {
        if (dailyMissions && weeklyGoals && missionCompletions) {
            const dailyCompleted = missionCompletions.filter(m => m.type === 'daily_missions').length;
            const weeklyCompleted = missionCompletions.filter(m => m.type === 'weekly_goals').length;

            const dailyTotal = dailyMissions.length;
            const weeklyTotal = weeklyGoals.length;

            const totalCompleted = dailyCompleted + weeklyCompleted;
            const totalMissions = dailyTotal + weeklyTotal;
            const completionRate = totalMissions > 0 ? Math.round((totalCompleted / totalMissions) * 100) : 0;

            setCompletionStats({
                dailyCompleted,
                dailyTotal,
                weeklyCompleted,
                weeklyTotal,
                completionRate
            });
        }
    }, [dailyMissions, weeklyGoals, missionCompletions]);

    // Get user goals from profile
    const getUserGoals = () => {
        if (!userProfile?.business?.goals) return [];
        return Array.isArray(userProfile.business.goals)
            ? userProfile.business.goals
            : [userProfile.business.goals];
    };

    // Get business challenges
    const getBusinessChallenges = () => {
        if (!userProfile?.business?.challenges) return [];
        return Array.isArray(userProfile.business.challenges)
            ? userProfile.business.challenges
            : [userProfile.business.challenges];
    };

    // Calculate progress percentage
    const getProgressPercentage = (completed, total) => {
        return total > 0 ? Math.round((completed / total) * 100) : 0;
    };

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

    const userGoals = getUserGoals();
    const businessChallenges = getBusinessChallenges();
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

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Completion Rate */}
                    <Card>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600 mb-2">
                                {completionStats.completionRate}%
                            </div>
                            <div className="text-sm text-gray-400">Completion Rate</div>
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${completionStats.completionRate}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Daily Missions */}
                    <Card>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">
                                {completionStats.dailyCompleted}/{completionStats.dailyTotal}
                            </div>
                            <div className="text-sm text-gray-400">Daily Missions</div>
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${getProgressPercentage(completionStats.dailyCompleted, completionStats.dailyTotal)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Weekly Goals */}
                    <Card>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">
                                {completionStats.weeklyCompleted}/{completionStats.weeklyTotal}
                            </div>
                            <div className="text-sm text-gray-400">Weekly Goals</div>
                            <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${getProgressPercentage(completionStats.weeklyCompleted, completionStats.weeklyTotal)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Streak */}
                    <Card>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-600 mb-2">
                                {completionStreak}
                            </div>
                            <div className="text-sm text-gray-400">Consecutive Days</div>
                            <div className="mt-2">
                                <div className="flex justify-center space-x-1">
                                    {[...Array(Math.min(completionStreak, 7))].map((_, i) => (
                                        <div key={i} className="w-2 h-2 bg-orange-600 rounded-full"></div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* User Goals Section */}
                {userGoals.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-blue-300 neon-text mb-4">Your Business Goals</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {userGoals.map((goal, index) => (
                                <Card key={index}>
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                                                <span className="text-purple-600 font-semibold">🎯</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{goal}</h3>
                                            <p className="text-sm text-gray-400 mt-1">Goal in progress</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Business Challenges Section */}
                {businessChallenges.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-blue-300 neon-text mb-4">Identified Challenges</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {businessChallenges.map((challenge, index) => (
                                <Card key={index}>
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0">
                                            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                                <span className="text-yellow-600 font-semibold">⚡</span>
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{challenge}</h3>
                                            <p className="text-sm text-gray-400 mt-1">Focus on daily missions</p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Completions */}
                {missionCompletions && missionCompletions.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-blue-300 neon-text mb-4">Recent Achievements</h2>
                        <div className="space-y-4">
                            {missionCompletions
                                .sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
                                .slice(0, 5)
                                .map((completion, index) => (
                                    <Card key={index}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className="flex-shrink-0">
                                                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                                        <span className="text-green-600 font-semibold">✅</span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <h3 className="font-medium text-gray-900">{completion.title}</h3>
                                                    <p className="text-sm text-gray-400">
                                                        {completion.type === 'daily_missions' ? 'Daily Mission' : 'Weekly Goal'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {new Date(completion.completedAt).toLocaleDateString('pt-BR')}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                        </div>
                    </div>
                )}

                {/* Motivation Section */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg p-6 text-white neon-border">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Keep it up! 🚀</h2>
                        <p className="text-blue-100 mb-4">
                            {completionStats.completionRate >= 80
                                ? "You're on the right track! Your dedication is generating incredible results."
                                : completionStats.completionRate >= 50
                                    ? "Good progress! Keep focused and continue executing your daily missions."
                                    : "Each completed mission is a step towards your success. Let's go!"}
                        </p>
                        <div className="flex justify-center space-x-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{completionStats.dailyCompleted}</div>
                                <div className="text-sm text-blue-200">Completed Missions</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{completionStreak}</div>
                                <div className="text-sm text-blue-200">Active Days</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{userGoals.length}</div>
                                <div className="text-sm text-blue-200">Goals Defined</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProgressPage; 