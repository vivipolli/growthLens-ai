import React, { useState, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { useBlockchainOnboarding } from '../hooks/useBlockchainOnboarding'
import { Card, Button, AIMentor } from './index'
import { useNavigate } from 'react-router-dom'
import { businessCoachingService } from '../services/businessCoachingService'
import { useUser } from '@clerk/clerk-react'

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
    const { user } = useUser()
    const {
        loading: blockchainLoading,
        blockchainData,
        fillSpecificForm,
        checkAndRedirectIfComplete
    } = useBlockchainOnboarding()

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

    // Carregar dados do blockchain
    const fillBlockchainData = async () => {
        if (blockchainLoading) {
            console.log('⏳ Blockchain request already in progress, skipping...')
            return
        }

        try {
            const personalData = await fillSpecificForm('personal')
            if (personalData) {
                setAnswers(personalData)
                saveAnswers(personalData)
                console.log('✅ Personal data loaded from blockchain')
                // Go to last step to show the filled form
                setCurrentStep(personalSteps.length - 1)
            } else {
                console.log('ℹ️ No personal data found in blockchain')
            }
        } catch (error) {
            console.error('❌ Error loading blockchain data:', error)
            if (error.message.includes('Too many requests')) {
                alert('Muitas requisições. Aguarde alguns segundos e tente novamente.')
            }
        }
    }

    // Verificar dados completos e redirecionar
    const checkCompleteAndRedirect = async () => {
        if (blockchainLoading) {
            console.log('⏳ Blockchain request already in progress, skipping...')
            return
        }

        try {
            const success = await checkAndRedirectIfComplete()
            if (!success) {
                alert('Dados incompletos no blockchain. Use o botão "🔗 Blockchain" para preencher o formulário.')
            }
        } catch (error) {
            console.error('❌ Error checking complete data:', error)
            if (error.message.includes('Too many requests')) {
                alert('Muitas requisições. Aguarde alguns segundos e tente novamente.')
            }
        }
    }

    // Verificar se há novos dados do blockchain no localStorage após carregamento inicial
    useEffect(() => {
        const checkForNewLocalData = () => {
            try {
                const localData = localStorage.getItem('personalOnboardingAnswers');
                if (localData) {
                    const parsedData = JSON.parse(localData);

                    // Se localStorage tem dados mas o formulário está vazio, carregar os dados
                    if (Object.keys(parsedData).length > 0 && Object.keys(answers).length === 0) {
                        console.log('🔄 Found new blockchain data in localStorage, loading into form...');
                        setAnswers(parsedData);
                    }
                }
            } catch (error) {
                console.error('❌ Error checking local data:', error);
            }
        };

        // Verificar periodicamente por novos dados (após carregamento do blockchain)
        const interval = setInterval(checkForNewLocalData, 2000);

        // Verificar imediatamente também
        checkForNewLocalData();

        return () => clearInterval(interval);
    }, [answers]);

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
            // This is the final step - "Complete Discovery"
            console.log('✅ Personal Discovery completed - saving to blockchain!')
            console.log('📊 Final user data:', answers)

            if (isEditMode) {
                saveAnswers(answers)
                setTimeout(() => {
                    navigate('/')
                }, 100)
            } else {
                // Save complete user data to blockchain
                handleSubmit(answers)
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
                        className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-gray-200"
                    />
                )

            case 'select':
                return (
                    <select
                        value={value}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-gray-200"
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
                                    className="w-4 h-4 text-blue-600 border-gray-600 rounded focus:ring-blue-500"
                                />
                                <span className="text-gray-300">{option}</span>
                            </label>
                        ))}
                        <p className="text-sm text-gray-400">
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
                        className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-gray-200 resize-none"
                    />
                )

            default:
                return null
        }
    }

    const currentStepData = personalSteps[currentStep]
    const isCurrentStepComplete = isStepComplete(currentStepData)

    const handleSubmit = (answers) => {
        console.log('📝 Personal onboarding answers:', answers);

        // Use only Clerk user ID - no fallback needed
        const userId = user?.id;
        console.log(`🆔 Using Clerk ID: ${userId}`);

        if (!userId) {
            console.error('❌ No Clerk user ID available');
            return;
        }

        // Save to Hedera blockchain
        businessCoachingService.saveUserProfileToBlockchain(userId, answers)
            .then(response => {
                if (response.success) {
                    console.log('✅ Personal profile saved to blockchain:', response);
                    // Navigate to business onboarding after personal is complete
                    navigate('/onboarding/business', { replace: true });
                } else {
                    console.error('❌ Failed to save personal profile to blockchain:', response.error);
                }
            })
            .catch(error => {
                console.error('❌ Error saving personal profile to blockchain:', error);
            });
    };

    return (
        <div className={`min-h-screen ${gradients.background}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-blue-300">Personal Discovery</h1>
                            {blockchainLoading && (
                                <div className="flex items-center gap-2 text-purple-300 text-sm">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-300"></div>
                                    <span>Loading blockchain data...</span>
                                </div>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={fillBlockchainData}
                                disabled={blockchainLoading}
                                className="bg-purple-900/20 hover:bg-purple-800/30 text-purple-300 border-purple-400 text-xs"
                            >
                                {blockchainLoading ? '⏳' : '🔗'} Load
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={checkCompleteAndRedirect}
                                disabled={blockchainLoading}
                                className="bg-emerald-900/20 hover:bg-emerald-800/30 text-emerald-300 border-emerald-400 text-xs"
                            >
                                {blockchainLoading ? '⏳' : '🏠'} Auto
                            </Button>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={fillTestDataOnly}
                                className="bg-blue-900/20 hover:bg-blue-800/30 text-blue-300 border-blue-400 text-xs"
                            >
                                🧪 Test
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Steps Overview */}
                    <div className="lg:col-span-1">
                        <Card padding="md">
                            <h2 className="text-xl font-bold text-blue-300 mb-6">Your Journey</h2>
                            <div className="space-y-4">
                                {personalSteps.map((step, index) => (
                                    <div
                                        key={step.id}
                                        className={`relative p-4 rounded-xl border-2 transition-all cursor-pointer ${index === currentStep
                                            ? 'bg-blue-900/20 border-blue-400 shadow-lg'
                                            : index < currentStep
                                                ? 'bg-green-900/20 border-green-400'
                                                : 'bg-gray-800/20 border-gray-600'
                                            }`}
                                        onClick={() => setCurrentStep(index)}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${index < currentStep
                                                ? 'bg-green-500 text-white'
                                                : index === currentStep
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-600 text-gray-300'
                                                }`}>
                                                {index < currentStep ? '✓' : step.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className={`font-semibold ${index < currentStep ? 'text-green-300' :
                                                    index === currentStep ? 'text-blue-300' : 'text-gray-400'
                                                    }`}>
                                                    {step.title}
                                                </h3>
                                                <p className="text-sm text-gray-400">{step.subtitle}</p>
                                            </div>
                                        </div>
                                        {index === currentStep && (
                                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
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
                                        <h2 className="text-2xl font-bold text-blue-300">{currentStepData.title}</h2>
                                        <p className="text-gray-400">{currentStepData.subtitle}</p>
                                    </div>
                                </div>
                                <p className="text-gray-300 leading-relaxed">{currentStepData.description}</p>
                            </div>

                            {/* Questions */}
                            <div className="space-y-6 mb-8">
                                {currentStepData.questions.map((question) => (
                                    <div key={question.id} className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-300">
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