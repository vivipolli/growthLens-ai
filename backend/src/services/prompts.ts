export const createContextualPrompt = (userProfile: any, insightType: string, specificQuestion?: string, progressData?: any): string => {
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

CURRENT PROGRESS CONTEXT:
${progressData ? `
- Recent missions completed: ${progressData.completedMissions || 0} out of ${progressData.totalMissions || 0}
- Mission completion rate: ${progressData.completionRate || 0}%
- Active mission categories: ${progressData.activeMissionCategories || 'Not available'}
- Recent activity areas: ${progressData.recentActivityAreas || 'Not available'}
- Progress trends: ${progressData.progressTrends || 'Starting journey'}
` : '- Progress data: Not available (new user or first session)'}

Based on this context, provide ${insightType} insights and recommendations.
${specificQuestion ? `Specific question: ${specificQuestion}` : ''}

Respond with PRACTICAL, ACTIONABLE advice that:
1. Addresses their specific situation and challenges
2. Aligns with their values and work style
3. Considers their target audience
4. Analyzes their current progress and momentum
5. Provides concrete next steps based on completed missions
6. Acknowledges their fears while encouraging growth

Be encouraging but realistic. Focus on scalable digital strategies and build upon their recent progress.
`;

  return contextPrompt;
};

export const generateInsightTypePrompt = (insightType: string): string => {
  const prompts: Record<string, string> = {
    daily_missions: `
Generate exactly 4 DAILY MISSIONS for TODAY that are actionable, quick tasks (15-60 minutes each).

CRITICAL: Respond ONLY with exactly 4 missions in this exact format:

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

Examples of good missions:
- "Post Instagram story about your morning routine"
- "Research 3 competitors' pricing strategies"
- "Update LinkedIn profile with recent achievements"
- "Create 3 content ideas for next week"

IMPORTANT: Do NOT include any introductory text, explanations, or summaries. Start directly with "1. **Mission Title**" and end after the 4th mission.
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
`,
    business_observations: `
Generate exactly 3 BUSINESS INSIGHTS as general text observations about their business progress and strategic recommendations.

CRITICAL: Respond ONLY with exactly 3 insights in this exact format:

1. **Insight Title**
   A comprehensive paragraph of strategic business insight analyzing their current progress, market position, and specific recommendations. Write in natural, flowing text that discusses their business situation, completed missions impact, and actionable next steps. Be specific to their industry, target audience, and current challenges. This should be conversational and analytical, not bullet points.

2. **Insight Title**
   A comprehensive paragraph of strategic business insight analyzing their current progress, market position, and specific recommendations. Write in natural, flowing text that discusses their business situation, completed missions impact, and actionable next steps. Be specific to their industry, target audience, and current challenges. This should be conversational and analytical, not bullet points.

3. **Insight Title**
   A comprehensive paragraph of strategic business insight analyzing their current progress, market position, and specific recommendations. Write in natural, flowing text that discusses their business situation, completed missions impact, and actionable next steps. Be specific to their industry, target audience, and current challenges. This should be conversational and analytical, not bullet points.

Examples of good business insights:
- "Progress Analysis": "Based on your recent mission completions in content creation and social engagement, you're building solid momentum in establishing your digital presence. Your consistent posting schedule is starting to show results, and the engagement patterns suggest your target audience in [industry] is responding well to your authentic approach. To capitalize on this momentum, consider developing a signature content series that addresses your audience's core challenges while showcasing your expertise. This will help position you as the go-to expert in your niche while building deeper connections with potential clients."

- "Market Opportunity": "Your industry is experiencing a significant shift towards [specific trend], and your unique positioning gives you an advantage to capture this emerging market. The missions you've completed around competitor analysis reveal gaps in how others are serving your target demographic. There's a clear opportunity to differentiate yourself by focusing on the specific pain points you've identified - particularly around [specific issue]. Consider developing a specialized offering that directly addresses this gap, as early movers in this space typically see 40-60% higher conversion rates."

Focus on:
- Their specific business context and form data
- Analysis of their completed vs pending missions
- Strategic market insights relevant to their industry
- Personalized recommendations based on their progress
- Forward-looking growth opportunities

Write in a natural, analytical tone as if you're a business consultant reviewing their progress and providing strategic guidance.

NO additional formatting, explanations, or summaries beyond the 3 insights.
`
  };

  return prompts[insightType] || prompts.content_strategy;
}; 