import React, { useState } from 'react'
import { ClerkProvider, useAuth, SignedIn, SignedOut, SignIn } from '@clerk/clerk-react'
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom'
import { JourneyManager, PersonalOnboarding, BusinessOnboarding, Header, ProgressPage, ChatPage } from './components'
import { useUserChange } from './hooks/useUserChange'
import { useOnboardingStatus } from './hooks/useOnboardingStatus'
import { useBlockchainOnboarding } from './hooks/useBlockchainOnboarding'

// Clerk publishable key (in production, use environment variable)
const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || 'pk_test_demo_key'

console.log('🔧 App.jsx: Clerk key:', CLERK_PUBLISHABLE_KEY ? 'Configured' : 'Not configured')

// Helper function to check if onboarding is complete
const isOnboardingComplete = () => {
  // For now, always return false to force onboarding
  // In the future, this will check blockchain data
  console.log('🔍 isOnboardingComplete: Always false (blockchain-only mode)')
  return false
}

// Helper function to check which onboarding step to redirect to
const getNextOnboardingStep = () => {
  // For now, always redirect to personal onboarding
  // In the future, this will check blockchain data
  console.log('🔄 getNextOnboardingStep: Always personal onboarding (blockchain-only mode)')
  return '/onboarding/personal'
}

function AppContent() {
  const { isSignedIn, user, isLoaded } = useAuth()
  const { isNewUser, needsOnboarding, resetUserData } = useUserChange()
  const { isComplete, nextStep, loading: onboardingLoading } = useOnboardingStatus()

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

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/auth/sync`, {
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

  // Force onboarding for new users or when data is missing
  React.useEffect(() => {
    if (needsOnboarding) {
      console.log('🔄 Forcing onboarding due to user change or missing data');
      // No need to clear localStorage since we're not using it
    }
  }, [needsOnboarding]);

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

          <Route
            path="/progress"
            element={
              <>
                <SignedIn>
                  <div>
                    <Header />
                    <ProgressPage />
                  </div>
                </SignedIn>
                <SignedOut>
                  <Navigate to="/sign-in" replace />
                </SignedOut>
              </>
            }
          />

          <Route
            path="/chat"
            element={
              <>
                <SignedIn>
                  <div>
                    <Header />
                    <ChatPage />
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
  const { isComplete, nextStep, loading: onboardingLoading } = useOnboardingStatus()
  const { checkAndRedirectIfComplete, fillFormsWithBlockchainData } = useBlockchainOnboarding()

  console.log('🔧 OnboardingRedirect component rendered')
  console.log('🔧 Onboarding status:', { isComplete, nextStep, loading: onboardingLoading })

  React.useEffect(() => {
    if (onboardingLoading) {
      console.log('⏳ Loading onboarding status...');
      return;
    }

    console.log('🔄 OnboardingRedirect useEffect triggered');
    console.log('🔄 isComplete:', isComplete);
    console.log('🔄 nextStep:', nextStep);

    // Verificar blockchain apenas se não tem dados locais
    const checkBlockchainIfNeeded = async () => {
      const personalData = localStorage.getItem('personalOnboardingAnswers');
      const businessData = localStorage.getItem('businessOnboardingAnswers');

      // Se não tem dados locais E dados não estão completos, tentar carregar do blockchain
      if (!isComplete && (!personalData || !businessData)) {
        console.log('🔗 No local data found, checking blockchain for complete data...');

        try {
          const hasCompleteData = await checkAndRedirectIfComplete();
          if (hasCompleteData) {
            console.log('🎉 Complete blockchain data found, redirecting handled by hook');
            return; // Early return, redirect will be handled
          }
        } catch (error) {
          console.log('ℹ️ Blockchain check failed, continuing with normal flow:', error.message);
        }
      }

      // Continue with normal onboarding flow
      if (isComplete) {
        console.log('✅ Onboarding complete, showing dashboard');
        // Don't navigate, just render dashboard
      } else if (nextStep) {
        console.log('🔄 Redirecting to onboarding:', nextStep);
        navigate(nextStep, { replace: true });
      } else {
        console.log('🔄 Defaulting to personal onboarding');
        navigate('/onboarding/personal', { replace: true });
      }
    };

    checkBlockchainIfNeeded();
  }, [isComplete, nextStep, onboardingLoading, navigate, checkAndRedirectIfComplete]);

  // Show loading while checking onboarding status
  if (onboardingLoading) {
    console.log('⏳ Rendering loading state (checking onboarding status)');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking onboarding status...</p>
        </div>
      </div>
    );
  }

  // Show dashboard if onboarding is complete
  if (isComplete) {
    console.log('✅ Rendering dashboard (onboarding complete)');
    return (
      <div>
        <Header />
        <JourneyManager />
      </div>
    );
  }

  // Show loading while redirecting
  console.log('⏳ Rendering loading state (redirecting to onboarding)');
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
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
