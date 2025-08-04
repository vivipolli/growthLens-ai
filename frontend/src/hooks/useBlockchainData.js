import { useState, useEffect } from 'react';
import { businessCoachingService } from '../services/businessCoachingService';

export const useBlockchainData = (userId) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadUserData = async () => {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      console.log(`🔄 Loading user data from blockchain for: ${userId}`);
      const response = await businessCoachingService.getUserDataFromBlockchain(userId);
      
      if (response.success) {
        console.log('✅ User data loaded from blockchain:', response.data);
        setUserData(response.data);
        
        // Log if this is a new user with no data
        if (response.message && response.message.includes('No data found')) {
          console.log('ℹ️  New user detected - no data yet, this is normal');
        }
      } else {
        console.log('❌ Error loading user data:', response.error);
        setUserData(null);
        setError(response.error);
      }
    } catch (error) {
      console.error('❌ Error loading user data from blockchain:', error);
      setError(error.message || 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const loadTopicInfo = async () => {
    if (!userId) return null;

    try {
      console.log(`🔄 Loading topic info for: ${userId}`);
      const response = await businessCoachingService.getTopicInfo(userId);
      
      if (response.success) {
        console.log('✅ Topic info loaded:', response.data);
        return response.data;
      } else {
        console.log('❌ No topic found for user:', userId);
        return null;
      }
    } catch (error) {
      console.error('❌ Error loading topic info:', error);
      return null;
    }
  };

  useEffect(() => {
    if (userId) {
      loadUserData();
    }
  }, [userId]);

  return {
    userData,
    loading,
    error,
    loadUserData,
    loadTopicInfo,
    hasData: userData !== null,
    isNewUser: userData && userData.aiInsights && userData.aiInsights.length === 0 && !userData.userProfile && !userData.businessData
  };
}; 