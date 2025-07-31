import { useState, useEffect, useCallback } from 'react';
import { businessCoachingService } from '../services/businessCoachingService.js';

const MISSIONS_STORAGE_KEY = 'daily_missions';
const MISSIONS_DATE_KEY = 'daily_missions_date';

export const useDailyMissions = () => {
  const [missions, setMissions] = useState([]);
  const [weeklyGoals, setWeeklyGoals] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastGenerated, setLastGenerated] = useState(null);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Remove default data - only show real API data
  const defaultMissions = [];
  const defaultWeeklyGoals = [];
  const defaultInsights = [];

  const isToday = (dateString) => {
    if (!dateString) return false;
    const today = new Date().toDateString();
    const stored = new Date(dateString).toDateString();
    return today === stored;
  };

  const loadStoredMissions = useCallback(() => {
    try {
      const storedMissions = localStorage.getItem(MISSIONS_STORAGE_KEY);
      const storedDate = localStorage.getItem(MISSIONS_DATE_KEY);
      
      console.log('📂 Checking stored missions...');
      console.log('📅 Stored date:', storedDate);
      console.log('📊 Stored missions exist:', !!storedMissions);
      console.log('📊 Is today:', storedDate ? isToday(storedDate) : false);
      
      if (storedMissions && storedDate && isToday(storedDate)) {
        const parsed = JSON.parse(storedMissions);
        console.log('✅ Loading stored data:', parsed);
        console.log('📋 Stored insights:', parsed.aiInsights);
        setMissions(parsed.missions || []);
        setWeeklyGoals(parsed.weeklyGoals || []);
        setAiInsights(parsed.aiInsights || []);
        setLastGenerated(new Date(storedDate));
        return true;
      }
      console.log('❌ No valid stored data found, will generate fresh data');
      return false;
    } catch (error) {
      console.error('Error loading stored missions:', error);
      return false;
    }
  }, []);

  const saveMissions = useCallback((missionsData, goals, insights) => {
    try {
      const data = {
        missions: missionsData,
        weeklyGoals: goals,
        aiInsights: insights
      };
      localStorage.setItem(MISSIONS_STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem(MISSIONS_DATE_KEY, new Date().toISOString());
    } catch (error) {
      console.error('Error saving missions:', error);
    }
  }, []);

  const parseAIResponse = (apiResponse) => {
    try {
      // If the response has an 'output' field, extract it
      let responseText = apiResponse;
      if (apiResponse && typeof apiResponse === 'object' && apiResponse.output) {
        responseText = apiResponse.output;
        console.log('📦 Extracted output from API response:', responseText);
      }
      
      // If responseText is already an array, return it directly
      if (Array.isArray(responseText)) {
        return responseText;
      }
      
      // If responseText is a string, try to parse it
      if (typeof responseText === 'string') {
        const cleanedResponse = responseText
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .replace(/^\s*[\w\s]*:/gm, '')
          .trim();
        
        let startIndex = cleanedResponse.indexOf('[');
        let endIndex = cleanedResponse.lastIndexOf(']') + 1;
        
        if (startIndex !== -1 && endIndex !== -1) {
          const jsonString = cleanedResponse.slice(startIndex, endIndex);
          return JSON.parse(jsonString);
        }
        
        return JSON.parse(cleanedResponse);
      }
      
      return responseText;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Raw response was:', apiResponse);
      return null;
    }
  };

  const generateAIMissions = useCallback(async () => {
    console.log('🔄 generateAIMissions called');
    setLoading(true);
    setError(null);
    setHasAttemptedLoad(true);
    
    try {
      console.log('📡 Starting API calls...');
      const [missionsResponse, goalsResponse, insightsResponse] = await Promise.allSettled([
        businessCoachingService.generateDailyMissions(),
        businessCoachingService.generateWeeklyGoals(),
        businessCoachingService.generatePersonalizedInsights()
      ]);

      console.log('📡 API responses:', { missionsResponse, goalsResponse, insightsResponse });

      let newMissions = [];
      let newGoals = [];
      let newInsights = [];

      if (missionsResponse.status === 'fulfilled') {
        console.log('✅ Missions response fulfilled:', missionsResponse.value);
        const parsedMissions = parseAIResponse(missionsResponse.value);
        if (parsedMissions && Array.isArray(parsedMissions)) {
          newMissions = parsedMissions;
          console.log('✅ Parsed missions:', newMissions);
        }
      } else {
        console.error('❌ Missions failed:', missionsResponse.reason);
      }

      if (goalsResponse.status === 'fulfilled') {
        console.log('✅ Goals response fulfilled:', goalsResponse.value);
        const parsedGoals = parseAIResponse(goalsResponse.value);
        if (parsedGoals && Array.isArray(parsedGoals)) {
          newGoals = parsedGoals;
          console.log('✅ Parsed goals:', newGoals);
        }
      } else {
        console.error('❌ Goals failed:', goalsResponse.reason);
      }

      if (insightsResponse.status === 'fulfilled') {
        console.log('✅ Insights response fulfilled:', insightsResponse.value);
        const parsedInsights = parseAIResponse(insightsResponse.value);
        if (parsedInsights && Array.isArray(parsedInsights)) {
          newInsights = parsedInsights;
          console.log('✅ Parsed insights:', newInsights);
        } else {
          console.warn('⚠️ Invalid insights format, using empty array:', parsedInsights);
        }
      } else {
        console.error('❌ Insights failed:', insightsResponse.reason);
      }

      setMissions(newMissions);
      setWeeklyGoals(newGoals);
      setAiInsights(newInsights);
      
      saveMissions(newMissions, newGoals, newInsights);
      setLastGenerated(new Date());
      
      console.log('✅ All missions updated successfully');
      
    } catch (err) {
      console.error('❌ Error generating AI missions:', err);
      setError('Failed to generate personalized missions. Please try refreshing.');
      setMissions([]);
      setWeeklyGoals([]);
      setAiInsights([]);
    } finally {
      setLoading(false);
    }
  }, [saveMissions]);

  const completeMission = useCallback((missionId) => {
    setMissions(prev => {
      const updated = prev.map(mission => 
        mission.id === missionId 
          ? { ...mission, status: 'completed' }
          : mission
      );
      
      const goals = weeklyGoals;
      const insights = aiInsights;
      saveMissions(updated, goals, insights);
      return updated;
    });
  }, [weeklyGoals, aiInsights, saveMissions]);

  const updateGoalProgress = useCallback((goalId, newProgress) => {
    setWeeklyGoals(prev => {
      const updated = prev.map(goal => 
        goal.id === goalId 
          ? { ...goal, progress: newProgress }
          : goal
      );
      
      const missionsData = missions;
      const insights = aiInsights;
      saveMissions(missionsData, updated, insights);
      return updated;
    });
  }, [missions, aiInsights, saveMissions]);

  useEffect(() => {
    const hasStoredData = loadStoredMissions();
    setHasAttemptedLoad(true);
    
    // Don't load default data - let it remain empty until API call
    if (!hasStoredData) {
      console.log('📭 No stored data found, waiting for API call...');
    }
  }, [loadStoredMissions]);

  const refreshMissions = useCallback(() => {
    console.log('🔄 refreshMissions called');
    generateAIMissions();
  }, [generateAIMissions]);

  const clearCache = useCallback(() => {
    console.log('🗑️ Clearing missions cache...');
    localStorage.removeItem(MISSIONS_STORAGE_KEY);
    localStorage.removeItem(MISSIONS_DATE_KEY);
    setMissions([]);
    setWeeklyGoals([]);
    setAiInsights([]);
    setLastGenerated(null);
    console.log('✅ Cache cleared, generating fresh missions...');
    generateAIMissions();
  }, [generateAIMissions]);

  const getCompletedMissionsCount = useCallback(() => {
    return missions.filter(mission => mission.status === 'completed').length;
  }, [missions]);

  const getTotalMissionsCount = useCallback(() => {
    return missions.length;
  }, [missions]);

  return {
    missions,
    weeklyGoals,
    aiInsights,
    loading,
    error,
    lastGenerated,
    hasAttemptedLoad,
    completeMission,
    updateGoalProgress,
    generateAIMissions,
    refreshMissions,
    clearCache,
    getCompletedMissionsCount,
    getTotalMissionsCount
  };
}; 