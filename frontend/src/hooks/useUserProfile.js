import { useState, useEffect, useCallback } from 'react';
import { 
  getUserProfile, 
  isProfileComplete, 
  getPersonalProfile, 
  getBusinessProfile,
  savePersonalProfile,
  saveBusinessProfile,
  clearUserProfile
} from '../utils/userProfile.js';
import { businessCoachingService } from '../services/businessCoachingService.js';

export const useUserProfile = () => {
  const [profile, setProfile] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refreshProfile = useCallback(() => {
    const userProfile = getUserProfile();
    const complete = isProfileComplete();
    
    setProfile(userProfile);
    setProfileComplete(complete);
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const savePersonal = useCallback((personalData) => {
    setLoading(true);
    setError(null);

    try {
      const success = savePersonalProfile(personalData);
      if (success) {
        refreshProfile();
        return true;
      } else {
        setError('Failed to save personal profile');
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  const saveBusiness = useCallback((businessData) => {
    setLoading(true);
    setError(null);

    try {
      const success = saveBusinessProfile(businessData);
      if (success) {
        refreshProfile();
        return true;
      } else {
        setError('Failed to save business profile');
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  const saveCompleteProfile = useCallback(async () => {
    if (!profileComplete) {
      setError('Profile is not complete');
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await businessCoachingService.saveProfile();
      return response && response.success;
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [profileComplete]);

  const clearProfile = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      const success = clearUserProfile();
      if (success) {
        refreshProfile();
        return true;
      } else {
        setError('Failed to clear profile');
        return false;
      }
    } catch (err) {
      setError(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [refreshProfile]);

  const getPersonal = useCallback(() => {
    return getPersonalProfile();
  }, []);

  const getBusiness = useCallback(() => {
    return getBusinessProfile();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    profile,
    profileComplete,
    loading,
    error,
    savePersonal,
    saveBusiness,
    saveCompleteProfile,
    clearProfile,
    getPersonal,
    getBusiness,
    refreshProfile,
    clearError
  };
}; 