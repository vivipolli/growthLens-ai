import React, { useState } from 'react'
import { ClerkProvider, useAuth, SignedIn, SignedOut, SignIn } from '@clerk/clerk-react'
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { JourneyManager, PersonalOnboarding, BusinessOnboarding, Header } from './components'

// Clerk publishable key (in production, use environment variable)
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_demo_key'

console.log('🔧 App.jsx: Starting application...')
console.log('🔧 App.jsx: Clerk key:', CLERK_PUBLISHABLE_KEY ? 'Configured' : 'Not configured')

// Helper function to check if onboarding is complete
const isOnboardingComplete = () => {
  try {
    const personal = localStorage.getItem('personalOnboardingAnswers')
    const business = localStorage.getItem('businessOnboardingAnswers')

    console.log('🔍 isOnboardingComplete check:')
    console.log('🔍 personalOnboardingAnswers:', personal)
    console.log('🔍 businessOnboardingAnswers:', business)
    console.log('🔍 personal exists:', !!personal)
    console.log('🔍 business exists:', !!business)

    // Check if the data is valid JSON and not empty
    let personalValid = false
    let businessValid = false

    if (personal) {
      try {
        const personalData = JSON.parse(personal)
        personalValid = personalData && Object.keys(personalData).length > 0
        console.log('🔍 personal data valid:', personalValid)
      } catch (e) {
        console.log('🔍 personal data invalid JSON')
      }
    }

    if (business) {
      try {
        const businessData = JSON.parse(business)
        businessValid = businessData && Object.keys(businessData).length > 0
        console.log('🔍 business data valid:', businessValid)
      } catch (e) {
        console.log('🔍 business data invalid JSON')
      }
    }

    const result = personalValid && businessValid
    console.log('🔍 Final result - onboarding complete:', result)
    return result
  } catch (error) {
    console.error('❌ Error checking onboarding completion:', error)
    return false
  }
}

// Helper function to check which onboarding step to redirect to
const getNextOnboardingStep = () => {
  try {
    const personal = localStorage.getItem('personalOnboardingAnswers')
    const business = localStorage.getItem('businessOnboardingAnswers')

    console.log('🔍 getNextOnboardingStep check:')
    console.log('🔍 personalOnboardingAnswers:', personal)
    console.log('🔍 businessOnboardingAnswers:', business)

    // Check if personal onboarding is complete
    let personalComplete = false
    if (personal) {
      try {
        const personalData = JSON.parse(personal)
        personalComplete = personalData && Object.keys(personalData).length > 0
      } catch (e) {
        console.log('🔍 personal data invalid JSON')
      }
    }

    // Check if business onboarding is complete
    let businessComplete = false
    if (business) {
      try {
        const businessData = JSON.parse(business)
        businessComplete = businessData && Object.keys(businessData).length > 0
      } catch (e) {
        console.log('🔍 business data invalid JSON')
      }
    }

    console.log('🔍 personalComplete:', personalComplete)
    console.log('🔍 businessComplete:', businessComplete)

    if (!personalComplete) {
      console.log('🔄 Redirecting to personal onboarding')
      return '/onboarding/personal'
    }
    if (!businessComplete) {
      console.log('🔄 Redirecting to business onboarding')
      return '/onboarding/business'
    }
    console.log('✅ Both onboarding steps complete')
    return null // Both completed
  } catch (error) {
    console.error('❌ Error getting next onboarding step:', error)
    return '/onboarding/personal'
  }
}

function AppContent() {
  const { isSignedIn, user, isLoaded } = useAuth()

  console.log('🔧 AppContent: Component rendered')
  console.log('🔧 AppContent: isLoaded:', isLoaded)
  console.log('🔧 AppContent: isSignedIn:', isSignedIn)
  console.log('🔧 AppContent: user:', user)

  const syncWithBackend = async () => {
    try {
      console.log('🔄 Starting backend sync...')
      console.log('🔄 isSignedIn:', isSignedIn)
      console.log('🔄 user:', user)

      if (isSignedIn && user) {
        console.log('✅ User is signed in and available')

        // Prepare user data to send to backend
        const userData = {
          id: user.id,
          emailAddresses: user.emailAddresses,
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
          createdAt: user.createdAt
        }

        console.log('👤 User data to sync:', userData)

        const response = await fetch('http://localhost:3001/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userData })
        })

        console.log('📡 Response status:', response.status)
        const data = await response.json()
        console.log('📡 Backend response:', data)

        if (data.success) {
          console.log('✅ User synced with backend:', data.data.user.hederaAccountId)
          localStorage.setItem('appToken', data.data.token)
          localStorage.setItem('userId', data.data.user.id)
        } else {
          console.error('❌ Backend sync failed:', data.error)
        }
      } else {
        console.log('❌ User not signed in or not available')
      }
    } catch (error) {
      console.error('❌ Sync failed:', error)
      console.error('❌ Error details:', error.message)
    }
  }

  // Sync with backend when user signs in
  React.useEffect(() => {
    console.log('🔄 useEffect triggered - isLoaded:', isLoaded, 'isSignedIn:', isSignedIn, 'user:', !!user)

    if (isLoaded && isSignedIn && user) {
      console.log('✅ Conditions met for sync')
      syncWithBackend()
    } else {
      console.log('❌ Conditions not met for sync')
    }
  }, [isLoaded, isSignedIn, user])

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* Public routes - authentication handled by Clerk */}
          <Route
            path="/sign-in"
            element={
              <SignedOut>
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                  <SignIn />
                </div>
              </SignedOut>
            }
          />

          {/* Protected routes - authentication required */}
          <Route
            path="/"
            element={
              <>
                <SignedIn>
                  <OnboardingRedirect />
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            }
          />

          <Route
            path="/onboarding/personal"
            element={
              <>
                <SignedIn>
                  <div>
                    <Header />
                    <PersonalOnboardingWrapper />
                  </div>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            }
          />

          <Route
            path="/onboarding/business"
            element={
              <>
                <SignedIn>
                  <div>
                    <Header />
                    <BusinessOnboardingWrapper />
                  </div>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            }
          />

          {/* Redirect unauthenticated users to sign-in */}
          <Route
            path="*"
            element={
              <SignedOut>
                <Navigate to="/sign-in" replace />
              </SignedOut>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

function PersonalOnboardingWrapper() {
  const navigate = useNavigate()

  const handleComplete = (data) => {
    console.log('Personal onboarding completed:', data)
    // Check if business onboarding is also complete
    const business = localStorage.getItem('businessOnboardingAnswers')
    if (business) {
      navigate('/', { replace: true })
    } else {
      navigate('/onboarding/business', { replace: true })
    }
  }

  return <PersonalOnboarding isEditMode={false} onComplete={handleComplete} />
}

function BusinessOnboardingWrapper() {
  const navigate = useNavigate()

  const handleComplete = (data) => {
    console.log('Business onboarding completed:', data)
    // Both onboarding steps are complete, go to dashboard
    navigate('/', { replace: true })
  }

  return <BusinessOnboarding isEditMode={false} onComplete={handleComplete} />
}

function OnboardingRedirect() {
  const navigate = useNavigate()

  console.log('🔧 OnboardingRedirect component rendered')
  console.log('🔧 Current user state - isLoaded: true, isSignedIn: true')

  React.useEffect(() => {
    console.log('🔄 OnboardingRedirect useEffect triggered')
    const nextStep = getNextOnboardingStep()
    console.log('🔄 nextStep determined:', nextStep)

    if (nextStep) {
      console.log('🔄 Redirecting to onboarding:', nextStep)
      navigate(nextStep, { replace: true })
    } else {
      console.log('✅ Onboarding complete, showing dashboard')
    }
  }, [navigate])

  // Show dashboard if onboarding is complete
  if (isOnboardingComplete()) {
    console.log('✅ Rendering dashboard (onboarding complete)')
    return (
      <div>
        <Header />
        <JourneyManager />
      </div>
    )
  }

  // Show loading while redirecting
  console.log('⏳ Rendering loading state (redirecting to onboarding)')
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

function App() {
  console.log('🔧 App: Component rendered')

  if (!CLERK_PUBLISHABLE_KEY || CLERK_PUBLISHABLE_KEY === 'pk_test_demo_key') {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Configuration Error</h1>
          <p className="text-red-600">Clerk publishable key not configured properly.</p>
          <p className="text-sm text-red-500 mt-2">Check your .env file</p>
        </div>
      </div>
    )
  }

  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
      <AppContent />
    </ClerkProvider>
  )
}

export default App
