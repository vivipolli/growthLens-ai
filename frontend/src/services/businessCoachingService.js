import { apiCall, apiEndpoints } from '../utils/api.js';
import { getUserProfile } from '../utils/userProfile.js';

export const businessCoachingService = {
  // Daily Missions API
  async generateDailyMissions() {
    console.log('🎯 generateDailyMissions service called');
    const userProfile = getUserProfile();
    
    if (!userProfile) {
      console.error('❌ User profile not found');
      throw new Error('User profile not found. Please complete your onboarding first.');
    }

    console.log('✅ User profile found:', userProfile);

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

  // Weekly Goals API
  async generateWeeklyGoals() {
    console.log('📈 generateWeeklyGoals service called');
    const userProfile = getUserProfile();
    
    if (!userProfile) {
      console.error('❌ User profile not found');
      throw new Error('User profile not found. Please complete your onboarding first.');
    }

    console.log('✅ User profile found for goals:', userProfile);

    const payload = {
      userProfile
    };

    console.log('📡 Making API call for weekly goals');

    try {
      const response = await apiCall('/api/business/weekly-goals', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      console.log('📥 Weekly goals API response received:', response);
      return response;
    } catch (error) {
      console.error('❌ Weekly goals API call failed:', error);
      throw error;
    }
  },

  // Business Observations API
  async generateBusinessObservations() {
    console.log('💡 generateBusinessObservations service called');
    const userProfile = getUserProfile();
    
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

  async generatePersonalizedInsights() {
    console.log('💡 generatePersonalizedInsights service called');
    const userProfile = getUserProfile();
    
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
    const userProfile = getUserProfile();
    
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
    const userProfile = getUserProfile();
    
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
    const userProfile = getUserProfile();
    
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
    return await apiCall(apiEndpoints.business.saveUserProfile, {
      method: 'POST',
      body: JSON.stringify({ userId, profileData })
    });
  },

  async saveBusinessDataToBlockchain(userId, businessData) {
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
  }
}; 