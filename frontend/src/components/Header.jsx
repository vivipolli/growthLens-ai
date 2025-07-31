import { useTheme } from '../hooks/useTheme'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useClerk } from '@clerk/clerk-react'

const isOnboardingComplete = () => {
    try {
        const personal = localStorage.getItem('personalOnboardingAnswers')
        const business = localStorage.getItem('businessOnboardingAnswers')
        return Boolean(personal && business)
    } catch {
        return false
    }
}

const Header = ({
    completedSteps = null,
    totalSteps = null,
    className = ''
}) => {
    const { components, gradients } = useTheme()
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const navigate = useNavigate()
    const { signOut } = useClerk()

    const handleLogoClick = () => {
        if (isOnboardingComplete()) {
            navigate('/')
        }
    }

    const handleLogout = async () => {
        try {
            await signOut()
            setShowProfileMenu(false)
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return (
        <header className={`${components.header} ${className}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div
                            className={`w-10 h-10 ${gradients.primary} rounded-lg flex items-center justify-center cursor-pointer select-none`}
                            onClick={handleLogoClick}
                            title={isOnboardingComplete() ? 'Go to Dashboard' : undefined}
                        >
                            <span className="text-white text-xl font-bold">GJ</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 cursor-pointer select-none" onClick={handleLogoClick} title={isOnboardingComplete() ? 'Go to Dashboard' : undefined}>Growth Journey</h1>
                            <p className="text-sm text-gray-600">Your Onchain Mentor for Digital Success</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 relative">
                        {completedSteps !== null && totalSteps !== null && (
                            <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                {completedSteps}/{totalSteps} Completed
                            </div>
                        )}
                        <button
                            className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-400"
                            onClick={() => setShowProfileMenu((v) => !v)}
                            title="Profile Menu"
                        >
                            <span role="img" aria-label="profile">👤</span>
                        </button>
                        {showProfileMenu && (
                            <div className="absolute right-0 mt-12 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <button
                                    className="w-full text-left px-4 py-3 hover:bg-purple-50 text-gray-800"
                                    onClick={() => { setShowProfileMenu(false); navigate('/onboarding/personal') }}
                                >
                                    Edit Personal Onboarding
                                </button>
                                <button
                                    className="w-full text-left px-4 py-3 hover:bg-purple-50 text-gray-800"
                                    onClick={() => { setShowProfileMenu(false); navigate('/onboarding/business') }}
                                >
                                    Edit Business Onboarding
                                </button>
                                <div className="border-t border-gray-200">
                                    <button
                                        className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-600"
                                        onClick={handleLogout}
                                    >
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header 