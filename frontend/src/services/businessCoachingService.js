import { apiCall, apiEndpoints } from '../utils/api.js';
import { getUserProfile } from '../utils/userProfile.js';

export const businessCoachingService = {
  async generateDailyMissions() {
    console.log('🎯 generateDailyMissions service called');
    const userProfile = getUserProfile();
    
    if (!userProfile) {
      console.error('❌ User profile not found');
      throw new Error('User profile not found. Please complete your onboarding first.');
    }

    console.log('✅ User profile found:', userProfile);

    const prompt = `Based on the user's profile and business stage, generate 3 specific daily missions that will help them progress. 

IMPORTANT: Respond with a valid JSON array only, no additional text or markdown.

The JSON should have this exact structure:
[
  {
    "id": 1,
    "title": "Mission title",
    "description": "Detailed description of what to do",
    "reward": "XP points",
    "status": "pending",
    "type": "category",
    "estimatedTime": "time estimate",
    "priority": "high/medium/low",
    "category": "content/social/analytics/strategy/growth"
  }
]

Create missions that are:
- Specific to their business stage and challenges
- Actionable today
- Aligned with their goals and values
- Progressive (building on each other)
- Realistic given their work style and time constraints

Consider their biggest challenge: "${userProfile.personal.biggest_challenge}"
Focus on: ${userProfile.business.industry}
Target audience: ${userProfile.business.target_audience.age_range}`;

    const payload = {
      message: prompt,
      userProfile,
      chatHistory: []
    };

    console.log('📡 Making API call to:', apiEndpoints.business.chat);
    console.log('📤 Payload:', payload);

    try {
      const response = await apiCall(apiEndpoints.business.chat, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      console.log('📥 API response received:', response);
      return response;
    } catch (error) {
      console.error('❌ API call failed:', error);
      throw error;
    }
  },

  async generateWeeklyGoals() {
    console.log('📈 generateWeeklyGoals service called');
    const userProfile = getUserProfile();
    
    if (!userProfile) {
      console.error('❌ User profile not found');
      throw new Error('User profile not found. Please complete your onboarding first.');
    }

    console.log('✅ User profile found for goals:', userProfile);

    const prompt = `Based on the user's profile and business goals, generate 3 weekly goals that align with their success definition.

IMPORTANT: Respond with a valid JSON array only, no additional text or markdown.

The JSON should have this exact structure:
[
  {
    "id": 1,
    "title": "Goal title",
    "progress": 0,
    "target": 100,
    "unit": "measurement unit",
    "status": "in-progress",
    "description": "Why this goal matters",
    "timeline": "This week",
    "priority": "high/medium/low"
  }
]

Create goals that:
- Support their success definition: "${userProfile.personal.success_definition}"
- Address their primary motivation: "${userProfile.personal.primary_motivation}"
- Are measurable and achievable this week
- Build toward their impact goal: "${userProfile.personal.impact_goal}"`;

    const payload = {
      message: prompt,
      userProfile,
      chatHistory: []
    };

    console.log('📡 Making API call for goals to:', apiEndpoints.business.chat);

    try {
      const response = await apiCall(apiEndpoints.business.chat, {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      console.log('📥 Goals API response received:', response);
      return response;
    } catch (error) {
      console.error('❌ Goals API call failed:', error);
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

    console.log('📡 Making API call for insights to:', apiEndpoints.business.chat);

    try {
      const response = await apiCall(apiEndpoints.business.chat, {
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