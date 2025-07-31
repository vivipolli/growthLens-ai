import { useState, useEffect, useCallback } from 'react';
import { businessCoachingService } from '../services/businessCoachingService.js';
import { isProfileComplete } from '../utils/userProfile.js';

export const useBusinessCoaching = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [insights, setInsights] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);

  const profileComplete = isProfileComplete();

  const generateInsights = useCallback(async (insightType, specificQuestion = null) => {
    if (!profileComplete) {
      setError('Please complete your profile first');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await businessCoachingService.generateInsights(insightType, specificQuestion);
      setInsights(response.insights || []);
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [profileComplete]);

  const getRecommendations = useCallback(async (category = null) => {
    if (!profileComplete) {
      setError('Please complete your profile first');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await businessCoachingService.getRecommendations(category);
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [profileComplete]);

  const sendMessage = useCallback(async (message) => {
    if (!profileComplete) {
      setError('Please complete your profile first');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await businessCoachingService.sendChatMessage(message, chatHistory);
      
      const newMessage = {
        id: Date.now(),
        type: 'ai',
        content: response.output,
        timestamp: response.timestamp || new Date().toISOString()
      };

      setChatHistory(prev => [...prev, 
        { id: Date.now() - 1, type: 'human', content: message, timestamp: new Date().toISOString() },
        newMessage
      ]);

      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [chatHistory, profileComplete]);

  const saveProfile = useCallback(async (profileData = null) => {
    setLoading(true);
    setError(null);

    try {
      const response = await businessCoachingService.saveProfile(profileData);
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAllInsights = useCallback(async () => {
    if (!profileComplete) {
      setError('Please complete your profile first');
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await businessCoachingService.getAllInsights();
      return response;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [profileComplete]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearChatHistory = useCallback(() => {
    setChatHistory([]);
  }, []);

  return {
    loading,
    error,
    insights,
    chatHistory,
    profileComplete,
    generateInsights,
    getRecommendations,
    sendMessage,
    saveProfile,
    getAllInsights,
    clearError,
    clearChatHistory,
    // Convenience methods for specific insight types
    getContentStrategy: (question) => generateInsights('content_strategy', question),
    getAudienceGrowth: (question) => generateInsights('audience_growth', question),
    getMonetization: (question) => generateInsights('monetization', question),
    getCompetitiveAnalysis: (question) => generateInsights('competitive_analysis', question),
    getGoalPlanning: (question) => generateInsights('goal_planning', question)
  };
}; 