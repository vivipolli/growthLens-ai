import React from 'react'
import { Button } from './index'

export const MissionEmptyState = ({ onGenerate }) => (
    <div className="text-center py-8">
        <div className="text-4xl mb-4">🤖</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI is preparing your missions</h3>
        <p className="text-gray-600 mb-4">Click "Refresh" to generate personalized daily missions based on your profile</p>
        <Button
            variant="primary"
            onClick={onGenerate}
        >
            🚀 Generate My Missions
        </Button>
    </div>
)

export const GoalsEmptyState = ({ onGenerate }) => (
    <div className="text-center py-8">
        <div className="text-4xl mb-4">🎯</div>

        <Button
            variant="primary"
            onClick={onGenerate}
        >
            🎯 Generate My Goals
        </Button>
    </div>
)

export const InsightsEmptyState = ({ onGenerate }) => (
    <div className="text-center py-8">
        <div className="text-4xl mb-4">💡</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI insights coming soon</h3>
        <p className="text-gray-600 mb-4">AI will analyze your profile and generate personalized business insights</p>
        <Button
            variant="primary"
            onClick={onGenerate}
        >
            💡 Generate Insights
        </Button>
    </div>
)

export const GenericEmptyState = ({
    icon = "🔄",
    title = "No data yet",
    description = "Click the button to generate data",
    buttonText = "Generate",
    onGenerate
}) => (
    <div className="text-center py-8">
        <div className="text-4xl mb-4">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Button
            variant="primary"
            onClick={onGenerate}
        >
            {buttonText}
        </Button>
    </div>
) 