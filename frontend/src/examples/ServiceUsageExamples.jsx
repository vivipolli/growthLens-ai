import React, { useState, useEffect } from 'react';
import { useBusinessCoaching } from '../hooks/useBusinessCoaching.js';
import { useHederaAgent } from '../hooks/useHederaAgent.js';
import { useUserProfile } from '../hooks/useUserProfile.js';
import { INSIGHT_TYPES } from '../utils/constants.js';

// Example: AI Insights Component
export const AIInsightsExample = () => {
    const {
        loading,
        error,
        insights,
        generateInsights,
        getRecommendations,
        profileComplete
    } = useBusinessCoaching();

    const [selectedType, setSelectedType] = useState(INSIGHT_TYPES.CONTENT_STRATEGY);

    const handleGenerateInsights = async () => {
        await generateInsights(selectedType);
    };

    const handleGetRecommendations = async () => {
        await getRecommendations();
    };

    if (!profileComplete) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                    Please complete your onboarding to see personalized insights.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">AI Business Insights</h2>

            <div className="mb-4">
                <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="p-2 border border-gray-300 rounded"
                >
                    <option value={INSIGHT_TYPES.CONTENT_STRATEGY}>Content Strategy</option>
                    <option value={INSIGHT_TYPES.AUDIENCE_GROWTH}>Audience Growth</option>
                    <option value={INSIGHT_TYPES.MONETIZATION}>Monetization</option>
                    <option value={INSIGHT_TYPES.COMPETITIVE_ANALYSIS}>Competitive Analysis</option>
                    <option value={INSIGHT_TYPES.GOAL_PLANNING}>Goal Planning</option>
                </select>
            </div>

            <div className="flex gap-2 mb-4">
                <button
                    onClick={handleGenerateInsights}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Generating...' : 'Generate Insights'}
                </button>

                <button
                    onClick={handleGetRecommendations}
                    disabled={loading}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Get Recommendations'}
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded mb-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {insights.length > 0 && (
                <div className="space-y-4">
                    {insights.map((insight) => (
                        <div key={insight.id} className="p-4 border border-gray-200 rounded">
                            <h3 className="font-semibold">{insight.title}</h3>
                            <p className="text-gray-600 mt-2">{insight.content}</p>
                            <div className="mt-2 flex gap-2 text-sm">
                                <span className={`px-2 py-1 rounded ${insight.priority === 'high' ? 'bg-red-100 text-red-800' :
                                    insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                    {insight.priority}
                                </span>
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded">
                                    {insight.confidence}% confidence
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// Example: Business Chat Component
export const BusinessChatExample = () => {
    const {
        loading,
        error,
        chatHistory,
        sendMessage,
        clearChatHistory,
        profileComplete
    } = useBusinessCoaching();

    const [message, setMessage] = useState('');

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        await sendMessage(message);
        setMessage('');
    };

    if (!profileComplete) {
        return (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800">
                    Please complete your onboarding to chat with your AI mentor.
                </p>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">AI Business Mentor</h2>
                <button
                    onClick={clearChatHistory}
                    className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Clear Chat
                </button>
            </div>

            <div className="h-96 overflow-y-auto border border-gray-200 rounded p-4 mb-4">
                {chatHistory.length === 0 ? (
                    <p className="text-gray-500">Start a conversation with your AI mentor...</p>
                ) : (
                    chatHistory.map((msg) => (
                        <div key={msg.id} className={`mb-4 ${msg.type === 'human' ? 'text-right' : 'text-left'}`}>
                            <div className={`inline-block p-3 rounded-lg max-w-xs ${msg.type === 'human'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-gray-800'
                                }`}>
                                <p>{msg.content}</p>
                                <small className="text-xs opacity-75">
                                    {new Date(msg.timestamp).toLocaleTimeString()}
                                </small>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded mb-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ask your AI mentor anything..."
                    className="flex-1 p-2 border border-gray-300 rounded"
                    disabled={loading}
                />
                <button
                    type="submit"
                    disabled={loading || !message.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
};

// Example: Profile Management Component
export const ProfileManagementExample = () => {
    const {
        profile,
        profileComplete,
        loading,
        error,
        saveCompleteProfile,
        clearProfile
    } = useUserProfile();

    const handleSaveToAPI = async () => {
        const success = await saveCompleteProfile();
        if (success) {
            alert('Profile saved to API successfully!');
        }
    };

    const handleClearProfile = async () => {
        if (confirm('Are you sure you want to clear your profile?')) {
            clearProfile();
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Profile Management</h2>

            <div className="mb-4">
                <p className="text-sm text-gray-600">
                    Profile Status:
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${profileComplete ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                        {profileComplete ? 'Complete' : 'Incomplete'}
                    </span>
                </p>
            </div>

            {profile && (
                <div className="mb-4 p-4 bg-gray-50 rounded">
                    <h3 className="font-semibold mb-2">Profile Summary</h3>
                    <p><strong>Name:</strong> {profile.personal?.name || 'Not set'}</p>
                    <p><strong>Industry:</strong> {profile.business?.industry || 'Not set'}</p>
                    <p><strong>Location:</strong> {profile.personal?.location || 'Not set'}</p>
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={handleSaveToAPI}
                    disabled={!profileComplete || loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Saving...' : 'Save to API'}
                </button>

                <button
                    onClick={handleClearProfile}
                    disabled={loading}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                >
                    Clear Profile
                </button>
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded mt-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}
        </div>
    );
};

// Example: Hedera Agent Component
export const HederaAgentExample = () => {
    const {
        loading,
        error,
        agentStatus,
        checkHealth,
        getAccountBalance
    } = useHederaAgent();

    const [accountId, setAccountId] = useState('');
    const [balance, setBalance] = useState(null);

    const handleCheckHealth = async () => {
        await checkHealth();
    };

    const handleGetBalance = async () => {
        if (!accountId) return;
        const result = await getAccountBalance(accountId);
        setBalance(result);
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Hedera Agent</h2>

            <div className="mb-4">
                <p className="text-sm text-gray-600">
                    Agent Status:
                    <span className={`ml-2 px-2 py-1 rounded text-xs ${agentStatus === 'healthy' ? 'bg-green-100 text-green-800' :
                        agentStatus === 'error' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                        }`}>
                        {agentStatus}
                    </span>
                </p>
            </div>

            <div className="space-y-4">
                <button
                    onClick={handleCheckHealth}
                    disabled={loading}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                >
                    {loading ? 'Checking...' : 'Check Health'}
                </button>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={accountId}
                        onChange={(e) => setAccountId(e.target.value)}
                        placeholder="Enter account ID (e.g., 0.0.123456)"
                        className="flex-1 p-2 border border-gray-300 rounded"
                    />
                    <button
                        onClick={handleGetBalance}
                        disabled={loading || !accountId}
                        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
                    >
                        Get Balance
                    </button>
                </div>

                {balance && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-green-800">{balance.output}</p>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded mt-4">
                    <p className="text-red-800">{error}</p>
                </div>
            )}
        </div>
    );
}; 