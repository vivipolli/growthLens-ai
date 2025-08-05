import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { businessCoachingService } from '../services/businessCoachingService'
import { apiCall } from '../utils/api.js'

export const useDailyMissions = () => {
  const { user } = useUser()
  const [dailyMissions, setDailyMissions] = useState([])

  const [aiInsights, setAiInsights] = useState([])
  const [missionCompletions, setMissionCompletions] = useState([])
  const [error, setError] = useState(null)
  const [lastGenerated, setLastGenerated] = useState(null)
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false)

  // Loading states for individual sections
  const [missionsLoading, setMissionsLoading] = useState(false)
  const [goalsLoading, setGoalsLoading] = useState(false)
  const [insightsLoading, setInsightsLoading] = useState(false)

  // Use Clerk user ID
  const userId = user?.id

  const loadMissionsFromBlockchain = async () => {
    if (!userId) return

    try {
      console.log('🔄 Loading missions from blockchain for:', userId)
      const response = await businessCoachingService.getUserDataFromBlockchain(userId)
      
      if (response.success && response.data) {
        console.log('✅ Loaded data from blockchain:', response.data)
        
        // Extract missions from blockchain data
        const blockchainData = response.data
        
        // Use AI insights from blockchain if available
        if (blockchainData.aiInsights && blockchainData.aiInsights.length > 0) {
          // Filtrar insights por tipo
          const dailyMissionsInsights = blockchainData.aiInsights.filter(
            insight => insight.insightType === 'daily_missions'
          )

          const businessObservationsInsights = blockchainData.aiInsights.filter(
            insight => insight.insightType === 'business_observations'
          )
          
          // Converter insights filtrados para o formato esperado pelos componentes
          if (dailyMissionsInsights.length > 0) {
            const missions = dailyMissionsInsights[0].insights.map((insight, index) => ({
              id: index + 1,
              title: insight.title,
              description: insight.content,
              status: 'pending',
              type: insight.category || 'strategy',
              estimatedTime: insight.timeline || '15-60 min',
              priority: insight.priority || 'medium',
              category: insight.category || 'strategy'
            }))
            setDailyMissions(missions)
          }
          

          
          // Manter apenas business observations para AIInsights
          setAiInsights(businessObservationsInsights)
        }
        
        // Extract mission completions from blockchain data
        if (blockchainData.missionCompletions && blockchainData.missionCompletions.length > 0) {
          console.log('✅ Loaded mission completions from blockchain:', blockchainData.missionCompletions.length)
          setMissionCompletions(blockchainData.missionCompletions)
        }
        
        // For now, we'll still use the API for daily missions
        // as they are generated dynamically by AI
        console.log('📊 Blockchain data loaded:', {
          userProfile: !!blockchainData.userProfile,
          businessData: !!blockchainData.businessData,
          aiInsights: blockchainData.aiInsights?.length || 0,
          missionCompletions: blockchainData.missionCompletions?.length || 0
        })
      }
    } catch (error) {
      console.error('❌ Error loading blockchain data:', error)
    }
  }

  // Generate Daily Missions
  const generateDailyMissions = async () => {
    if (!user?.id) {
      setError('Please complete your onboarding first')
      return
    }

    setMissionsLoading(true)
    setError(null)

    try {
      console.log('🎯 Generating daily missions...')
      const response = await businessCoachingService.generateDailyMissions(user?.id)
      
      console.log('📥 Daily missions API Response:', response)

      let responseData = response
      if (response.success && response.data) {
        responseData = response.data
      } else if (response.insights) {
        responseData = response
      }

      if (responseData && responseData.insights) {
        console.log('✅ Daily missions generated successfully:', responseData)
        
        const insights = responseData.insights || []
        console.log('📊 Converting insights to missions:', insights.length)
        
        const missions = insights.map((insight, index) => ({
          id: index + 1,
          title: insight.title,
          description: insight.content,
          status: 'pending',
          type: insight.category || 'strategy',
          estimatedTime: insight.timeline || '15-60 min',
          priority: insight.priority || 'medium',
          category: insight.category || 'strategy'
        }))
        
        console.log('🎯 Setting missions:', missions.length)
        setDailyMissions(missions)
        setLastGenerated(new Date().toISOString())
      } else {
        console.error('❌ Invalid daily missions response format:', responseData)
        setError('Invalid response format from daily missions API')
      }
    } catch (error) {
      console.error('❌ Error generating daily missions:', error)
      setError(error.message || 'Failed to generate daily missions')
    } finally {
      setMissionsLoading(false)
    }
  }



  // Generate Business Observations
  const generateBusinessObservations = async () => {
    if (!user?.id) {
      setError('Please complete your onboarding first')
      return
    }

    setInsightsLoading(true)
    setError(null)

    try {
      console.log('💡 Generating business observations...')
      const response = await businessCoachingService.generateBusinessObservations()
      
      console.log('📥 Business observations API Response:', response)

      let responseData = response
      if (response.success && response.data) {
        responseData = response.data
      } else if (response.insights) {
        responseData = response
      }

      if (responseData && responseData.insights) {
        console.log('✅ Business observations generated successfully:', responseData)
        
        const insights = responseData.insights || []
        console.log('📊 Setting business observations:', insights.length)
        
        setAiInsights(insights)
        setLastGenerated(new Date().toISOString())
      } else {
        console.error('❌ Invalid business observations response format:', responseData)
        setError('Invalid response format from business observations API')
      }
    } catch (error) {
      console.error('❌ Error generating business observations:', error)
      setError(error.message || 'Failed to generate business observations')
    } finally {
      setInsightsLoading(false)
    }
  }

  // Generate all data (for initial load)
  const generateAllData = async () => {
    if (!user?.id) {
      setError('Please complete your onboarding first')
      return
    }

    setError(null)
    setHasAttemptedLoad(true)

    try {
      console.log('🔄 Generating all data...')
      
      // Generate all sections in parallel
      await Promise.all([
        generateDailyMissions(),
        generateBusinessObservations()
      ])
      
      console.log('✅ All data generated successfully')
    } catch (error) {
      console.error('❌ Error generating all data:', error)
      setError(error.message || 'Failed to generate data')
    }
  }

  // Helper functions for mission counts
  const getCompletedMissionsCount = () => {
    return dailyMissions.filter(mission => mission.status === 'completed').length
  }

  const getTotalMissionsCount = () => {
    return dailyMissions.length
  }

  const completeMission = (missionId) => {
    setDailyMissions(prevMissions => 
      prevMissions.map(mission => 
        mission.id === missionId 
          ? { ...mission, status: 'completed' }
          : mission
      )
    )
  }



  const clearCache = () => {
    setDailyMissions([])

    setAiInsights([])
    setError(null)
    console.log('🗑️ Cache cleared')
  }

  useEffect(() => {
    // Load blockchain data first
    loadMissionsFromBlockchain()
    
    // Set hasAttemptedLoad to true since we're not auto-generating
    setHasAttemptedLoad(true)
    
    // Don't auto-generate data - let user click individual refresh buttons
    console.log('🔄 Hook: Blockchain data loaded, ready for individual generation')
  }, [user?.id])

  return {
    dailyMissions,
    aiInsights,
    missionCompletions,
    error,
    lastGenerated,
    hasAttemptedLoad,
    // Individual loading states
    missionsLoading,
    goalsLoading,
    insightsLoading,
    // Individual refresh functions
    generateDailyMissions,

    generateBusinessObservations,
    // Legacy functions for compatibility
    generateMissions: generateAllData,
    generateAIMissions: generateAllData,
    refreshMissions: generateAllData,
    getCompletedMissionsCount,
    getTotalMissionsCount,
    completeMission,

    clearCache
  }
} 