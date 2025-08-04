import { useState, useEffect } from 'react'
import { useTheme } from '../hooks/useTheme'
import { Card, StepItem, AIMentor, Button } from './index'
import { useNavigate } from 'react-router-dom'
import { businessCoachingService } from '../services/businessCoachingService'

const BusinessOnboarding = ({ onComplete, personalData, initialAnswers = {}, isEditMode = false }) => {
    const [currentStep, setCurrentStep] = useState(0)
    const [completedSteps, setCompletedSteps] = useState([])
    const [answers, setAnswers] = useState(() => {
        // Always try to load from localStorage first
        try {
            const data = localStorage.getItem('businessOnboardingAnswers')
            if (data) {
                const parsedData = JSON.parse(data)
                console.log('📂 Loaded business data from localStorage:', parsedData)
                return parsedData
            }
        } catch (error) {
            console.error('❌ Error loading business data from localStorage:', error)
        }

        // Fallback to initialAnswers or empty object
        return initialAnswers || {}
    })
    const { gradients } = useTheme()
    const navigate = useNavigate()

    // Test data for auto-fill
    const testData = {
        industry: "Digital Marketing",
        age_range: "26-35 years old",
        gender: "Mixed gender",
        income_level: "Middle class ($50k-$80k/year)",
        education_level: "Bachelor's degree",
        location: "São Paulo, Brazil and remote workers worldwide",
        pain_points: "My ideal customers struggle with creating consistent content for their social media, feeling overwhelmed by the constant need to post engaging content. They lack the design skills to create professional-looking posts and often feel like their content gets lost in the noise. Many work long hours and don't have time to learn complex design tools or stay up-to-date with social media trends.",
        goals_aspirations: "They want to build a strong online presence that attracts their ideal clients, create content that feels authentic to their brand, and develop a system that saves them time while increasing engagement. Their dream is to have a social media presence that works for them 24/7, bringing in leads and sales while they focus on serving their clients.",
        competitor_profiles: [
            {
                name: "@socialmediacreator",
                link: "https://instagram.com/socialmediacreator"
            },
            {
                name: "@contentqueenbr",
                link: "https://instagram.com/contentqueenbr"
            },
            {
                name: "@designforbusiness",
                link: "https://instagram.com/designforbusiness"
            }
        ],
        engaging_content_aspects: "The most engaging content from competitors includes behind-the-scenes stories that show the person behind the brand, step-by-step tutorials with clear visual instructions, before-and-after transformations that show real results, user-generated content that builds community, and interactive content like polls and Q&As that encourage participation.",
        visual_communication_style: "I love the clean, minimalist aesthetic with consistent color palettes (lots of soft pastels and earth tones), the use of consistent fonts and layouts that create a cohesive brand look, carousel posts that tell a story across multiple slides, and the strategic use of white space to make content feel premium and easy to read.",
        competitive_gaps: "Most competitors focus only on Instagram, missing opportunities on other platforms. Many don't offer personalized solutions for different industries. There's a lack of content addressing the specific challenges of Brazilian entrepreneurs, and most don't provide ongoing support after selling templates or courses.",
        main_offer: "I offer a comprehensive social media content creation service that includes: custom Instagram templates designed for each client's brand, a monthly content calendar with strategic post ideas, engagement-boosting caption formulas, and one-on-one coaching sessions to help clients develop their unique voice and style.",
        pricing_strategy: "Value-based pricing (based on customer value)",
        unique_benefits: "Clients get a complete brand transformation within 30 days, save 10+ hours per week on content creation, see a 150% increase in engagement within 60 days, develop confidence in their online presence, and gain access to a supportive community of like-minded entrepreneurs.",
        has_visual_identity: "I have some elements but need to organize them",
        has_content_templates: "I have some templates but need more",
        has_website: "I have a basic website that needs improvement",
        visual_identity_notes: "I have a logo and some brand colors, but I need to create a comprehensive brand guide with typography, color variations, and templates. My website needs a complete redesign to better reflect my services and convert visitors into clients."
    }

    const fillTestData = () => {
        setAnswers(testData)
        saveAnswers(testData)
        // Mark all steps as completed for testing
        const allStepIds = journeySteps.map(step => step.id)
        setCompletedSteps(allStepIds)
        // Go to last step to see completion screen
        setCurrentStep(journeySteps.length - 1)
    }

    const fillTestDataOnly = () => {
        setAnswers(testData)
        saveAnswers(testData)
    }

    const saveAnswers = (answers) => {
        // Save to localStorage for now
        localStorage.setItem('businessOnboardingAnswers', JSON.stringify(answers))
        console.log('💾 Saved business data to localStorage:', answers)

        // Save to blockchain
        try {
            const userId = personalData?.name || 'anonymous'
            businessCoachingService.saveBusinessDataToBlockchain(userId, answers)
                .then(response => {
                    if (response.success) {
                        console.log('✅ Business data saved to blockchain:', response)
                        if (response.transactionId) {
                            console.log(`🔗 HashScan URL: ${response.hashscanUrl}`)
                        }
                    }
                })
                .catch(error => {
                    console.error('❌ Failed to save business data to blockchain:', error)
                })
        } catch (error) {
            console.error('❌ Error saving to blockchain:', error)
        }

        // Future: send to AI agent or blockchain here
        // Example:
        // sendToAIAgent(answers)
        // saveToBlockchain(answers)
    }

    const journeySteps = [
        {
            id: 1,
            title: "Discover Your Niche",
            subtitle: "Identify your ideal customer persona",
            description: "Let's create a detailed profile of your ideal customer. Understanding who you serve is the foundation of any successful business.",
            icon: "🎯",
            status: "active",
            estimatedTime: "15-20 min",
            questions: [
                {
                    id: "industry",
                    type: "select",
                    label: "What industry or field are you in?",
                    options: [
                        "Digital Marketing",
                        "Health & Wellness",
                        "Technology",
                        "Education",
                        "Finance",
                        "Creative Arts",
                        "Consulting",
                        "E-commerce",
                        "Real Estate",
                        "Fitness",
                        "Other"
                    ],
                    required: true
                },
                {
                    id: "age_range",
                    type: "select",
                    label: "What's the age range of your ideal customer?",
                    options: [
                        "18-25 years old",
                        "26-35 years old",
                        "36-45 years old",
                        "46-55 years old",
                        "55+ years old",
                        "Multiple age ranges"
                    ],
                    required: true
                },
                {
                    id: "gender",
                    type: "select",
                    label: "What's the primary gender of your target audience?",
                    options: [
                        "Primarily women",
                        "Primarily men",
                        "Mixed gender",
                        "Non-binary inclusive",
                        "All genders"
                    ],
                    required: true
                },
                {
                    id: "income_level",
                    type: "select",
                    label: "What's the income level of your ideal customer?",
                    options: [
                        "Low income (under $30k/year)",
                        "Lower middle class ($30k-$50k/year)",
                        "Middle class ($50k-$80k/year)",
                        "Upper middle class ($80k-$120k/year)",
                        "High income ($120k+/year)",
                        "Mixed income levels"
                    ],
                    required: true
                },
                {
                    id: "education_level",
                    type: "select",
                    label: "What's the education level of your target audience?",
                    options: [
                        "High school or less",
                        "Some college",
                        "Bachelor's degree",
                        "Master's degree",
                        "PhD or higher",
                        "Mixed education levels"
                    ],
                    required: true
                },
                {
                    id: "location",
                    type: "text",
                    label: "Where are your ideal customers located?",
                    placeholder: "Enter specific cities, countries, or regions (e.g., São Paulo, Brazil, North America, Online)",
                    required: true
                },
                {
                    id: "pain_points",
                    type: "textarea",
                    label: "What are the main challenges and frustrations your ideal customer faces?",
                    placeholder: "List their biggest problems, obstacles, fears, and pain points in their personal or professional life...",
                    required: true
                },
                {
                    id: "goals_aspirations",
                    type: "textarea",
                    label: "What are your ideal customer's goals and aspirations?",
                    placeholder: "What do they want to achieve? What are their dreams? What success looks like to them...",
                    required: true
                },
            ]
        },
        {
            id: 2,
            title: "Competitor Analysis",
            subtitle: "Study your market and identify opportunities",
            description: "Research and analyze your competitors to understand their strategies, identify gaps in the market, and find opportunities to differentiate your brand.",
            icon: "🔍",
            status: "locked",
            estimatedTime: "20-25 min",
            questions: [
                {
                    id: "competitor_research_intro",
                    type: "info",
                    label: "🔍 Competitive Analysis Research",
                    content: "Before answering the questions below, please take some time to research your competitors online. Look at their social media profiles, websites, and content to understand their approach. This will help you identify opportunities and differentiate your brand effectively.",
                    required: false
                },
                {
                    id: "competitor_profiles",
                    type: "dynamic_list",
                    label: "List the Instagram profiles you identified as relevant for analysis.",
                    placeholder: "Add competitor profiles with name and link",
                    fields: [
                        { id: "name", label: "Profile Name", type: "text", placeholder: "Enter profile name" },
                        { id: "link", label: "Profile Link", type: "text", placeholder: "Enter Instagram profile URL" }
                    ],
                    required: true
                },
                {
                    id: "engaging_content_aspects",
                    type: "textarea",
                    label: "What aspects of your competitors' content do you find most engaging and why?",
                    placeholder: "Analyze what makes their content work: post type, tone of voice, frequency, topics covered, video/photo format...",
                    required: true
                },
                {
                    id: "visual_communication_style",
                    type: "textarea",
                    label: "Is there any visual element or communication style you would like to adapt for your profile?",
                    placeholder: "Think about colors, typography, layout, photo style, filters, visual patterns that caught your attention...",
                    required: true
                },
                {
                    id: "competitive_gaps",
                    type: "textarea",
                    label: "What differentiators or gaps did you identify in the analyzed profiles that could be explored in your content?",
                    placeholder: "What's missing? What opportunities do you see? What niches are not being adequately served?",
                    required: true
                }
            ]
        },
        {
            id: 3,
            title: "Launch Your Offer",
            subtitle: "Create irresistible value propositions",
            description: "Develop and launch your first digital product or service. Learn pricing strategies and launch techniques that drive sales.",
            icon: "🚀",
            status: "locked",
            estimatedTime: "25-30 min",
            questions: [
                {
                    id: "main_offer",
                    type: "textarea",
                    label: "What's your main product or service? Describe it in detail.",
                    placeholder: "What are you selling? How does it solve your customer's problems?",
                    required: true
                },
                {
                    id: "pricing_strategy",
                    type: "select",
                    label: "What's your pricing strategy?",
                    options: [
                        "Premium pricing (high value, high price)",
                        "Competitive pricing (market average)",
                        "Penetration pricing (low price to enter market)",
                        "Value-based pricing (based on customer value)",
                        "Freemium model (free + paid tiers)"
                    ],
                    required: true
                },
                {
                    id: "unique_benefits",
                    type: "textarea",
                    label: "What are the unique benefits and results your customers get?",
                    placeholder: "List the specific outcomes and transformations you deliver...",
                    required: true
                }
            ]
        },
        {
            id: 4,
            title: "Visual Identity Check",
            subtitle: "Assess your current digital presence",
            description: "Let's check what visual identity elements you already have in place. This will help us determine your next steps.",
            icon: "🎨",
            status: "locked",
            estimatedTime: "5-10 min",
            questions: [
                {
                    id: "has_visual_identity",
                    type: "select",
                    label: "Do you already have a defined visual identity (colors, fonts, style)?",
                    options: [
                        "Yes, I have a complete visual identity",
                        "I have some elements but need to organize them",
                        "No, I need to create from scratch"
                    ],
                    required: true
                },
                {
                    id: "has_content_templates",
                    type: "select",
                    label: "Do you have templates or a system for creating social media posts?",
                    options: [
                        "Yes, I have templates and a content system",
                        "I have some templates but need more",
                        "No, I create posts spontaneously"
                    ],
                    required: true
                },
                {
                    id: "has_website",
                    type: "select",
                    label: "Do you have a professional website?",
                    options: [
                        "Yes, I have a complete website",
                        "I have a basic website that needs improvement",
                        "No, I don't have a website yet"
                    ],
                    required: true
                },
                {
                    id: "visual_identity_notes",
                    type: "textarea",
                    label: "Any additional notes about your current visual identity status:",
                    placeholder: "Describe what you have, what you need, or any specific challenges...",
                    required: false
                }
            ]
        }
    ]

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
        // If the step is optional, it's always considered complete
        if (step.optional) return true

        return step.questions.every(question => {
            // Skip info type questions as they are not inputs
            if (question.type === 'info') return true

            const answer = answers[question.id]
            if (question.required && !answer) return false

            if (question.type === 'multiselect' && question.maxSelections) {
                return answer && answer.length >= question.maxSelections
            }

            if (question.type === 'dynamic_list') {
                return answer && Array.isArray(answer) && answer.length > 0
            }

            return true
        })
    }

    const handleStepComplete = (stepId) => {
        setCompletedSteps([...completedSteps, stepId])
        if (currentStep < journeySteps.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            saveAnswers(answers)
            const hasCompleteVisualIdentity = answers.has_visual_identity === "Yes, I have a complete visual identity" &&
                answers.has_content_templates === "Yes, I have templates and a content system" &&
                answers.has_website === "Yes, I have a complete website"

            if (onComplete && typeof onComplete === 'function') {
                onComplete({
                    completedSteps: [...completedSteps, stepId],
                    totalSteps: journeySteps.length,
                    answers: answers,
                    hasCompleteVisualIdentity: hasCompleteVisualIdentity
                })
            }
        }
    }

    const getStepStatus = (step) => {
        if (completedSteps.includes(step.id)) return "completed"
        if (step.id === journeySteps[currentStep].id) return "active"
        return "locked"
    }

    const handleStartSession = () => {
        console.log('Starting AI session...')
    }

    const handleLearnMore = () => {
        console.log('Learn more about AI mentor...')
    }

    const renderQuestion = (question) => {
        const value = answers[question.id] || ''

        switch (question.type) {
            case 'info':
                return (
                    <div className="bg-blue-900/20 border border-blue-400 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                            <div className="text-blue-400 text-lg">💡</div>
                            <div>
                                <h4 className="font-medium text-blue-300 mb-2">{question.label}</h4>
                                <p className="text-gray-300 text-sm leading-relaxed">{question.content}</p>
                            </div>
                        </div>
                    </div>
                )

            case 'dynamic_list':
                const listItems = Array.isArray(value) ? value : []

                const addItem = () => {
                    const newItem = {}
                    question.fields.forEach(field => {
                        newItem[field.id] = ''
                    })
                    handleAnswerChange(question.id, [...listItems, newItem])
                }

                const removeItem = (index) => {
                    const newItems = listItems.filter((_, i) => i !== index)
                    handleAnswerChange(question.id, newItems)
                }

                const updateItem = (index, fieldId, fieldValue) => {
                    const newItems = [...listItems]
                    newItems[index] = { ...newItems[index], [fieldId]: fieldValue }
                    handleAnswerChange(question.id, newItems)
                }

                return (
                    <div className="space-y-4">
                        {listItems.map((item, index) => (
                            <div key={index} className="border border-gray-600 rounded-lg p-4 bg-gray-800/20">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-blue-300">Profile {index + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => removeItem(index)}
                                        className="text-red-400 hover:text-red-300 text-sm font-medium"
                                    >
                                        Remove
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {question.fields.map((field) => (
                                        <div key={field.id}>
                                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                                {field.label}
                                            </label>
                                            <input
                                                type="text"
                                                value={item[field.id] || ''}
                                                onChange={(e) => updateItem(index, field.id, e.target.value)}
                                                placeholder={field.placeholder}
                                                className="w-full px-3 py-2 border border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-800 text-gray-200"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addItem}
                            className="w-full py-3 px-4 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-blue-400 hover:text-blue-400 transition-colors"
                        >
                            + Add Competitor Profile
                        </button>
                    </div>
                )

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

    // Show completion screen when all steps are done
    if (completedSteps.length === journeySteps.length) {
        const hasCompleteVisualIdentity = answers.has_visual_identity === "Yes, I have a complete visual identity" &&
            answers.has_content_templates === "Yes, I have templates and a content system" &&
            answers.has_website === "Yes, I have a complete website"

        return (
            <div className={`min-h-screen ${gradients.background}`}>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                    <Card className="text-center">
                        <div className="mb-8">
                            <div className={`w-24 h-24 ${gradients.primary} rounded-full flex items-center justify-center mx-auto mb-6`}>
                                <span className="text-white text-4xl">🎉</span>
                            </div>
                            <h1 className="text-3xl font-bold text-blue-300 mb-4">Business Setup Complete!</h1>
                            <p className="text-xl text-gray-400 mb-6">
                                You've successfully set up your digital business foundation. Your AI mentor is ready to guide you through your daily success path.
                            </p>
                        </div>

                        {hasCompleteVisualIdentity ? (
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 mb-8">
                                <h2 className="text-xl font-bold text-blue-300 mb-4">🎨 Visual Identity Complete!</h2>
                                <p className="text-gray-300 mb-4">
                                    Great! You already have a complete visual identity, content templates, and website. You're ready to start your daily growth journey.
                                </p>
                                <div className="bg-gray-800 rounded-lg p-4 border border-green-400">
                                    <h3 className="font-semibold text-blue-300 mb-2">What's Next?</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                <span className="text-2xl">📱</span>
                                            </div>
                                            <h4 className="font-semibold text-blue-300 mb-2">Daily Missions</h4>
                                            <p className="text-sm text-gray-400">Complete daily tasks to grow your business</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                <span className="text-2xl">🤖</span>
                                            </div>
                                            <h4 className="font-semibold text-blue-300 mb-2">Business Observations</h4>
                                            <p className="text-sm text-gray-400">Get personalized recommendations based on your data</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                <span className="text-2xl">📈</span>
                                            </div>
                                            <h4 className="font-semibold text-blue-300 mb-2">Track Progress</h4>
                                            <p className="text-sm text-gray-400">Monitor your growth and celebrate achievements</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 rounded-xl p-6 mb-8">
                                <h2 className="text-xl font-bold text-blue-300 mb-4">🎨 Visual Identity Setup Needed</h2>
                                <p className="text-gray-300 mb-4">
                                    You've completed the business foundation! Now let's create your visual identity to complete your digital presence.
                                </p>
                                <div className="bg-gray-800 rounded-lg p-4 border border-blue-400">
                                    <h3 className="font-semibold text-blue-300 mb-2">Visual Identity Creation Includes:</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                <span className="text-2xl">🎨</span>
                                            </div>
                                            <h4 className="font-semibold text-blue-300 mb-2">Color Palette</h4>
                                            <p className="text-sm text-gray-400">Create your brand colors and visual style</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                <span className="text-2xl">📝</span>
                                            </div>
                                            <h4 className="font-semibold text-blue-300 mb-2">Content Templates</h4>
                                            <p className="text-sm text-gray-400">Design templates for social media posts</p>
                                        </div>
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                                                <span className="text-2xl">🌐</span>
                                            </div>
                                            <h4 className="font-semibold text-blue-300 mb-2">Website Setup</h4>
                                            <p className="text-sm text-gray-400">Create your professional website</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex space-x-4 justify-center">
                            {isEditMode ? (
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={() => {
                                        saveAnswers(answers);
                                        if (onComplete && typeof onComplete === 'function') {
                                            onComplete(answers);
                                        }
                                    }}
                                >
                                    Save
                                </Button>
                            ) : hasCompleteVisualIdentity ? (
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={() => {
                                        saveAnswers(answers);
                                        if (onComplete && typeof onComplete === 'function') {
                                            onComplete({
                                                completedSteps: completedSteps,
                                                totalSteps: journeySteps.length,
                                                answers: answers,
                                                hasCompleteVisualIdentity: true
                                            });
                                        }
                                    }}
                                >
                                    Start Your Daily Journey
                                </Button>
                            ) : (
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={() => {
                                        saveAnswers(answers);
                                        if (onComplete && typeof onComplete === 'function') {
                                            onComplete({
                                                completedSteps: completedSteps,
                                                totalSteps: journeySteps.length,
                                                answers: answers,
                                                hasCompleteVisualIdentity: false
                                            });
                                        }
                                    }}
                                >
                                    Create Visual Identity
                                </Button>
                            )}
                            <Button
                                variant="secondary"
                                size="lg"
                                onClick={() => setCompletedSteps([])}
                            >
                                Review Setup
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        )
    }

    const currentStepData = journeySteps[currentStep]
    const isCurrentStepComplete = isStepComplete(currentStepData)

    return (
        <div className={`min-h-screen ${gradients.background}`}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h1 className="text-2xl font-bold text-blue-300">Business Journey</h1>
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
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Steps Overview */}
                    <div className="lg:col-span-1">
                        <Card padding="md">
                            <h2 className="text-xl font-bold text-blue-300 mb-6">Your Journey</h2>
                            <div className="space-y-4">
                                {journeySteps.map((step, index) => (
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
                                    onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
                                    disabled={currentStep === 0}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="primary"
                                    size="lg"
                                    onClick={() => handleStepComplete(currentStepData.id)}
                                    disabled={!isCurrentStepComplete}
                                >
                                    {currentStep === journeySteps.length - 1 ? 'Complete Journey' : 'Next Step'}
                                </Button>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default BusinessOnboarding 