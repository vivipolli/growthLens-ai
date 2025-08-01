export interface PersonalProfile {
  name: string;
  age: string;
  location: string;
  primary_motivation: string;
  biggest_challenge: string;
  success_definition: string;
  core_values: string[];
  work_style: string;
  dream_lifestyle: string;
  impact_goal: string;
  fear: string;
}

export interface BusinessProfile {
  industry: string;
  target_audience: {
    age_range: string;
    gender: string;
    income_level: string;
    education_level: string;
    location: string;
    pain_points: string;
    goals_aspirations: string;
  };
  competitors: Array<{
    name: string;
    link: string;
  }>;
  content_analysis: {
    engaging_aspects: string;
    visual_style: string;
    competitive_gaps: string;
  };
  main_offer: string;
  pricing_strategy?: string;
}

export interface UserProfile {
  personal: PersonalProfile;
  business: BusinessProfile;
  created_at: string;
  updated_at: string;
}

export interface BusinessInsightRequest {
  userProfile: UserProfile;
  insightType: 'content_strategy' | 'audience_growth' | 'monetization' | 'competitive_analysis' | 'goal_planning' | 'daily_missions' | 'weekly_goals' | 'ai_insights';
  specificQuestion?: string;
}

export interface BusinessInsight {
  id: string;
  type: 'performance' | 'opportunity' | 'reminder' | 'warning' | 'success' | 'strategy';
  title: string;
  content: string;
  priority: 'high' | 'medium' | 'low';
  category: 'content' | 'audience' | 'monetization' | 'strategy' | 'personal_development';
  action: string;
  impact: string;
  confidence: number;
  reasoning: string;
  timeline: string;
  resources?: string[];
}

export interface BusinessInsightResponse {
  insights: BusinessInsight[];
  summary: string;
  nextSteps: string[];
  personalized_message: string;
} 