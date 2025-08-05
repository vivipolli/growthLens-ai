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
  private hederaTopicService: HederaTopicService;

  constructor() {
    this.hederaTopicService = new HederaTopicService();
  }

  async initialize() {
    console.log('🔄 BusinessCoachingService: Starting initialization...');
    
    // Initialize Hedera Topic Service
    await this.hederaTopicService.initialize();
    
    this.agentSigner = new ServerSigner(
      config.hedera.accountId,
      config.hedera.privateKey,
      config.hedera.network as any
    );
    console.log(`✅ BusinessCoachingService: ServerSigner created for network: ${config.hedera.network}`);

    // Check if API key is available
    if (!config.openai.apiKey) {
      console.log('⚠️  BusinessCoachingService: No API key available - AI features will be disabled');
      console.log('💡 Set OPENROUTER_API_KEY or OPENAI_API_KEY to enable AI features');
      return;
    }

    // Initialize LangChain AI service
    try {
      console.log('🤖 BusinessCoachingService: Initializing LangChain AI service...');
      this.aiLLM = createInstance({
        modelName: config.openai.model,
        baseURL: config.openai.baseURL,
        apiKey: config.openai.apiKey
      });
      
      console.log('✅ BusinessCoachingService: LangChain AI service initialized successfully');
      console.log('✅ BusinessCoachingService: aiLLM instance:', typeof this.aiLLM);
    } catch (error) {
      console.error('❌ BusinessCoachingService: Failed to initialize AI service:', error);
      console.log('⚠️  AI features will be disabled, but service will continue running');
    }
  }

  async generateBusinessInsights(request: BusinessInsightRequest): Promise<BusinessInsightResponse> {
    console.log('🔄 BusinessCoachingService.generateBusinessInsights: Starting...');
    
    try {
      // Use persistent user ID from Clerk or generate from user profile
      const userId = this.getPersistentUserId(request.userProfile);
      console.log(`🆔 Using persistent user ID: ${userId}`);
      
      const userProfile = request.userProfile;
      const insightType = request.insightType;
      
      console.log(`📝 Processing insights for user: ${userId}`);
      console.log(`🎯 Insight type: ${insightType}`);
      console.log(`👤 User profile present: ${!!userProfile}`);
      
      if (!userProfile || !insightType) {
        throw new Error('userProfile and insightType are required');
      }

      if (!this.aiLLM) {
        console.log('⚠️  BusinessCoachingService: AI service not available - returning fallback insights');
        return this.generateFallbackInsights(insightType);
      }

      // 🔄 PASSO 1: Buscar histórico de insights da blockchain
      const historicalData = await this.getUserHistoricalData(userId);
      
      console.log(`📊 BusinessCoachingService: Retrieved ${historicalData.aiInsights.length} historical insights for ${userId}`);

      // 🔄 PASSO 2: Criar prompt contextualizado com histórico
      const contextPrompt = createContextualPrompt(
        request.userProfile,
        request.insightType,
        request.specificQuestion
      );

      const insightTypePrompt = generateInsightTypePrompt(request.insightType);

      // 🔄 PASSO 3: Adicionar contexto histórico ao prompt
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

      console.log('🤖 BusinessCoachingService: Generating AI insights with historical context...');
      const response = await this.aiLLM.invoke(fullPrompt);

      // 🔄 PASSO 4: Salvar novo insight na blockchain
      const parsedResponse = this.parseAgentResponse(response.content, request.insightType);
      
      console.log(`🔍 BusinessCoachingService: Parsed response:`, {
        hasInsights: !!parsedResponse.insights,
        insightsLength: parsedResponse.insights?.length || 0,
        insightType: request.insightType,
        userId: userId
      });
      
      console.log(`🔍 BusinessCoachingService: Full parsed response:`, JSON.stringify(parsedResponse, null, 2));
      
      // 🔄 SOLUÇÃO TEMPORÁRIA: Forçar salvamento no cache mesmo se parser falhar
      if (parsedResponse.insights && parsedResponse.insights.length > 0) {
        console.log('💾 BusinessCoachingService: Saving business insights to blockchain...');
        console.log(`📊 BusinessCoachingService: Parsed response has ${parsedResponse.insights.length} insights`);
        try {
          await this.saveBusinessInsightsToBlockchain(userId, parsedResponse, request.insightType);
          console.log('✅ BusinessCoachingService: Business insights saved to blockchain successfully');
        } catch (error) {
          console.error('❌ BusinessCoachingService: Failed to save business insights to blockchain:', error);
        }
      } else {
        console.log('⚠️ BusinessCoachingService: Parser failed, forcing cache save...');
        
        // Forçar salvamento no cache com dados da IA
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
            model: config.openai.model
          },
          userId: userId
        };
        
        // Adicionar ao cache
        const existingCache = this.recentInsightsCache.get(userId) || [];
        this.recentInsightsCache.set(userId, [...existingCache, forcedInsightData]);
        console.log(`💾 BusinessCoachingService: Forced cache save for ${userId}. Cache now has ${this.recentInsightsCache.get(userId)?.length || 0} items`);
      }

      return parsedResponse;

    } catch (error) {
      console.error('❌ BusinessCoachingService: Error generating business insights:', error);
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
    const insights: BusinessInsight[] = [];

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

      } else if (insightType === 'ai_insights' || insightType === 'content_strategy') {
        // Simple parser for AI insights (same as daily_missions)
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
                impact: 'Strategic business improvement',
             confidence: 85,
             reasoning: 'AI-generated based on your profile',
                timeline: '1-2 weeks',
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
            impact: 'Strategic business improvement',
            confidence: 85,
            reasoning: 'AI-generated based on your profile',
            timeline: '1-2 weeks',
            resources: []
          });
        }
      } else if (insightType === 'business_observations') {
        // Simple parser for business observations (same as daily_missions)
        const lines = agentOutput.split('\n');
        let currentInsight = null;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Look for observation patterns - multiple formats
          if ((line.includes('Observation') && line.match(/\d+:/)) || 
              (line.match(/^\d+\.\s*\*\*/)) || 
              (line.match(/^\d+\.\s+[A-Z]/))) {
            
            // Start of a new observation
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
            
            // Extract title from multiple formats
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
            // Add content to current observation
            if (currentInsight.content) {
              currentInsight.content += ' ' + line;
            } else {
              currentInsight.content = line;
            }
          }
        }
        
        // Add the last observation if it exists
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
      
      // If no insights found, create fallback
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
      if (!this.aiLLM) {
        return this.generateFallbackChatResponse(message, userProfile);
      }

      const contextPrompt = createContextualPrompt(userProfile, 'general_coaching');
      
      const fullPrompt = `${contextPrompt}

User message: "${message}"

IMPORTANT: If this is a request to generate daily missions or personalized insights, respond with a valid JSON array only, no additional text or markdown. The JSON should match the exact structure requested.

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

Otherwise, respond as their personal business mentor. Be supportive, practical, and provide actionable advice based on their specific context and goals.`;
      
      const response = await this.aiLLM.invoke(fullPrompt);
      
      return response.content;

    } catch (error) {
      console.error('❌ BusinessCoachingService: Chat response error:', error);
      console.error('❌ BusinessCoachingService: Error type:', typeof error);
      console.error('❌ BusinessCoachingService: Error message:', error instanceof Error ? error.message : 'Unknown error');
      console.error('❌ BusinessCoachingService: Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      return this.generateFallbackChatResponse(message, userProfile);
    }
  }

  private generateFallbackChatResponse(message: string, userProfile: UserProfile): string {
    const fallbackResponse = `I understand you're working on your ${userProfile.business.industry} business. While our AI features are being configured, I'd recommend focusing on connecting with your target audience (${userProfile.business.target_audience?.age_range || 'your ideal customers'}) and addressing their main pain point: ${userProfile.business.target_audience?.pain_points || 'their key challenges'}. This aligns with your goal of ${userProfile.personal.success_definition || 'building a successful business'}. We'll have enhanced AI coaching features available soon!`;
    return fallbackResponse;
  }

  // Cache local para insights recentes (temporário até Mirror Node sincronizar)
  private recentInsightsCache = new Map<string, any[]>();

  // 🔄 NOVO MÉTODO: Buscar dados históricos da blockchain
  private async getUserHistoricalData(userId: string): Promise<{
    userProfile: any;
    businessData: any;
    aiInsights: any[];
    missionCompletions: any[];
  }> {
    try {
      // Primeiro, buscar do cache local (insights recentes)
      const cachedInsights = this.recentInsightsCache.get(userId) || [];
      console.log(`📊 BusinessCoachingService: Found ${cachedInsights.length} cached insights for ${userId}`);
      
      // Depois, buscar da blockchain (insights antigos)
      const blockchainData = await this.hederaTopicService.getUserDataFromBlockchain(userId);
      const blockchainInsights = blockchainData?.aiInsights || [];
      console.log(`📊 BusinessCoachingService: Found ${blockchainInsights.length} blockchain insights for ${userId}`);
      
      // Combinar cache local + blockchain
      const allInsights = [...cachedInsights, ...blockchainInsights];
      console.log(`📊 BusinessCoachingService: Total insights for ${userId}: ${allInsights.length}`);
      
      return {
        userProfile: blockchainData?.userProfile || null,
        businessData: blockchainData?.businessData || null,
        aiInsights: allInsights,
        missionCompletions: blockchainData?.missionCompletions || []
      };
    } catch (error) {
      console.error('❌ BusinessCoachingService: Error getting historical data:', error);
      return {
        userProfile: null,
        businessData: null,
        aiInsights: [],
        missionCompletions: []
      };
    }
  }

  // 🔄 NOVO MÉTODO: Construir contexto histórico para IA
  private buildHistoricalContext(historicalData: any, currentInsightType: string): string {
    const { aiInsights, missionCompletions } = historicalData;
    
    let context = '\n--- HISTORICAL CONTEXT ---\n';
    
    // Adicionar insights anteriores relevantes
    if (aiInsights.length > 0) {
      const relevantInsights = aiInsights
        .filter((insight: any) => insight.category === currentInsightType || insight.type === currentInsightType)
        .slice(-3); // Últimos 3 insights relevantes
      
      if (relevantInsights.length > 0) {
        context += '\nPrevious AI Insights:\n';
        relevantInsights.forEach((insight: any, index: number) => {
          context += `${index + 1}. ${insight.title}: ${insight.content.substring(0, 100)}...\n`;
        });
      }
    }
    
    // Adicionar missões completadas
    if (missionCompletions.length > 0) {
      const recentMissions = missionCompletions.slice(-5); // Últimas 5 missões
      context += '\nRecent Completed Missions:\n';
      recentMissions.forEach((mission: any, index: number) => {
        context += `${index + 1}. ${mission.title || mission.missionId}\n`;
      });
    }
    
    context += '\n--- END HISTORICAL CONTEXT ---\n';
    return context;
  }

  // 🔄 NOVO MÉTODO: Salvar insights de IA na blockchain
  private async saveBusinessInsightsToBlockchain(userId: string, response: BusinessInsightResponse, insightType: string): Promise<void> {
    try {
      console.log(`💾 BusinessCoachingService: Preparing to save business insights for ${userId}...`);
      console.log(`📊 BusinessCoachingService: Response has ${response.insights?.length || 0} insights`);
      
      const insightData = {
        type: insightType, // Usar o insightType correto (daily_missions, weekly_goals, business_observations)
        timestamp: new Date().toISOString(),
        data: {
          insightType,
          insights: response.insights,
          summary: response.summary,
          nextSteps: response.nextSteps,
          personalizedMessage: response.personalized_message,
          model: config.openai.model
        },
        userId: userId
      };

      console.log(`📝 BusinessCoachingService: Insight data prepared:`, {
        type: insightData.type,
        insightType: insightData.data.insightType,
        insightsCount: insightData.data.insights?.length || 0,
        userId: insightData.userId
      });

      const txId = await this.hederaTopicService.saveAIInsight(userId, insightData.data);
      console.log(`✅ BusinessCoachingService: Business insights saved to blockchain for user ${userId}. TX ID: ${txId}`);
      
      // Adicionar ao cache local para acesso imediato
      const existingCache = this.recentInsightsCache.get(userId) || [];
      this.recentInsightsCache.set(userId, [...existingCache, insightData]);
      console.log(`💾 BusinessCoachingService: Added to local cache for ${userId}. Cache now has ${this.recentInsightsCache.get(userId)?.length || 0} items`);
      
    } catch (error) {
      console.error('❌ BusinessCoachingService: Error saving business insights to blockchain:', error);
      console.error('❌ BusinessCoachingService: Error details:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  // 🔄 MÉTODO ATUALIZADO: Salvar perfil do usuário na blockchain
  async saveUserProfileToBlockchain(userProfile: UserProfile): Promise<boolean> {
    try {
      console.log('🔄 BusinessCoachingService.saveUserProfileToBlockchain: Starting...');
      
      // Use persistent user ID or generate from profile
      let userId: string;
      try {
        userId = this.getPersistentUserId(userProfile);
      } catch (error) {
        // If no clerkId, generate from profile data
        userId = this.generateUserIdFromProfile(userProfile);
      }
      console.log(`🆔 Using user ID: ${userId}`);
      
      console.log(`📝 Saving user profile for: ${userId}`);
      console.log(`👤 Profile data present: ${!!userProfile}`);
      
      if (!userProfile) {
        throw new Error('User profile is required');
      }
      
      const txId = await this.hederaTopicService.saveUserProfile(userId, userProfile);
      
      console.log(`✅ BusinessCoachingService: User profile saved to blockchain. TX ID: ${txId}`);
      return true;
      
    } catch (error) {
      console.error('❌ BusinessCoachingService: Error saving user profile to blockchain:', error);
      return false;
    }
  }

  // 🔄 MÉTODO ATUALIZADO: Salvar dados do negócio na blockchain
  async saveBusinessDataToBlockchain(businessData: any, userId: string): Promise<string | null> {
    try {
      console.log(`🔐 BusinessCoachingService: Saving business data to blockchain for ${userId}...`);
      
      // Use the clerkId from businessData if available, otherwise use userId
      const clerkId = businessData.clerkId || userId;
      console.log(`🆔 Using clerkId: ${clerkId}`);
      
      const txId = await this.hederaTopicService.saveBusinessData(clerkId, businessData);
      
      console.log(`✅ BusinessCoachingService: Business data saved to blockchain. TX ID: ${txId}`);
      return txId;
      
    } catch (error) {
      console.error('❌ BusinessCoachingService: Error saving business data to blockchain:', error);
      return null;
    }
  }

  // 🔄 MÉTODO ATUALIZADO: Salvar conclusão de missão na blockchain
  async saveMissionCompletionToBlockchain(missionData: any): Promise<string | null> {
    try {
      const { userId } = missionData;
      console.log(`🔐 BusinessCoachingService: Saving mission completion to blockchain for ${userId}...`);
      
      const txId = await this.hederaTopicService.saveMissionCompletion(userId, missionData);
      
      console.log(`✅ BusinessCoachingService: Mission completion saved to blockchain. TX ID: ${txId}`);
      return txId;
      
    } catch (error) {
      console.error('❌ BusinessCoachingService: Error saving mission completion to blockchain:', error);
      return null;
    }
  }

  // 🔄 MÉTODO ATUALIZADO: Buscar dados do usuário da blockchain
  async getUserDataFromBlockchain(userId: string): Promise<any> {
    try {
      console.log(`🔐 BusinessCoachingService: Reading user data for ${userId}...`);
      
      // Buscar dados do cache local (insights recentes)
      const cachedInsights = this.recentInsightsCache.get(userId) || [];
      console.log(`📊 BusinessCoachingService: Found ${cachedInsights.length} cached insights for ${userId}`);
      
      // Buscar dados da blockchain (insights antigos)
      const blockchainData = await this.hederaTopicService.getUserDataFromBlockchain(userId);
      const blockchainInsights = blockchainData?.aiInsights || [];
      console.log(`📊 BusinessCoachingService: Found ${blockchainInsights.length} blockchain insights for ${userId}`);
      
      // Combinar cache + blockchain
      const allInsights = [...cachedInsights, ...blockchainInsights];
      console.log(`📊 BusinessCoachingService: Total insights for ${userId}: ${allInsights.length}`);
      console.log(`📊 BusinessCoachingService: Cached insights:`, cachedInsights.length);
      console.log(`📊 BusinessCoachingService: Blockchain insights:`, blockchainInsights.length);
      
      // Normalizar formato para ser consistente
      console.log(`🔍 BusinessCoachingService: Processing ${allInsights.length} insights for normalization`);
      
      const normalizedInsights = allInsights.map((insight, index) => {
        console.log(`🔍 BusinessCoachingService: Processing insight ${index + 1}:`, {
          hasType: !!insight.type,
          hasData: !!insight.data,
          insightKeys: Object.keys(insight)
        });
        
        // Se o insight tem estrutura aninhada (cache), extrair os dados
        if (insight.type && insight.data) {
          console.log(`🔍 BusinessCoachingService: Insight ${index + 1} has nested structure`);
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
        // Se o insight já está no formato correto (blockchain)
        // Adicionar insightType se não existir (para insights antigos)
        if (!insight.insightType) {
          console.log(`🔍 BusinessCoachingService: Insight ${index + 1} missing insightType, adding default`);
          return {
            ...insight,
            insightType: 'daily_missions' // Padrão para insights antigos
          };
        }
        console.log(`🔍 BusinessCoachingService: Insight ${index + 1} already in correct format`);
        return insight;
      });
      
      const combinedData = {
        userProfile: blockchainData?.userProfile || null,
        businessData: blockchainData?.businessData || null,
        aiInsights: normalizedInsights,
        missionCompletions: blockchainData?.missionCompletions || [],
        allMessages: blockchainData?.allMessages || []
      };
      
      if (combinedData.aiInsights.length > 0 || combinedData.userProfile || combinedData.businessData) {
        console.log(`✅ BusinessCoachingService: User data retrieved successfully`);
        return combinedData;
      } else {
        console.log(`ℹ️  BusinessCoachingService: No data found for user ${userId} - returning empty structure`);
        return combinedData; // Return empty structure instead of null
      }

    } catch (error) {
      console.error('❌ BusinessCoachingService: Error reading user data:', error);
      return null;
    }
  }

  // 🔄 MÉTODO PÚBLICO: Salvar insights de negócio na blockchain
  async saveBusinessInsightToBlockchain(userId: string, insightData: any): Promise<string | null> {
    try {
      console.log(`💾 BusinessCoachingService: Saving business insight to blockchain for ${userId}...`);
      
      const txId = await this.hederaTopicService.saveAIInsight(userId, insightData);
      
      console.log(`✅ BusinessCoachingService: Business insight saved to blockchain. TX ID: ${txId}`);
      return txId;
      
    } catch (error) {
      console.error('❌ BusinessCoachingService: Error saving business insight to blockchain:', error);
      return null;
    }
  }

  // 🔄 MÉTODO PÚBLICO: Obter dados do cache
  getCacheData(userId: string): any {
    const cachedInsights = this.recentInsightsCache.get(userId) || [];
    return {
      userId,
      cachedInsightsCount: cachedInsights.length,
      cachedInsights: cachedInsights
    };
  }

  // 🔄 MÉTODO ATUALIZADO: Buscar informações do tópico
  async getTopicInfo(userId: string): Promise<any> {
    try {
      console.log(`🔐 BusinessCoachingService: Getting topic info for ${userId}...`);
      
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
        console.log(`❌ BusinessCoachingService: No topic found for user ${userId}`);
        return null;
      }
      
    } catch (error) {
      console.error('❌ BusinessCoachingService: Error getting topic info:', error);
      return null;
    }
  }

  private getPersistentUserId(userProfile: UserProfile): string {
    // Use Clerk user ID if available
    if (userProfile && typeof userProfile === 'object' && 'clerkId' in userProfile) {
      return (userProfile as any).clerkId;
    }
    
    // If no Clerk ID, throw error - we require Clerk authentication
    throw new Error('Clerk user ID is required for blockchain operations');
  }

  private generateUserIdFromProfile(userProfile: UserProfile): string {
    // Generate a unique ID from profile data
    const profileString = JSON.stringify(userProfile);
    const timestamp = Date.now().toString();
    const hash = this.hashString(profileString + timestamp);
    
    // Create a readable user ID
    const name = userProfile.personal?.name || 'user';
    const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    
    return `${cleanName}_${hash}`;
  }

  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }
} 