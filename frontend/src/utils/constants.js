export const INSIGHT_TYPES = {
  CONTENT_STRATEGY: 'content_strategy',
  AUDIENCE_GROWTH: 'audience_growth',
  MONETIZATION: 'monetization',
  COMPETITIVE_ANALYSIS: 'competitive_analysis',
  GOAL_PLANNING: 'goal_planning'
};

export const INSIGHT_CATEGORIES = {
  CONTENT: 'content',
  AUDIENCE: 'audience',
  MONETIZATION: 'monetization',
  STRATEGY: 'strategy',
  PERSONAL_DEVELOPMENT: 'personal_development'
};

export const INSIGHT_PRIORITIES = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const INSIGHT_STATUSES = {
  PERFORMANCE: 'performance',
  OPPORTUNITY: 'opportunity',
  REMINDER: 'reminder',
  WARNING: 'warning',
  SUCCESS: 'success',
  STRATEGY: 'strategy'
};

export const STORAGE_KEYS = {
  PERSONAL_ONBOARDING: 'personalOnboardingAnswers',
  BUSINESS_ONBOARDING: 'businessOnboardingAnswers',
  CHAT_HISTORY: 'chatHistory',
  USER_PREFERENCES: 'userPreferences'
};

export const API_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
};

export const MESSAGE_TYPES = {
  HUMAN: 'human',
  AI: 'ai',
  SYSTEM: 'system'
};

export const BUSINESS_PHASES = {
  DISCOVER: 'discover',
  ANALYZE: 'analyze',
  LAUNCH: 'launch',
  GROW: 'grow',
  SCALE: 'scale'
};

export const DEFAULT_INSIGHT_LIMITS = {
  PER_REQUEST: 5,
  CACHE_DURATION: 300000 // 5 minutes in milliseconds
}; 