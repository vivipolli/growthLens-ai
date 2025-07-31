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

export class BusinessCoachingService {
  private agent?: HederaConversationalAgent;
  private agentSigner?: ServerSigner;
  private aiLLM?: any;

  async initialize() {
    console.log('🔄 BusinessCoachingService: Starting initialization...');
    
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
    } catch (error) {
      console.error('❌ BusinessCoachingService: Failed to initialize AI service:', error);
      console.log('⚠️  AI features will be disabled, but service will continue running');
    }
  }

  private createContextualPrompt(userProfile: UserProfile, insightType: string, specificQuestion?: string): string {
    const { personal, business } = userProfile;
    
    const contextPrompt = `
You are an expert business coach and mentor specializing in digital businesses and autonomous professionals.

PERSONAL CONTEXT:
- Location: ${personal.location || 'Not specified'}
- Age: ${personal.age || 'Not specified'}
- Primary motivation: ${personal.primary_motivation || 'Not specified'}
- Biggest challenge: ${personal.biggest_challenge || 'Not specified'}
- Success definition: ${personal.success_definition || 'Not specified'}
- Core values: ${personal.core_values && Array.isArray(personal.core_values) ? personal.core_values.join(', ') : 'Not specified'}
- Work style: ${personal.work_style || 'Not specified'}
- Dream lifestyle: ${personal.dream_lifestyle || 'Not specified'}
- Impact goal: ${personal.impact_goal || 'Not specified'}
- Main fear: ${personal.fear || 'Not specified'}

BUSINESS CONTEXT:
- Industry: ${business.industry || 'Not specified'}
- Target audience: ${business.target_audience?.age_range || 'Not specified'}, ${business.target_audience?.gender || 'Not specified'}, ${business.target_audience?.income_level || 'Not specified'}
- Customer location: ${business.target_audience?.location || 'Not specified'}
- Customer pain points: ${business.target_audience?.pain_points || 'Not specified'}
- Customer goals: ${business.target_audience?.goals_aspirations || 'Not specified'}
- Main offer: ${business.main_offer || 'Not specified'}
- Competitive gaps identified: ${business.content_analysis?.competitive_gaps || 'Not analyzed yet'}

Based on this context, provide ${insightType} insights and recommendations.
${specificQuestion ? `Specific question: ${specificQuestion}` : ''}

Respond with PRACTICAL, ACTIONABLE advice that:
1. Addresses their specific situation and challenges
2. Aligns with their values and work style
3. Considers their target audience
4. Provides concrete next steps
5. Acknowledges their fears while encouraging growth

Be encouraging but realistic. Focus on scalable digital strategies.
`;

    return contextPrompt;
  }

  private generateInsightTypePrompt(insightType: string): string {
    const prompts: Record<string, string> = {
      content_strategy: `
Generate 3-5 specific content strategy insights focusing on:
- Content themes that resonate with their target audience
- Optimal content formats for their industry
- Engagement strategies based on their audience pain points
- Content calendar suggestions
- Platform-specific recommendations
`,
      audience_growth: `
Generate 3-5 audience growth insights focusing on:
- Organic growth strategies for their specific niche
- Community building tactics
- Networking opportunities in their industry
- Collaboration strategies with competitors/peers
- Lead magnet ideas based on customer pain points
`,
      monetization: `
Generate 3-5 monetization insights focusing on:
- Pricing strategies for their target audience income level
- Revenue stream diversification
- Upselling and cross-selling opportunities
- Subscription or recurring revenue models
- Partnership and affiliate opportunities
`,
      competitive_analysis: `
Generate 3-5 competitive analysis insights focusing on:
- How to differentiate from identified gaps
- Opportunities in their competitive landscape
- Positioning strategies
- Content gaps to exploit
- Unique value proposition development
`,
      goal_planning: `
Generate 3-5 goal planning insights focusing on:
- SMART goals for the next 30, 60, 90 days
- Milestone tracking strategies
- KPI recommendations for their business type
- Progress measurement techniques
- Accountability systems
`
    };

    return prompts[insightType] || prompts.content_strategy;
  }

  async generateBusinessInsights(request: BusinessInsightRequest): Promise<BusinessInsightResponse> {
    try {
      if (!this.aiLLM) {
        console.log('⚠️  BusinessCoachingService: AI service not available - returning fallback insights');
        return this.generateFallbackInsights(request.insightType);
      }

      const contextPrompt = this.createContextualPrompt(
        request.userProfile,
        request.insightType,
        request.specificQuestion
      );

      const insightTypePrompt = this.generateInsightTypePrompt(request.insightType);

      const fullPrompt = `${contextPrompt}

${insightTypePrompt}

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

      const response = await this.aiLLM.invoke(fullPrompt);

      return this.parseAgentResponse(response.content, request.insightType);

    } catch (error) {
      console.error('❌ BusinessCoachingService: Failed to generate business insights:', error);
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
    const mockInsights: BusinessInsight[] = [
      {
        id: uuidv4(),
        type: 'strategy',
        title: 'Personalized Content Strategy',
        content: agentOutput.substring(0, 200) + '...',
        priority: 'high',
        category: this.mapInsightTypeToCategory(insightType),
        action: 'Implement content strategy',
        impact: 'Increased engagement',
        confidence: 85,
        reasoning: 'Based on your target audience analysis',
        timeline: '2-4 weeks',
        resources: ['Content calendar template', 'Audience research tools']
      }
    ];

    return {
      insights: mockInsights,
      summary: 'AI-generated insights based on your business profile',
      nextSteps: [
        'Review personalized recommendations',
        'Implement high-priority actions',
        'Track progress and metrics'
      ],
      personalized_message: `Based on your profile and goals, these insights are tailored specifically for your journey. Remember, growth takes time but you're on the right path!`
    };
  }

  private mapInsightTypeToCategory(insightType: string): BusinessInsight['category'] {
    const mapping: Record<string, BusinessInsight['category']> = {
      content_strategy: 'content',
      audience_growth: 'audience',
      monetization: 'monetization',
      competitive_analysis: 'strategy',
      goal_planning: 'strategy'
    };

    return mapping[insightType] || 'strategy';
  }

  async getChatResponse(message: string, userProfile: UserProfile, chatHistory: any[] = []): Promise<string> {
    console.log('🔄 BusinessCoachingService.getChatResponse: Starting chat response generation');
    console.log(`📝 BusinessCoachingService: Received message: "${message}"`);
    console.log(`👤 BusinessCoachingService: User profile - Industry: ${userProfile.business.industry}, Motivation: ${userProfile.personal.primary_motivation}`);
    console.log(`📚 BusinessCoachingService: Chat history length: ${chatHistory.length}`);
    
    try {
      if (!this.aiLLM) {
        console.log('⚠️  BusinessCoachingService: AI service not available - returning fallback response');
        return this.generateFallbackChatResponse(message, userProfile);
      }
      console.log('✅ BusinessCoachingService: Agent is initialized and ready');

      console.log('🔄 BusinessCoachingService: Creating contextual prompt...');
      const contextPrompt = this.createContextualPrompt(userProfile, 'general_coaching');
      console.log(`📝 BusinessCoachingService: Context prompt created (length: ${contextPrompt.length})`);
      
      const fullPrompt = `${contextPrompt}

User message: "${message}"

IMPORTANT: If this is a request to generate daily missions, weekly goals, or personalized insights, respond with a valid JSON array only, no additional text or markdown. The JSON should match the exact structure requested.

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

For weekly goals, respond with:
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

      console.log(`📝 BusinessCoachingService: Full prompt created (length: ${fullPrompt.length})`);
      console.log(`🔍 BusinessCoachingService: Full prompt preview: ${fullPrompt.substring(0, 300)}...`);

      console.log('🚀 BusinessCoachingService: Sending message to agent...');
      console.log(`📊 BusinessCoachingService: Agent processMessage called with chatHistory length: ${chatHistory.length}`);
      
      const response = await this.aiLLM.invoke(fullPrompt);
      
      console.log('✅ BusinessCoachingService: Agent response received');
      console.log(`📦 BusinessCoachingService: Response type: ${typeof response}`);
      console.log(`📦 BusinessCoachingService: Response keys: ${Object.keys(response)}`);
      console.log(`📝 BusinessCoachingService: Response output length: ${response.content?.length || 0}`);
      console.log(`📝 BusinessCoachingService: Response output preview: ${response.content?.substring(0, 200) || 'No output'}...`);
      
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
    console.log('🔄 BusinessCoachingService: Generating fallback chat response');
    
    const fallbackResponse = `I understand you're working on your ${userProfile.business.industry} business. While our AI features are being configured, I'd recommend focusing on connecting with your target audience (${userProfile.business.target_audience?.age_range || 'your ideal customers'}) and addressing their main pain point: ${userProfile.business.target_audience?.pain_points || 'their key challenges'}. This aligns with your goal of ${userProfile.personal.success_definition || 'building a successful business'}. We'll have enhanced AI coaching features available soon!`;
    console.log(`✅ BusinessCoachingService: Fallback response generated (length: ${fallbackResponse.length})`);
    return fallbackResponse;
  }
} 