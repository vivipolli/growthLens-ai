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
      daily_missions: `
Generate exactly 5 DAILY MISSIONS for TODAY that are actionable, quick tasks (15-60 minutes each).

CRITICAL: Respond ONLY with exactly 5 missions in this exact format:

1. **Mission Title** (e.g., "Create Instagram Story", "Research Competitors", "Update LinkedIn Profile")
   Description: Specific, actionable task for today. Be concrete and clear about what to do.
   Time: 15-60 minutes
   Priority: high/medium/low
   Category: content/social/analytics/strategy/growth/networking

2. **Mission Title**
   Description: Specific, actionable task for today.
   Time: 15-60 minutes
   Priority: high/medium/low
   Category: content/social/analytics/strategy/growth/networking

3. **Mission Title**
   Description: Specific, actionable task for today.
   Time: 15-60 minutes
   Priority: high/medium/low
   Category: content/social/analytics/strategy/growth/networking

4. **Mission Title**
   Description: Specific, actionable task for today.
   Time: 15-60 minutes
   Priority: high/medium/low
   Category: content/social/analytics/strategy/growth/networking

5. **Mission Title**
   Description: Specific, actionable task for today.
   Time: 15-60 minutes
   Priority: high/medium/low
   Category: content/social/analytics/strategy/growth/networking

Examples of good missions:
- "Post Instagram story about your morning routine"
- "Research 3 competitors' pricing strategies"
- "Update LinkedIn profile with recent achievements"
- "Create 3 content ideas for next week"
- "Engage with 5 posts from your target audience"

IMPORTANT: Do NOT include any introductory text, explanations, or summaries. Start directly with "1. **Mission Title**" and end after the 5th mission.
`,
      weekly_goals: `
Generate exactly 4 WEEKLY GOALS that are specific, measurable objectives for this week.

CRITICAL: Respond ONLY with exactly 4 goals in this exact format:

1. **Weekly Goal Title** (e.g., "Increase Instagram Followers", "Create 5 Blog Posts", "Generate 10 Leads")
   Description: Specific, measurable outcome for this week. Include clear success criteria.
   Target: [specific number] (e.g., 50, 5, 10, 1000)
   Unit: followers/posts/leads/revenue/engagement/etc
   Timeline: This week
   Priority: high/medium/low
   Category: growth/content/revenue/engagement

2. **Weekly Goal Title**
   Description: Specific, measurable outcome for this week.
   Target: [specific number]
   Unit: followers/posts/leads/revenue/engagement/etc
   Timeline: This week
   Priority: high/medium/low
   Category: growth/content/revenue/engagement

3. **Weekly Goal Title**
   Description: Specific, measurable outcome for this week.
   Target: [specific number]
   Unit: followers/posts/leads/revenue/engagement/etc
   Timeline: This week
   Priority: high/medium/low
   Category: growth/content/revenue/engagement

4. **Weekly Goal Title**
   Description: Specific, measurable outcome for this week.
   Target: [specific number]
   Unit: followers/posts/leads/revenue/engagement/etc
   Timeline: This week
   Priority: high/medium/low
   Category: growth/content/revenue/engagement

Examples of good weekly goals:
- "Increase Instagram followers by 50"
- "Create 5 blog posts for content calendar"
- "Generate 10 qualified leads"
- "Achieve 1000 website visitors"

NO additional text, explanations, or summaries.
`,
      ai_insights: `
Generate exactly 5 AI INSIGHTS about their business that are strategic observations and recommendations.

CRITICAL: Respond ONLY with exactly 5 insights in this exact format:

1. **Insight Title** (e.g., "Market Opportunity", "Competitive Advantage", "Growth Strategy")
   Description: Strategic business insight, market observation, or actionable recommendation. Be specific and relevant to their industry and situation.
   Type: opportunity/warning/tip/observation/strategy
   Priority: high/medium/low
   Category: strategy/market/growth/risk/innovation

2. **Insight Title**
   Description: Strategic business insight, market observation, or actionable recommendation.
   Type: opportunity/warning/tip/observation/strategy
   Priority: high/medium/low
   Category: strategy/market/growth/risk/innovation

3. **Insight Title**
   Description: Strategic business insight, market observation, or actionable recommendation.
   Type: opportunity/warning/tip/observation/strategy
   Priority: high/medium/low
   Category: strategy/market/growth/risk/innovation

4. **Insight Title**
   Description: Strategic business insight, market observation, or actionable recommendation.
   Type: opportunity/warning/tip/observation/strategy
   Priority: high/medium/low
   Category: strategy/market/growth/risk/innovation

5. **Insight Title**
   Description: Strategic business insight, market observation, or actionable recommendation.
   Type: opportunity/warning/tip/observation/strategy
   Priority: high/medium/low
   Category: strategy/market/growth/risk/innovation

Examples of good insights:
- "Your target audience is increasingly consuming video content - consider adding video to your content strategy"
- "Competitors are using subscription models - you could differentiate with one-time premium services"
- "There's an untapped market segment in [specific demographic] that aligns with your values"
- "Your industry is shifting towards [trend] - early adoption could give you a competitive advantage"
- "Your current pricing strategy leaves room for premium positioning"

NO additional text, explanations, or summaries.
`,
      content_strategy: `
Generate exactly 5 CONTENT STRATEGY insights focusing on:
- Content themes that resonate with their target audience
- Optimal content formats for their industry
- Engagement strategies based on their audience pain points
- Content calendar suggestions
- Platform-specific recommendations

CRITICAL: Respond ONLY with exactly 5 insights in this exact format:

1. **Content Strategy Title**
   Description: Specific content strategy insight or recommendation.
   Type: strategy/tip/opportunity
   Priority: high/medium/low
   Category: content/strategy/engagement

2. **Content Strategy Title**
   Description: Specific content strategy insight or recommendation.
   Type: strategy/tip/opportunity
   Priority: high/medium/low
   Category: content/strategy/engagement

3. **Content Strategy Title**
   Description: Specific content strategy insight or recommendation.
   Type: strategy/tip/opportunity
   Priority: high/medium/low
   Category: content/strategy/engagement

4. **Content Strategy Title**
   Description: Specific content strategy insight or recommendation.
   Type: strategy/tip/opportunity
   Priority: high/medium/low
   Category: content/strategy/engagement

5. **Content Strategy Title**
   Description: Specific content strategy insight or recommendation.
   Type: strategy/tip/opportunity
   Priority: high/medium/low
   Category: content/strategy/engagement

NO additional text, explanations, or summaries.
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
    console.log('🔄 BusinessCoachingService.parseAgentResponse: Parsing AI response');
    console.log(`📝 Raw AI output: ${agentOutput.substring(0, 500)}...`);
    console.log(`📝 Full AI output length: ${agentOutput.length}`);

    const insights: BusinessInsight[] = [];
    
    try {
            if (insightType === 'daily_missions') {
        // Simple parser that extracts insights from the AI response
        console.log('🔍 Parsing daily missions from AI response...');
        
        // Split the response into lines and look for insights
        const lines = agentOutput.split('\n');
        let currentInsight = null;
        
        console.log(`📝 Total lines in response: ${lines.length}`);
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Debug: log lines that contain "Insight"
          if (line.includes('Insight')) {
            console.log(`🔍 Found insight line: "${line}"`);
          }
          
          // Look for insight patterns - multiple formats
          if ((line.includes('Insight') && line.match(/\d+:/)) || 
              (line.match(/^\d+\.\s*\*\*/)) || 
              (line.match(/^\d+\.\s+[A-Z]/))) {
            console.log(`✅ Processing insight line: "${line}"`);
            
            // Start of a new insight
            if (currentInsight && currentInsight.title && currentInsight.content) {
              console.log(`📝 Adding insight: "${currentInsight.title}"`);
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
            console.log(`📝 Extracted title: "${title}"`);
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
            console.log(`📝 Added content to insight: "${line}"`);
          }
        }
        
        // Add the last insight if it exists
        if (currentInsight && currentInsight.title && currentInsight.content) {
          console.log(`📝 Adding final insight: "${currentInsight.title}"`);
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
        
        console.log(`✅ Found ${insights.length} insights using simple parser`);
      } else if (insightType === 'weekly_goals') {
        // Simple parser for weekly goals (same as daily_missions)
        console.log('🔍 Parsing weekly goals from AI response...');
        
        const lines = agentOutput.split('\n');
        let currentInsight = null;
        
        console.log(`📝 Total lines in response: ${lines.length}`);
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Debug: log lines that contain "Goal"
          if (line.includes('Goal')) {
            console.log(`🔍 Found goal line: "${line}"`);
          }
          
          // Look for goal patterns - multiple formats
          if ((line.includes('Goal') && line.match(/\d+:/)) || 
              (line.match(/^\d+\.\s*\*\*/)) || 
              (line.match(/^\d+\.\s+[A-Z]/))) {
            console.log(`✅ Processing goal line: "${line}"`);
            
            // Start of a new goal
            if (currentInsight && currentInsight.title && currentInsight.content) {
              console.log(`📝 Adding goal: "${currentInsight.title}"`);
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
                timeline: 'This week',
                resources: []
              });
            }
            
            // Extract title from multiple formats
            let title = '';
            if (line.includes('Goal')) {
              title = line.replace(/.*?Goal \d+:\s*/, '').trim();
            } else if (line.match(/^\d+\.\s*\*\*/)) {
              title = line.replace(/^\d+\.\s*\*\*(.*?)\*\*/, '$1').trim();
            } else if (line.match(/^\d+\.\s+[A-Z]/)) {
              title = line.replace(/^\d+\.\s+/, '').trim();
            }
            console.log(`📝 Extracted title: "${title}"`);
            currentInsight = {
              title: title,
              content: '',
              priority: (insights.length === 0 ? 'high' : insights.length === 1 ? 'medium' : 'low') as 'high' | 'medium' | 'low',
              category: this.mapInsightTypeToCategory(insightType)
            };
          } else if (currentInsight && line && !line.startsWith('Why') && !line.startsWith('Action') && !line.startsWith('What to do')) {
            // Add content to current goal
            if (currentInsight.content) {
              currentInsight.content += ' ' + line;
            } else {
              currentInsight.content = line;
            }
            console.log(`📝 Added content to goal: "${line}"`);
          }
        }
        
        // Add the last goal if it exists
        if (currentInsight && currentInsight.title && currentInsight.content) {
          console.log(`📝 Adding final goal: "${currentInsight.title}"`);
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
            timeline: 'This week',
            resources: []
          });
        }
        
        console.log(`✅ Found ${insights.length} goals using simple parser`);
      } else if (insightType === 'ai_insights' || insightType === 'content_strategy') {
        // Simple parser for AI insights (same as daily_missions)
        console.log('🔍 Parsing AI insights from AI response...');
        
        const lines = agentOutput.split('\n');
        let currentInsight = null;
        
        console.log(`📝 Total lines in response: ${lines.length}`);
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          
          // Debug: log lines that contain "Insight"
          if (line.includes('Insight')) {
            console.log(`🔍 Found insight line: "${line}"`);
          }
          
          // Look for insight patterns - multiple formats
          if ((line.includes('Insight') && line.match(/\d+:/)) || 
              (line.match(/^\d+\.\s*\*\*/)) || 
              (line.match(/^\d+\.\s+[A-Z]/))) {
            console.log(`✅ Processing insight line: "${line}"`);
            
            // Start of a new insight
            if (currentInsight && currentInsight.title && currentInsight.content) {
              console.log(`📝 Adding insight: "${currentInsight.title}"`);
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
            console.log(`📝 Extracted title: "${title}"`);
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
            console.log(`📝 Added content to insight: "${line}"`);
          }
        }
        
        // Add the last insight if it exists
        if (currentInsight && currentInsight.title && currentInsight.content) {
          console.log(`📝 Adding final insight: "${currentInsight.title}"`);
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
        
        console.log(`✅ Found ${insights.length} insights using simple parser`);
      }
      
      // If no insights found, create fallback
      if (insights.length === 0) {
        console.log('⚠️ No insights found, creating fallback');
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

      console.log(`✅ Parsed ${insights.length} insights from AI response`);
      
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
      weekly_goals: 'strategy',
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