const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const apiCall = async (endpoint, options = {}) => {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    console.log('🌐 Making API call to:', url);
    console.log('🔧 Options:', options);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    console.log('📤 Request config:', config);

    const response = await fetch(url, config);
    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('❌ API error:', errorData);
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ API response data:', data);
    return data;
  } catch (error) {
    console.error('❌ API call failed:', error);
    throw error;
  }
};

export const apiEndpoints = {
  agent: {
    health: '/api/agent/health',
    chat: '/api/agent/chat',
    createTransaction: '/api/agent/transaction/create',
    signTransaction: '/api/agent/transaction/sign'
  },
  business: {
    chat: '/api/business/chat',
    generateInsights: '/api/business/insights/generate',
    saveProfile: '/api/business/profile/save',
    getProfile: '/api/business/profile',
    recommendations: '/api/business/recommendations',
    saveUserProfile: '/api/business/profile/save',
    saveBusinessData: '/api/business/business/save',
    saveMissionCompletion: '/api/business/mission/save',
    getUserData: '/api/business/user/:userId/data',
    getTopicInfo: '/api/business/user/:userId/topic'
  }
}; 