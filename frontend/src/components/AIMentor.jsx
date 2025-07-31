import { useTheme } from '../hooks/useTheme'
import Button from './Button'

const AIMentor = ({
    message = "Hi! I'm your growth mentor. I'm here to help you discover your niche and build your digital presence. Let's start by understanding your business goals and target audience. What industry are you in?",
    onStartSession,
    onLearnMore,
    className = ''
}) => {
    const { gradients } = useTheme()

    return (
        <div className={`bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200 ${className}`}>
            <div className="flex items-center space-x-3 mb-4">
                <div className={`w-10 h-10 ${gradients.primary} rounded-full flex items-center justify-center`}>
                    <span className="text-white text-lg">🤖</span>
                </div>
                <div>
                    <h3 className="font-semibold text-gray-900">Your AI Mentor</h3>
                    <p className="text-sm text-gray-600">Personalized guidance for your journey</p>
                </div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-purple-200">
                <p className="text-gray-700 mb-4">
                    "{message}"
                </p>
                <div className="flex space-x-3">
                    <Button
                        variant="primary"
                        size="md"
                        onClick={onStartSession}
                    >
                        Start Session
                    </Button>
                    <Button
                        variant="secondary"
                        size="md"
                        onClick={onLearnMore}
                    >
                        Learn More
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default AIMentor 