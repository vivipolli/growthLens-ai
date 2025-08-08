import {
  HederaConversationalAgent,
  ServerSigner,
} from 'hedera-agent-kit';
import { config } from '../config/environment';
import { 
  UserProfile, 
  BusinessInsightRequest, 
  BusinessInsightResponse, 
  BusinessInsight 
} from '../types/business.types';
import { v4 as uuidv4 } from 'uuid';
import { createInstance } from './aiService';
import { createContextualPrompt, generateInsightTypePrompt } from './prompts';
import { HederaTopicService } from './hederaTopicService';

export class BusinessCoachingService {
  private agent?: HederaConversationalAgent;
  private agentSigner?: ServerSigner;
  private aiLLM?: any;
  private fallbackLLM?: any;
  private hederaTopicService: HederaTopicService;

  constructor() {
    this.hederaTopicService = new HederaTopicService();
  }

  async initialize() {
    await this.hederaTopicService.initialize();
    
    this.agentSigner = new ServerSigner(
      config.hedera.accountId,
      config.hedera.privateKey,
      config.hedera.network as any
    );

    if (!config.ai.apiKey) {
      console.warn('⚠️  No API key configured for AI service');
      return;
    }

    try {
      
      console.log('🔧 Initializing AI service with fallback models...');
      console.log(`🤖 Primary Model: ${config.ai.model}`);
      console.log(`🔄 Fallback Model: ${config.ai.fallbackModel}`);
      console.log(`🔗 Base URL: ${config.ai.baseURL}`);
      console.log(`🔑 API Key: ${config.ai.apiKey?.substring(0, 12)}...`);
      
      // Initialize primary model
      this.aiLLM = createInstance({
        modelName: config.ai.model,
        baseURL: config.ai.baseURL,
        apiKey: config.ai.apiKey
      });
      
      // Initialize fallback model
      this.fallbackLLM = createInstance({
        modelName: config.ai.fallbackModel,
        baseURL: config.ai.baseURL,
        apiKey: config.ai.apiKey
      });
      
      console.log('✅ AI service initialized successfully');
      
      // Test the primary AI service
      try {
        const testResponse = await this.aiLLM.invoke('Hello, this is a test message.');
        if (testResponse && testResponse.content) {
          console.log('✅ Primary AI service test successful');
        } else {
          console.warn('⚠️  Primary AI service test failed - response is undefined');
          this.aiLLM = undefined;
        }
      } catch (testError) {
        console.error('❌ Primary AI service test failed:', testError);
        this.aiLLM = undefined;
      }
      
      // Test the fallback AI service
      try {
        const testResponse = await this.fallbackLLM.invoke('Hello, this is a test message.');
        if (testResponse && testResponse.content) {
          console.log('✅ Fallback AI service test successful');
        } else {
          console.warn('⚠️  Fallback AI service test failed - response is undefined');
          this.fallbackLLM = undefined;
        }
      } catch (testError) {
        console.error('❌ Fallback AI service test failed:', testError);
        this.fallbackLLM = undefined;
      }
    } catch (error) {
      console.error('❌ Failed to initialize AI service:', error);
      this.aiLLM = undefined;
      this.fallbackLLM = undefined;
    }
  }

  async generateBusinessInsights(request: BusinessInsightRequest): Promise<BusinessInsightResponse> {
    try {
      const userId = this.getPersistentUserId(request.userProfile);
      const userProfile = request.userProfile;
      const insightType = request.insightType;
      
      if (!userProfile || !insightType) {
        throw new Error('userProfile and insightType are required');
      }

      if (!this.aiLLM && !this.fallbackLLM) {
        return this.generateFallbackInsights(insightType);
      }

      const historicalData = await this.getUserHistoricalData(userId);
      
      // Get progress data for business observations
      let progressData = null;
      if (request.insightType === 'business_observations') {
        progressData = await this.getUserProgressData(request.userProfile, historicalData);
      }
      
      const contextPrompt = createContextualPrompt(
        request.userProfile,
        request.insightType,
        request.specificQuestion,
        progressData
      );

      const insightTypePrompt = generateInsightTypePrompt(request.insightType);
      const historicalContext = this.buildHistoricalContext(historicalData, request.insightType);

      const fullPrompt = `${contextPrompt}

${insightTypePrompt}

${historicalContext}

Format your response as a detailed business coaching session. Provide:

1. PERSONALIZED INSIGHTS (3-5 insights)
For each insight, include:
- Clear, actionable title
- Detailed explanation
- Why it's important for their specific situation
- Concrete action steps
- Expected impact/results
- Timeline for implementation
- Confidence level (1-100)

2. SUMMARY
A brief summary of the key recommendations

3. NEXT STEPS
3-5 specific next steps they should take this week

4. PERSONALIZED MESSAGE
An encouraging, personalized message that acknowledges their journey and motivates action

Keep the tone professional but warm, like a supportive mentor who believes in their success.
`;

      let response;
      let modelUsed = 'primary';
      
      try {
        // Try primary model first
        if (this.aiLLM) {
          console.log('🎯 Using primary model for AI generation');
          response = await this.aiLLM.invoke(fullPrompt);
        } else if (this.fallbackLLM) {
          console.log('🔄 Using fallback model for AI generation');
          response = await this.fallbackLLM.invoke(fullPrompt);
          modelUsed = 'fallback';
        } else {
          throw new Error('No AI models available');
        }
        
        if (!response || !response.content) {
          throw new Error('AI response is undefined or missing content');
        }
        
                console.log(`✅ AI generation successful using ${modelUsed} model`);
        const parsedResponse = this.parseAgentResponse(response.content, request.insightType);
        
        if (parsedResponse.insights && parsedResponse.insights.length > 0) {
          try {
            await this.saveBusinessInsightsToBlockchain(userId, parsedResponse, request.insightType);
          } catch (error) {
            console.error('Failed to save business insights to blockchain:', error);
          }
        } else {
          const forcedInsightData = {
            type: 'business_observation',
            timestamp: new Date().toISOString(),
            data: {
              insightType: request.insightType,
              insights: response.content ? [{ 
                id: `forced-${Date.now()}`,
                title: 'AI Generated Business Observation',
                content: response.content.substring(0, 200) + '...',
                priority: 'high',
                category: 'strategy'
              }] : [],
              summary: 'AI generated business insights',
              nextSteps: ['Review AI recommendations'],
              personalizedMessage: 'AI generated personalized business content',
              model: config.ai.model
            },
            userId: userId
          };
          
          const existingCache = this.recentInsightsCache.get(userId) || [];
          this.recentInsightsCache.set(userId, [...existingCache, forcedInsightData]);
        }

        return parsedResponse;
        
      } catch (error) {
        console.error(`❌ AI generation failed with ${modelUsed} model:`, error);
        
        // Try fallback model if primary failed
        if (modelUsed === 'primary' && this.fallbackLLM) {
          try {
            console.log('🔄 Trying fallback model...');
            response = await this.fallbackLLM.invoke(fullPrompt);
            
            if (response && response.content) {
              console.log('✅ AI generation successful using fallback model');
              const parsedResponse = this.parseAgentResponse(response.content, request.insightType);
              
              if (parsedResponse.insights && parsedResponse.insights.length > 0) {
                try {
                  await this.saveBusinessInsightsToBlockchain(userId, parsedResponse, request.insightType);
                } catch (saveError) {
                  console.error('Failed to save business insights to blockchain:', saveError);
                }
              }
              
              return parsedResponse;
            }
          } catch (fallbackError) {
            console.error('❌ Fallback model also failed:', fallbackError);
          }
        }
        
        // If all models fail, return fallback insights
        console.log('🔄 Returning fallback insights due to model failures');
        return this.generateFallbackInsights(request.insightType);
      }

    } catch (error) {
      console.error('Error generating business insights:', error);
      return this.generateFallbackInsights(request.insightType);
    }
  }

  private generateFallbackInsights(insightType: string): BusinessInsightResponse {
    const fallbackInsights: BusinessInsight[] = [
      {
        id: uuidv4(),
        type: 'strategy',
        title: 'AI Features Temporarily Unavailable',
        content: 'Our AI coaching features are currently being configured. In the meantime, focus on your core business activities and we\'ll have personalized insights ready soon!',
        priority: 'medium',
        category: this.mapInsightTypeToCategory(insightType),
        action: 'Continue with current business activities',
        impact: 'Maintain business momentum',
        confidence: 90,
        reasoning: 'Standard business best practices',
        timeline: 'Immediate',
        resources: ['Business planning tools', 'Industry research']
      }
    ];

    return {
      insights: fallbackInsights,
      summary: 'AI features are being configured. Standard business guidance is available.',
      nextSteps: [
        'Continue with your current business activities',
        'Review your business plan and goals',
        'Connect with your target audience'
      ],
      personalized_message: `We're working on bringing you personalized AI insights. Your business journey is important to us, and we'll have enhanced coaching features available soon!`
    };
  }

  private parseAgentResponse(agentOutput: string, insightType: string): BusinessInsightResponse {
    let insights: BusinessInsight[] = [];

    try {
      if (insightType === 'daily_missions') {
        // Simple parser that extracts insights from the AI response
        const lines = agentOutput.split('\n');
        let currentInsight = null;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Look for insight patterns - multiple formats
          if ((line.includes('Insight') && line.match(/\d+:/)) || 
              (line.match(/^\d+\.\s*\*\*/)) || 
              (line.match(/^\d+\.\s+[A-Z]/))) {
            
            // Start of a new insight
            if (currentInsight && currentInsight.title && currentInsight.content) {
              insights.push({
                id: uuidv4(),
                type: 'strategy',
                title: currentInsight.title,
                content: currentInsight.content,
                priority: currentInsight.priority,
                category: currentInsight.category,
                action: currentInsight.title,
                impact: 'Progress towards goals',
                confidence: 85,
                reasoning: 'AI-generated based on your profile',
                timeline: 'Today',
                resources: []
              });
            }
            
            // Extract title from multiple formats
            let title = '';
            if (line.includes('Insight')) {
              title = line.replace(/.*?Insight \d+:\s*/, '').trim();
            } else if (line.match(/^\d+\.\s*\*\*/)) {
              title = line.replace(/^\d+\.\s*\*\*(.*?)\*\*/, '$1').trim();
            } else if (line.match(/^\d+\.\s+[A-Z]/)) {
              title = line.replace(/^\d+\.\s+/, '').trim();
            }
            currentInsight = {
              title: title,
              content: '',
              priority: (insights.length === 0 ? 'high' : insights.length === 1 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
              category: this.mapInsightTypeToCategory(insightType)
            };
          } else if (currentInsight && line && !line.startsWith('Why') && !line.startsWith('Action') && !line.startsWith('What to do')) {
            // Add content to current insight
            if (currentInsight.content) {
              currentInsight.content += ' ' + line;
            } else {
              currentInsight.content = line;
            }
          }
        }
        
        // Add the last insight if it exists
        if (currentInsight && currentInsight.title && currentInsight.content) {
          insights.push({
            id: uuidv4(),
            type: 'strategy',
            title: currentInsight.title,
            content: currentInsight.content,
            priority: currentInsight.priority,
            category: currentInsight.category,
            action: currentInsight.title,
            impact: 'Progress towards goals',
            confidence: 85,
            reasoning: 'AI-generated based on your profile',
            timeline: 'Today',
            resources: []
          });
        }
        
        // Limit to exactly 4 missions
        insights = insights.slice(0, 4);

      } else if (insightType === 'ai_insights' || insightType === 'content_strategy') {
        const lines = agentOutput.split('\n');
        let currentInsight = null;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if ((line.includes('Insight') && line.match(/\d+:/)) || 
              (line.match(/^\d+\.\s*\*\*/)) || 
              (line.match(/^\d+\.\s+[A-Z]/))) {
            
            if (currentInsight && currentInsight.title && currentInsight.content) {
           insights.push({
             id: uuidv4(),
             type: 'strategy',
                title: currentInsight.title,
                content: currentInsight.content,
                priority: currentInsight.priority,
                category: currentInsight.category,
                action: currentInsight.title,
                impact: 'Strategic business improvement',
             confidence: 85,
             reasoning: 'AI-generated based on your profile',
                timeline: '1-2 weeks',
             resources: []
           });
         }

            let title = '';
            if (line.includes('Insight')) {
              title = line.replace(/.*?Insight \d+:\s*/, '').trim();
            } else if (line.match(/^\d+\.\s*\*\*/)) {
              title = line.replace(/^\d+\.\s*\*\*(.*?)\*\*/, '$1').trim();
            } else if (line.match(/^\d+\.\s+[A-Z]/)) {
              title = line.replace(/^\d+\.\s+/, '').trim();
            }
            currentInsight = {
              title: title,
              content: '',
              priority: (insights.length === 0 ? 'high' : insights.length === 1 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
              category: this.mapInsightTypeToCategory(insightType)
            };
          } else if (currentInsight && line && !line.startsWith('Why') && !line.startsWith('Action') && !line.startsWith('What to do')) {
            if (currentInsight.content) {
              currentInsight.content += ' ' + line;
            } else {
              currentInsight.content = line;
            }
          }
        }
        
        if (currentInsight && currentInsight.title && currentInsight.content) {
          insights.push({
            id: uuidv4(),
            type: 'strategy',
            title: currentInsight.title,
            content: currentInsight.content,
            priority: currentInsight.priority,
            category: currentInsight.category,
            action: currentInsight.title,
            impact: 'Strategic business improvement',
            confidence: 85,
            reasoning: 'AI-generated based on your profile',
            timeline: '1-2 weeks',
            resources: []
          });
        }
      } else if (insightType === 'business_observations') {
        const lines = agentOutput.split('\n');
        let currentInsight = null;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          if ((line.includes('Observation') && line.match(/\d+:/)) || 
              (line.match(/^\d+\.\s*\*\*/)) || 
              (line.match(/^\d+\.\s+[A-Z]/))) {
            
            if (currentInsight && currentInsight.title && currentInsight.content) {
            insights.push({
              id: uuidv4(),
              type: 'strategy',
                title: currentInsight.title,
                content: currentInsight.content,
                priority: currentInsight.priority,
                category: currentInsight.category,
                action: currentInsight.title,
                impact: 'Strategic business improvement',
              confidence: 85,
              reasoning: 'AI-generated based on your profile',
              timeline: '1-2 weeks',
                resources: []
              });
            }
            
            let title = '';
            if (line.includes('Observation')) {
              title = line.replace(/.*?Observation \d+:\s*/, '').trim();
            } else if (line.match(/^\d+\.\s*\*\*/)) {
              title = line.replace(/^\d+\.\s*\*\*(.*?)\*\*/, '$1').trim();
            } else if (line.match(/^\d+\.\s+[A-Z]/)) {
              title = line.replace(/^\d+\.\s+/, '').trim();
            }
            currentInsight = {
              title: title,
              content: '',
              priority: (insights.length === 0 ? 'high' : insights.length === 1 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
              category: this.mapInsightTypeToCategory(insightType)
            };
          } else if (currentInsight && line && !line.startsWith('Why') && !line.startsWith('Action') && !line.startsWith('What to do')) {
            if (currentInsight.content) {
              currentInsight.content += ' ' + line;
            } else {
              currentInsight.content = line;
            }
          }
        }
        
        if (currentInsight && currentInsight.title && currentInsight.content) {
        insights.push({
          id: uuidv4(),
          type: 'strategy',
            title: currentInsight.title,
            content: currentInsight.content,
            priority: currentInsight.priority,
            category: currentInsight.category,
            action: currentInsight.title,
            impact: 'Strategic business improvement',
          confidence: 85,
            reasoning: 'AI-generated based on your profile',
          timeline: '1-2 weeks',
            resources: []
          });
        }
      }
      
      if (insights.length === 0) {
        insights.push({
          id: uuidv4(),
          type: 'strategy',
          title: 'Complete Your Profile',
          content: 'Please complete your onboarding to get personalized recommendations.',
          priority: 'high',
          category: this.mapInsightTypeToCategory(insightType),
          action: 'Complete onboarding',
          impact: 'Get personalized insights',
          confidence: 90,
          reasoning: 'Profile completion required',
          timeline: 'Immediate',
          resources: []
        });
      }

      return {
        insights,
        summary: `Generated ${insights.length} personalized ${insightType.replace('_', ' ')}`,
        nextSteps: [
          'Review the recommendations',
          'Implement high-priority items',
          'Track your progress'
        ],
        personalized_message: `Here are your personalized ${insightType.replace('_', ' ')} based on your business profile!`
      };

    } catch (error) {
      console.error('❌ Error parsing AI response:', error);
      return this.generateFallbackInsights(insightType);
    }
  }

  private mapInsightTypeToCategory(insightType: string): BusinessInsight['category'] {
    const mapping: Record<string, BusinessInsight['category']> = {
      daily_missions: 'strategy',
  
      ai_insights: 'strategy',
      content_strategy: 'content',
      audience_growth: 'audience',
      monetization: 'monetization',
      competitive_analysis: 'strategy',
      goal_planning: 'strategy'
    };

    return mapping[insightType] || 'strategy';
  }

  async getChatResponse(message: string, userProfile: UserProfile, chatHistory: any[] = []): Promise<string> {
    try {
      if (!this.aiLLM && !this.fallbackLLM) {
        console.warn('⚠️  AI service not initialized, using fallback response');
        return this.generateFallbackChatResponse(message, userProfile);
      }

      // 🔥 NOVO: Gerar userId baseado no perfil (sem depender do Clerk)
      let userId: string;
      try {
        userId = this.getPersistentUserId(userProfile);
      } catch (error) {
        // Se não tiver clerkId, gerar um ID baseado no perfil
        userId = this.generateUserIdFromProfile(userProfile);
      }
      
      const historicalData = await this.getUserHistoricalData(userId);
      
      // 🔥 NOVO: Construir contexto histórico
      const historicalContext = this.buildChatHistoricalContext(historicalData);
      
      // 🔥 NOVO: Analisar progresso do usuário
      const progressData = await this.getUserProgressData(userProfile, historicalData);
      
      const contextPrompt = createContextualPrompt(userProfile, 'general_coaching');
      
      const fullPrompt = `${contextPrompt}

${historicalContext}

User Progress:
- Completed Missions: ${progressData.completedMissions || 0}
- Completion Rate: ${progressData.completionRate || 0}%
- Active Categories: ${progressData.activeMissionCategories || 'Starting journey'}
- Recent Activity: ${progressData.recentActivityAreas || 'No recent activity'}
- Progress Trend: ${progressData.progressTrends || 'Building momentum'}

User message: "${message}"

IMPORTANT: Use the historical context and user progress to provide personalized advice. Consider their previous insights, completed missions, and progress patterns when responding.

For daily missions, respond with:
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


For personalized insights, respond with:
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

Otherwise, respond as their personal business mentor. Be supportive, practical, and provide actionable advice based on their specific context, goals, and historical progress.`;
      
      let response;
      let modelUsed = 'primary';
      
      try {
        // Try primary model first
        if (this.aiLLM) {
          console.log('🎯 Using primary model for chat');
          response = await this.aiLLM.invoke(fullPrompt);
        } else if (this.fallbackLLM) {
          console.log('🔄 Using fallback model for chat');
          response = await this.fallbackLLM.invoke(fullPrompt);
          modelUsed = 'fallback';
        } else {
          throw new Error('No AI models available');
        }
        
        if (!response || !response.content) {
          throw new Error('AI response is undefined or missing content');
        }
        
        console.log(`✅ Chat successful using ${modelUsed} model`);
        return response.content;
        
      } catch (error) {
        console.error(`❌ Chat failed with ${modelUsed} model:`, error);
        
        // Try fallback model if primary failed
        if (modelUsed === 'primary' && this.fallbackLLM) {
          try {
            console.log('🔄 Trying fallback model for chat...');
            response = await this.fallbackLLM.invoke(fullPrompt);
            
            if (response && response.content) {
              console.log('✅ Chat successful using fallback model');
              return response.content;
            }
          } catch (fallbackError) {
            console.error('❌ Fallback model also failed:', fallbackError);
          }
        }
        
        // If all models fail, return fallback response
        console.log('🔄 Returning fallback chat response due to model failures');
        return this.generateFallbackChatResponse(message, userProfile);
      }

    } catch (error) {
      console.error('Chat response error:', error);
      
      // Check if it's an API-related error
      if (error instanceof Error) {
        if (error.message.includes('API') || error.message.includes('rate limit') || error.message.includes('timeout')) {
          console.error('❌ AI API error detected:', error.message);
        } else if (error.message.includes('network') || error.message.includes('connection')) {
          console.error('❌ Network error detected:', error.message);
        }
      }
      
      return this.generateFallbackChatResponse(message, userProfile);
    }
  }

  private generateFallbackChatResponse(message: string, userProfile: UserProfile): string {
    // 🔥 NOVO: Adicionar verificações de segurança para evitar erros
    const industry = userProfile?.business?.industry || 'business';
    const ageRange = userProfile?.business?.target_audience?.age_range || 'your ideal customers';
    const painPoints = userProfile?.business?.target_audience?.pain_points || 'their key challenges';
    const successDefinition = userProfile?.personal?.success_definition || 'building a successful business';
    
    const fallbackResponse = `I understand you're working on your ${industry} business. While our AI features are being configured, I'd recommend focusing on connecting with your target audience (${ageRange}) and addressing their main pain point: ${painPoints}. This aligns with your goal of ${successDefinition}. We'll have enhanced AI coaching features available soon!`;
    return fallbackResponse;
  }

  // Local cache for recent insights (temporary until Mirror Node syncs)
  private recentInsightsCache = new Map<string, any[]>();

  private async getUserHistoricalData(userId: string): Promise<{
    userProfile: any;
    businessData: any;
    aiInsights: any[];
    missionCompletions: any[];
  }> {
    try {
      const cachedInsights = this.recentInsightsCache.get(userId) || [];
      const blockchainData = await this.hederaTopicService.getUserDataFromBlockchain(userId);
      const blockchainInsights = blockchainData?.aiInsights || [];
      const allInsights = [...cachedInsights, ...blockchainInsights];
      
      return {
        userProfile: blockchainData?.userProfile || null,
        businessData: blockchainData?.businessData || null,
        aiInsights: allInsights,
        missionCompletions: blockchainData?.missionCompletions || []
      };
    } catch (error) {
      console.error('Error getting historical data:', error);
      return {
        userProfile: null,
        businessData: null,
        aiInsights: [],
        missionCompletions: []
      };
    }
  }

  private async getUserProgressData(userProfile: any, historicalData?: any): Promise<any> {
    try {
      if (!historicalData) {
        return {
          completedMissions: 0,
          totalMissions: 0,
          completionRate: 0,
          activeMissionCategories: 'Starting journey',
          recentActivityAreas: 'No activity yet',
          progressTrends: 'New user beginning their growth journey'
        };
      }

      const completedMissions = historicalData.missionCompletions || [];
      const totalMissions = completedMissions.length + 4; // Assume 4 pending missions
      const completionRate = totalMissions > 0 ? Math.round((completedMissions.length / totalMissions) * 100) : 0;

      // Extract mission categories from completed missions
      const categories = completedMissions
        .map((mission: any) => mission.category || mission.type || 'general')
        .reduce((acc: any, category: string) => {
          acc[category] = (acc[category] || 0) + 1;
          return acc;
        }, {});

      const activeMissionCategories = Object.keys(categories).length > 0 
        ? Object.keys(categories).join(', ')
        : 'content, strategy';

      // Analyze recent activity
      const recentActivityAreas = completedMissions.length > 0
        ? `Recently focused on: ${Object.entries(categories)
            .sort(([,a]: any, [,b]: any) => b - a)
            .slice(0, 3)
            .map(([category]: any) => category)
            .join(', ')}`
        : 'Getting started with foundational activities';

      // Progress trends analysis
      let progressTrends = 'Starting journey';
      if (completedMissions.length >= 10) {
        progressTrends = 'Strong momentum with consistent execution';
      } else if (completedMissions.length >= 5) {
        progressTrends = 'Building good habits and making steady progress';
      } else if (completedMissions.length >= 2) {
        progressTrends = 'Initial progress with room for acceleration';
      }

      return {
        completedMissions: completedMissions.length,
        totalMissions,
        completionRate,
        activeMissionCategories,
        recentActivityAreas,
        progressTrends
      };
    } catch (error) {
      console.error('Error getting user progress data:', error);
      return {
        completedMissions: 0,
        totalMissions: 0,
        completionRate: 0,
        activeMissionCategories: 'Data unavailable',
        recentActivityAreas: 'Data unavailable',
        progressTrends: 'Unable to analyze progress'
      };
    }
  }

  private buildHistoricalContext(historicalData: any, currentInsightType: string): string {
    const { aiInsights, missionCompletions } = historicalData;
    
    let context = '\n--- HISTORICAL CONTEXT ---\n';
    
    if (aiInsights.length > 0) {
      const relevantInsights = aiInsights
        .filter((insight: any) => insight.category === currentInsightType || insight.type === currentInsightType)
        .slice(-3);
      
      if (relevantInsights.length > 0) {
        context += '\nPrevious AI Insights:\n';
        relevantInsights.forEach((insight: any, index: number) => {
          const title = insight.title || 'Untitled';
          const content = insight.content || '';
          const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;
          context += `${index + 1}. ${title}: ${preview}\n`;
        });
      }
    }
    
    if (missionCompletions.length > 0) {
      const recentMissions = missionCompletions.slice(-5);
      context += '\nRecent Completed Missions:\n';
      recentMissions.forEach((mission: any, index: number) => {
        const missionTitle = mission.title || mission.missionId || 'Unknown Mission';
        context += `${index + 1}. ${missionTitle}\n`;
      });
    }
    
    context += '\n--- END HISTORICAL CONTEXT ---\n';
    return context;
  }

  // 🔥 NOVO: Função específica para construir contexto de chat
  private buildChatHistoricalContext(historicalData: any): string {
    const { aiInsights, missionCompletions, allMessages } = historicalData;
    
    let context = '\n--- CHAT HISTORICAL CONTEXT ---\n';
    
    // Insights anteriores relevantes
    if (aiInsights.length > 0) {
      const recentInsights = aiInsights.slice(-3);
      context += '\nPrevious AI Insights:\n';
      recentInsights.forEach((insight: any, index: number) => {
        const title = insight.title || 'Untitled';
        const content = insight.content || '';
        const preview = content.length > 100 ? content.substring(0, 100) + '...' : content;
        context += `${index + 1}. ${title}: ${preview}\n`;
      });
    }
    
    // Missões recentes
    if (missionCompletions.length > 0) {
      const recentMissions = missionCompletions.slice(-3);
      context += '\nRecent Completed Missions:\n';
      recentMissions.forEach((mission: any, index: number) => {
        const missionTitle = mission.title || mission.missionId || 'Unknown Mission';
        context += `${index + 1}. ${missionTitle}\n`;
      });
    }
    
    // Conversas anteriores (se disponível)
    if (allMessages && allMessages.length > 0) {
      const chatMessages = allMessages.filter((msg: any) => 
        msg.type === 'user_message' || msg.type === 'system_message'
      ).slice(-5);
      
      if (chatMessages.length > 0) {
        context += '\nRecent Chat History:\n';
        chatMessages.forEach((msg: any, index: number) => {
          const role = msg.type === 'user_message' ? 'User' : 'AI';
          const content = msg.message || msg.content || '';
          const preview = content.length > 50 ? content.substring(0, 50) + '...' : content;
          context += `${index + 1}. ${role}: ${preview}\n`;
        });
      }
    }
    
    context += '\n--- END CHAT HISTORICAL CONTEXT ---\n';
    return context;
  }

  private async saveBusinessInsightsToBlockchain(userId: string, response: BusinessInsightResponse, insightType: string): Promise<void> {
    try {
      const insightData = {
        type: insightType,
        timestamp: new Date().toISOString(),
        data: {
          insightType,
          insights: response.insights,
          summary: response.summary,
          nextSteps: response.nextSteps,
          personalizedMessage: response.personalized_message,
          model: config.ai.model
        },
        userId: userId
      };

      const txId = await this.hederaTopicService.saveAIInsight(userId, insightData.data);
      
      const existingCache = this.recentInsightsCache.get(userId) || [];
      this.recentInsightsCache.set(userId, [...existingCache, insightData]);
      
    } catch (error) {
      console.error('Error saving business insights to blockchain:', error);
    }
  }

  async saveUserProfileToBlockchain(userProfile: UserProfile): Promise<string | null> {
    try {
      let userId: string;
      try {
        userId = this.getPersistentUserId(userProfile);
      } catch (error) {
        userId = this.generateUserIdFromProfile(userProfile);
      }
      
      if (!userProfile) {
        throw new Error('User profile is required');
      }
      
      console.log(`💾 Saving complete user profile to blockchain for user: ${userId}`);
      console.log(`📊 Profile data:`, JSON.stringify(userProfile, null, 2));
      
      const txId = await this.hederaTopicService.saveUserProfile(userId, userProfile);
      
      if (txId) {
        console.log(`✅ User profile saved to blockchain with transaction ID: ${txId}`);
        return txId;
      } else {
        console.warn('⚠️ No transaction ID returned from Hedera service');
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error saving user profile to blockchain:', error);
      return null;
    }
  }

  async saveBusinessDataToBlockchain(businessData: any, userId: string): Promise<string | null> {
    try {
      const clerkId = businessData.clerkId || userId;
      
      if (!businessData) {
        throw new Error('Business data is required');
      }
      
      console.log(`💾 Saving complete business data to blockchain for user: ${clerkId}`);
      console.log(`📊 Business data:`, JSON.stringify(businessData, null, 2));
      
      const txId = await this.hederaTopicService.saveBusinessData(clerkId, businessData);
      
      if (txId) {
        console.log(`✅ Business data saved to blockchain with transaction ID: ${txId}`);
        return txId;
      } else {
        console.warn('⚠️ No transaction ID returned from Hedera service for business data');
        return null;
      }
      
    } catch (error) {
      console.error('❌ Error saving business data to blockchain:', error);
      return null;
    }
  }

  async saveMissionCompletionToBlockchain(missionData: any): Promise<string | null> {
    try {
      const { userId } = missionData;
      const txId = await this.hederaTopicService.saveMissionCompletion(userId, missionData);
      return txId;
      
    } catch (error) {
      console.error('Error saving mission completion to blockchain:', error);
      return null;
    }
  }

  async getUserDataFromBlockchain(userId: string): Promise<any> {
    try {
      const cachedInsights = this.recentInsightsCache.get(userId) || [];
      const blockchainData = await this.hederaTopicService.getUserDataFromBlockchain(userId);
      const blockchainInsights = blockchainData?.aiInsights || [];
      const allInsights = [...cachedInsights, ...blockchainInsights];
      
      const normalizedInsights = allInsights.map((insight) => {
        if (insight.type && insight.data) {
          return {
            insightType: insight.data.insightType,
            insights: insight.data.insights,
            summary: insight.data.summary,
            nextSteps: insight.data.nextSteps,
            personalizedMessage: insight.data.personalizedMessage,
            timestamp: insight.timestamp,
            model: insight.data.model
          };
        }
        
        if (!insight.insightType) {
          return {
            ...insight,
            insightType: 'daily_missions'
          };
        }
        return insight;
      });
      
      const combinedData = {
        userProfile: blockchainData?.userProfile || null,
        businessData: blockchainData?.businessData || null,
        aiInsights: normalizedInsights,
        missionCompletions: blockchainData?.missionCompletions || [],
        allMessages: blockchainData?.allMessages || []
      };
      
      return combinedData;

    } catch (error) {
      console.error('Error reading user data:', error);
      return null;
    }
  }

  async saveBusinessInsightToBlockchain(userId: string, insightData: any): Promise<string | null> {
    try {
      const txId = await this.hederaTopicService.saveAIInsight(userId, insightData);
      return txId;
      
    } catch (error) {
      console.error('Error saving business insight to blockchain:', error);
      return null;
    }
  }

  getCacheData(userId: string): any {
    const cachedInsights = this.recentInsightsCache.get(userId) || [];
    return {
      userId,
      cachedInsightsCount: cachedInsights.length,
      cachedInsights: cachedInsights
    };
  }

  async getTopicInfo(userId: string): Promise<any> {
    try {
      const topicData = await this.hederaTopicService.getUserTopic(userId);
      
      if (topicData) {
        const topicInfo = await this.hederaTopicService.getTopicInfoFromMirrorNode(topicData.topicId);
        return {
          userId,
          topicId: topicData.topicId,
          topicMemo: topicData.memo,
          topicInfo
        };
      } else {
        return null;
      }
      
    } catch (error) {
      console.error('Error getting topic info:', error);
      return null;
    }
  }

  private getPersistentUserId(userProfile: UserProfile): string {
    if (userProfile && typeof userProfile === 'object' && 'clerkId' in userProfile) {
      return (userProfile as any).clerkId;
    }
    
    throw new Error('Clerk user ID is required for blockchain operations');
  }

  private generateUserIdFromProfile(userProfile: UserProfile): string {
    const profileString = JSON.stringify(userProfile);
    const timestamp = Date.now().toString();
    const hash = this.hashString(profileString + timestamp);
    
    // For personal onboarding data, name is directly in the profile
    // For business data, it might be in userProfile.personal?.name
    const name = (userProfile as any).name || userProfile.personal?.name || 'user';
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    return `${cleanName}_${hash}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  // Method to check AI service status
  isAIServiceReady(): boolean {
    return this.aiLLM !== undefined;
  }

  // Method to get AI service status info
  getAIServiceStatus(): { isReady: boolean; error?: string } {
    if (!this.aiLLM) {
      return { 
        isReady: false, 
        error: 'AI service not initialized. Check API keys and configuration.' 
      };
    }
    return { isReady: true };
  }

  // Method to reinitialize AI service
  async reinitializeAIService(): Promise<boolean> {
    try {
      console.log('🔄 Reinitializing AI service...');
      this.aiLLM = undefined;
      await this.initialize();
      return this.aiLLM !== undefined;
    } catch (error) {
      console.error('❌ Failed to reinitialize AI service:', error);
      return false;
    }
  }
} 