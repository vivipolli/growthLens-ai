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
      } else {
        console.log('❌ No data found for user:', userId);
        setUserData(null);
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
    hasData: userData !== null
  };
}; 