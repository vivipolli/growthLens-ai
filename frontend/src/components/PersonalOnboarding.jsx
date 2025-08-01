import { useState, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { Card, Button, AIMentor } from './index'
import { useNavigate } from 'react-router-dom'
import { businessCoachingService } from '../services/businessCoachingService'

const PersonalOnboarding = ({ onComplete, initialAnswers = {}, isEditMode = false }) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState(() => {
        // Always try to load from localStorage first
        try {
            const data = localStorage.getItem('personalOnboardingAnswers')
            if (data) {
                const parsedData = JSON.parse(data)
                console.log('📂 Loaded personal data from localStorage:', parsedData)
                return parsedData
            }
        } catch (error) {
            console.error('❌ Error loading personal data from localStorage:', error)
        }

        // Fallback to initialAnswers or empty object
        return initialAnswers || {}
    })
    const { gradients } = useTheme()
    const navigate = useNavigate()

    // Test data for auto-fill
    const testData = {
        name: "Maria Silva",
        age: "26-35",
        location: "São Paulo, Brazil",
        primary_motivation: "Financial freedom",
        biggest_challenge: "I struggle with finding the right balance between my current job and building my own business. Time management is my biggest challenge, along with not knowing exactly where to start.",
        success_definition: "Success for me would be having a sustainable online business that generates at least R$10,000 per month, allowing me to quit my corporate job and have more time for my family and personal growth.",
        core_values: ["Authenticity", "Growth", "Community"],
        work_style: "Creative and flexible",
        dream_lifestyle: "I envision myself working from a beautiful home office overlooking a garden, starting my day with meditation and yoga. I'd spend 4-5 hours on my business, have lunch with my family, and spend afternoons on personal projects or traveling. Weekends would be completely free for adventures and quality time with loved ones.",
        impact_goal: "I want to help other women discover their entrepreneurial potential and build businesses that align with their values. My goal is to create a community where we support each other's growth and celebrate authentic success.",
        fear: "My biggest fear is that I might not be good enough or that I'll invest time and energy into something that won't work out. I'm also scared of financial instability during the transition period."
    }

    const fillTestData = () => {
        setAnswers(testData)
        saveAnswers(testData)
        // Go to last step to see the complete form
        setCurrentStep(personalSteps.length - 1)
    }

    const fillTestDataOnly = () => {
        setAnswers(testData)
        saveAnswers(testData)
    }

    const saveAnswers = (answers) => {
        // Save to localStorage for now
        localStorage.setItem('personalOnboardingAnswers', JSON.stringify(answers))
        console.log('💾 Saved personal data to localStorage:', answers)

        // Save to blockchain
        try {
            const userId = answers.name || 'anonymous'
            businessCoachingService.saveUserProfileToBlockchain(userId, answers)
                .then(response => {
                    if (response.success) {
                        console.log('✅ Personal data saved to blockchain:', response)
                        if (response.transactionId) {
                            console.log(`🔗 HashScan URL: ${response.hashscanUrl}`)
                        }
                    }
                })
                .catch(error => {
                    console.error('❌ Failed to save personal data to blockchain:', error)
                })
        } catch (error) {
            console.error('❌ Error saving to blockchain:', error)
        }

        // Future: send to AI agent or blockchain here
        // Example:
        // sendToAIAgent(answers)
        // saveToBlockchain(answers)
    }

    const personalSteps = [
        {
            id: 1,
            title: "Your Story",
            subtitle: "Tell us about yourself",
            description: "Let's start by understanding who you are and what drives you. This helps your AI mentor personalize your journey.",
            icon: "👤",
            questions: [
                {
                    id: "name",
                    type: "text",
                    label: "What's your name?",
                    placeholder: "Enter your full name",
                    required: true
                },
                {
                    id: "age",
                    type: "select",
                    label: "What's your age range?",
                    options: ["18-25", "26-35", "36-45", "46-55", "55+"],
                    required: true
                },
                {
                    id: "location",
                    type: "text",
                    label: "Where are you based?",
                    placeholder: "City, Country",
                    required: true
                }
            ]
        },
        {
            id: 2,
            title: "Your Motivation",
            subtitle: "What drives you?",
            description: "Understanding your deeper motivations helps us create a journey that truly resonates with you.",
            icon: "💪",
            questions: [
                {
                    id: "primary_motivation",
                    type: "select",
                    label: "What's your primary motivation for starting this journey?",
                    options: [
                        "Financial freedom",
                        "Creative expression",
                        "Helping others",
                        "Building legacy",
                        "Personal growth",
                        "Flexibility and time freedom"
                    ],
                    required: true
                },
                {
                    id: "biggest_challenge",
                    type: "textarea",
                    label: "What's your biggest challenge right now?",
                    placeholder: "Describe the main obstacle you're facing...",
                    required: true
                },
                {
                    id: "success_definition",
                    type: "textarea",
                    label: "How do you define success for yourself?",
                    placeholder: "What would success look like for you in 1 year?",
                    required: true
                }
            ]
        },
        {
            id: 3,
            title: "Your Values",
            subtitle: "What matters most to you?",
            description: "Your core values will guide your business decisions and help you stay authentic.",
            icon: "🎯",
            questions: [
                {
                    id: "core_values",
                    type: "multiselect",
                    label: "Select your top 3 core values:",
                    options: [
                        "Authenticity",
                        "Innovation",
                        "Community",
                        "Excellence",
                        "Sustainability",
                        "Growth",
                        "Service",
                        "Creativity",
                        "Integrity",
                        "Adventure"
                    ],
                    maxSelections: 3,
                    required: true
                },
                {
                    id: "work_style",
                    type: "select",
                    label: "What's your preferred work style?",
                    options: [
                        "Structured and systematic",
                        "Creative and flexible",
                        "Collaborative and team-oriented",
                        "Independent and self-directed",
                        "Fast-paced and dynamic"
                    ],
                    required: true
                }
            ]
        },
        {
            id: 4,
            title: "Your Dreams",
            subtitle: "What's your vision?",
            description: "Your dreams and aspirations will shape the path we create together.",
            icon: "🌟",
            questions: [
                {
                    id: "dream_lifestyle",
                    type: "textarea",
                    label: "Describe your ideal lifestyle in 5 years:",
                    placeholder: "Where would you be living? What would your typical day look like?",
                    required: true
                },
                {
                    id: "impact_goal",
                    type: "textarea",
                    label: "What impact do you want to have on the world?",
                    placeholder: "How do you want to make a difference?",
                    required: true
                },
                {
                    id: "fear",
                    type: "textarea",
                    label: "What's your biggest fear about this journey?",
                    placeholder: "What scares you the most about starting?",
                    required: true
                }
            ]
        }
    ]

    const progress = ((currentStep + 1) / personalSteps.length) * 100

    const handleAnswerChange = (questionId, value) => {
        const newAnswers = {
            ...answers,
            [questionId]: value
        }
        setAnswers(newAnswers)
        // Save to localStorage immediately
        saveAnswers(newAnswers)
    }

    const isStepComplete = (step) => {
        return step.questions.every(question => {
            const answer = answers[question.id]
            if (question.required && !answer) return false
            if (question.type === 'multiselect' && question.maxSelections) {
                return answer && answer.length >= question.maxSelections
            }
            return true
        })
    }

    const handleNextStep = () => {
        if (currentStep < personalSteps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            if (isEditMode) {
                saveAnswers(answers)
                setTimeout(() => {
                    navigate('/')
                }, 100)
            } else if (onComplete && typeof onComplete === 'function') {
                console.log('✅ Personal onboarding completed!')
                console.log('📊 Final answers:', answers)
                onComplete(answers)
            }
        }
    }

    const handlePreviousStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1)
        }
    }

    const renderQuestion = (question) => {
        const value = answers[question.id] || ''

        switch (question.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder={question.placeholder}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                )

            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                        <option value="">Select an option</option>
                        {question.options.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                )

            case 'multiselect':
                const selectedValues = Array.isArray(value) ? value : []
                return (
                    <div className="space-y-2">
                        {question.options.map((option, index) => (
                            <label key={index} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selectedValues.includes(option)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            if (selectedValues.length < question.maxSelections) {
                                                handleAnswerChange(question.id, [...selectedValues, option])
                                            }
                                        } else {
                                            handleAnswerChange(question.id, selectedValues.filter(v => v !== option))
                                        }
                                    }}
                                    className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                                <span className="text-gray-700">{option}</span>
                            </label>
                        ))}
                        <p className="text-sm text-gray-500">
                            Selected: {selectedValues.length}/{question.maxSelections}
                        </p>
                    </div>
                )

            case 'textarea':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder={question.placeholder}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                    />
                )

            default:
                return null
        }
    }

    const currentStepData = personalSteps[currentStep]
    const isCurrentStepComplete = isStepComplete(currentStepData)

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Personal Discovery</h1>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={fillTestDataOnly}
                                className="bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-300 text-xs"
                            >
                                🧪 Fill Data
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={fillTestData}
                                className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 text-xs"
                            >
                                ⚡ Complete
                            </Button>
                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                        <span>Personal Discovery</span>
                        <span>{currentStep + 1} of {personalSteps.length}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Steps Overview */}
                    <div className="lg:col-span-1">
                        <Card padding="md">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Your Journey</h2>
                            <div className="space-y-4">
                                {personalSteps.map((step, index) => (
                                    <div
                                        key={step.id}
                                        className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${index === currentStep
                                            ? 'bg-purple-50 border-purple-300 shadow-lg'
                                            : index < currentStep
                                                ? 'bg-green-50 border-green-200'
                                                : 'bg-gray-50 border-gray-200'
                                            }`}
                                        onClick={() => setCurrentStep(index)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${index < currentStep
                                                ? 'bg-green-500 text-white'
                                                : index === currentStep
                                                    ? 'bg-purple-500 text-white'
                                                    : 'bg-gray-300 text-gray-600'
                                                }`}>
                                                {index < currentStep ? '✓' : step.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`font-semibold ${index < currentStep ? 'text-green-800' :
                                                    index === currentStep ? 'text-purple-800' : 'text-gray-600'
                                                    }`}>
                                                    {step.title}
                                                </h3>
                                                <p className="text-sm text-gray-500">{step.subtitle}</p>
                                            </div>
                                        </div>
                                        {index === currentStep && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Current Step */}
                    <div className="lg:col-span-2">
                        <Card>
                            <div className="mb-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className={`w-12 h-12 ${gradients.primary} rounded-xl flex items-center justify-center text-2xl`}>
                                        {currentStepData.icon}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{currentStepData.title}</h2>
                                        <p className="text-gray-600">{currentStepData.subtitle}</p>
                                    </div>
                                </div>
                                <p className="text-gray-700 leading-relaxed">{currentStepData.description}</p>
                            </div>

                            {/* Questions */}
                            <div className="space-y-6 mb-8">
                                {currentStepData.questions.map((question) => (
                                    <div key={question.id} className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            {question.label}
                                            {question.required && <span className="text-red-500 ml-1">*</span>}
                                        </label>
                                        {renderQuestion(question)}
                                    </div>
                                ))}
                            </div>

                            {/* Navigation Buttons */}
                            <div className="flex justify-between">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    onClick={handlePreviousStep}
                                    disabled={currentStep === 0}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={handleNextStep}
                                    disabled={!isCurrentStepComplete}
                                >
                                    {currentStep === personalSteps.length - 1 ? (isEditMode ? 'Save' : 'Complete Discovery') : 'Next Step'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default PersonalOnboarding 