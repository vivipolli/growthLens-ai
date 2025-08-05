import { apiCall, apiEndpoints } from '../utils/api.js';
import { getUserProfile } from '../utils/userProfile.js';

// Helper function to get user profile with Clerk ID
const getUserProfileWithClerkId = (clerkUserId = null) => {
  const userProfile = getUserProfile();
  
  if (!userProfile) {
    return null;
  }

  // Try to get Clerk user ID from global window object if not provided
  if (!clerkUserId && typeof window !== 'undefined' && window.__CLERK_USER_ID__) {
    clerkUserId = window.__CLERK_USER_ID__;
  }

  // Add clerkId to the profile
  return {
    ...userProfile,
    clerkId: clerkUserId
  };
};

export const businessCoachingService = {
  // Daily Missions API
  async generateDailyMissions(clerkUserId = null) {
    console.log('🎯 generateDailyMissions service called');
    const userProfile = getUserProfileWithClerkId(clerkUserId);
    
    if (!userProfile) {
      console.error('❌ User profile not found');
      throw new Error('User profile not found. Please complete your onboarding first.');
    }

    console.log('✅ User profile found:', userProfile);
    console.log('🆔 Clerk User ID:', userProfile.clerkId);

    const payload = {
      userProfile
    };

    console.log('📡 Making API call to daily-missions');
    console.log('📤 Payload:', payload);

    try {
      const response = await apiCall('/api/business/daily-missions', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      console.log('📥 Daily missions API response received:', response);
      return response;
    } catch (error) {
      console.error('❌ Daily missions API call failed:', error);
      throw error;
    }
  },

  // Business Observations API
  async generateBusinessObservations(clerkUserId = null) {
    console.log('💡 generateBusinessObservations service called');
    const userProfile = getUserProfileWithClerkId(clerkUserId);
    
    if (!userProfile) {
      console.error('❌ User profile not found');
      throw new Error('User profile not found. Please complete your onboarding first.');
    }

    console.log('✅ User profile found for business observations:', userProfile);

    const payload = {
      userProfile
    };

    console.log('📡 Making API call for business observations');

    try {
      const response = await apiCall('/api/business/business-observations', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      console.log('📥 Business observations API response received:', response);
      return response;
    } catch (error) {
      console.error('❌ Business observations API call failed:', error);
      throw error;
    }
  },

  async generatePersonalizedInsights(clerkUserId = null) {
    console.log('💡 generatePersonalizedInsights service called');
    const userProfile = getUserProfileWithClerkId(clerkUserId);
    
    if (!userProfile) {
      console.error('❌ User profile not found');
      throw new Error('User profile not found. Please complete your onboarding first.');
    }

    console.log('✅ User profile found for insights:', userProfile);

    const prompt = `Based on the user's current progress and profile, generate 3 personalized AI insights for their dashboard.

IMPORTANT: Respond with a valid JSON array only, no additional text or markdown.

The JSON should have this exact structure:
[
  {
    "id": 1,
    "type": "tip/opportunity/reminder/warning",
    "title": "Insight title",
    "content": "Detailed insight content",
    "priority": "high/medium/low",
    "actionable": true,
    "category": "content/audience/monetization/strategy"
  }
]

Create insights that:
- Are highly relevant to their current business stage
- Address their fear: "${userProfile.personal.fear}"
- Leverage their strengths and work style
- Provide specific, actionable recommendations
- Consider their industry: ${userProfile.business.industry}`;

    const payload = {
      message: prompt,
      userProfile,
      chatHistory: []
    };

    console.log('📡 Making API call for ai-insights');

    try {
      const response = await apiCall('/api/business/ai-insights', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      console.log('📥 Insights API response received:', response);
      return response;
    } catch (error) {
      console.error('❌ Insights API call failed:', error);
      throw error;
    }
  },

  async generateInsights(insightType, specificQuestion = null) {
    const userProfile = getUserProfileWithClerkId(clerkUserId);
    
    if (!userProfile) {
      throw new Error('User profile not found. Please complete your onboarding first.');
    }

    const payload = {
      userProfile,
      insightType,
      ...(specificQuestion && { specificQuestion })
    };

    return await apiCall(apiEndpoints.business.generateInsights, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async getRecommendations(category = null) {
    const userProfile = getUserProfileWithClerkId(clerkUserId);
    
    if (!userProfile) {
      throw new Error('User profile not found. Please complete your onboarding first.');
    }

    const payload = {
      userProfile,
      ...(category && { category })
    };

    return await apiCall(apiEndpoints.business.recommendations, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async sendChatMessage(message, chatHistory = []) {
    const userProfile = getUserProfileWithClerkId(clerkUserId);
    
    if (!userProfile) {
      throw new Error('User profile not found. Please complete your onboarding first.');
    }

    const payload = {
      message,
      userProfile,
      chatHistory
    };

    return await apiCall(apiEndpoints.business.chat, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async saveProfile(profileData = null) {
    const userProfile = profileData || getUserProfile();
    
    if (!userProfile) {
      throw new Error('No profile data to save.');
    }

    return await apiCall(apiEndpoints.business.saveProfile, {
      method: 'POST',
      body: JSON.stringify(userProfile)
    });
  },

  async saveUserProfileToBlockchain(userId, profileData) {
    console.log('💾 Saving user profile to blockchain...');
    console.log('👤 User ID:', userId);
    console.log('📝 Profile data:', profileData);
    
    return await apiCall(apiEndpoints.business.saveUserProfile, {
      method: 'POST',
      body: JSON.stringify({ userId, profileData })
    });
  },

  async saveBusinessDataToBlockchain(userId, businessData) {
    console.log('💾 Saving business data to blockchain...');
    console.log('👤 User ID:', userId);
    console.log('📝 Business data:', businessData);
    
    return await apiCall(apiEndpoints.business.saveBusinessData, {
      method: 'POST',
      body: JSON.stringify({ userId, businessData })
    });
  },

  async saveMissionCompletionToBlockchain(userId, missionData) {
    return await apiCall(apiEndpoints.business.saveMissionCompletion, {
      method: 'POST',
      body: JSON.stringify({ userId, missionData })
    });
  },

  async getUserDataFromBlockchain(userId) {
    return await apiCall(apiEndpoints.business.getUserData.replace(':userId', userId), {
      method: 'GET'
    });
  },

  async getTopicInfo(userId) {
    return await apiCall(apiEndpoints.business.getTopicInfo.replace(':userId', userId), {
      method: 'GET'
    });
  },

  async getContentStrategyInsights(specificQuestion = null) {
    return await this.generateInsights('content_strategy', specificQuestion);
  },

  async getAudienceGrowthInsights(specificQuestion = null) {
    return await this.generateInsights('audience_growth', specificQuestion);
  },

  async getMonetizationInsights(specificQuestion = null) {
    return await this.generateInsights('monetization', specificQuestion);
  },

  async getCompetitiveAnalysisInsights(specificQuestion = null) {
    return await this.generateInsights('competitive_analysis', specificQuestion);
  },

  async getGoalPlanningInsights(specificQuestion = null) {
    return await this.generateInsights('goal_planning', specificQuestion);
  },

  async getAllInsights() {
    const insightTypes = [
      'content_strategy',
      'audience_growth', 
      'monetization',
      'competitive_analysis',
      'goal_planning'
    ];

    try {
      const promises = insightTypes.map(type => this.generateInsights(type));
      const results = await Promise.allSettled(promises);
      
      const insights = {};
      results.forEach((result, index) => {
        const type = insightTypes[index];
        if (result.status === 'fulfilled') {
          insights[type] = result.value;
        } else {
          console.error(`Error fetching ${type} insights:`, result.reason);
          insights[type] = { insights: [], error: result.reason.message };
        }
      });

      return insights;
    } catch (error) {
      console.error('Error fetching all insights:', error);
      throw error;
    }
  },

  // Método para buscar dados do usuário do blockchain
  async getUserDataFromBlockchain(userId) {
    try {
      console.log('🔄 BusinessCoachingService: Fetching blockchain data for user:', userId);
      
      const response = await apiCall(`/api/business/user/${encodeURIComponent(userId)}/data`, {
        method: 'GET'
      });

      if (response && response.success) {
        console.log('✅ BusinessCoachingService: Blockchain data retrieved successfully');
        return response;
      } else {
        console.log('ℹ️ BusinessCoachingService: No blockchain data found');
        return null;
      }
    } catch (error) {
      console.error('❌ BusinessCoachingService: Error fetching blockchain data:', error);
      throw error;
    }
  }
}; 