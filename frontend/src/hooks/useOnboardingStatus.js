import { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { businessCoachingService } from '../services/businessCoachingService';

export const useOnboardingStatus = () => {
    const { user } = useUser();
    const [isComplete, setIsComplete] = useState(false);
    const [nextStep, setNextStep] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkOnboardingStatus = async () => {
            if (!user?.id) {
                setLoading(false);
                return;
            }

            try {
                console.log('🔍 Checking onboarding status from blockchain...');
                const response = await businessCoachingService.getUserDataFromBlockchain(user.id);
                
                if (response.success && response.data) {
                    const { userProfile, businessData } = response.data;
                    
                    console.log('📊 Blockchain data:', {
                        hasUserProfile: !!userProfile,
                        hasBusinessData: !!businessData
                    });

                    // Check if both personal and business data exist
                    const hasPersonalData = userProfile && Object.keys(userProfile).length > 0;
                    const hasBusinessData = businessData && Object.keys(businessData).length > 0;

                    if (hasPersonalData && hasBusinessData) {
                        console.log('✅ Onboarding complete - both personal and business data found');
                        setIsComplete(true);
                        setNextStep(null);
                    } else if (hasPersonalData && !hasBusinessData) {
                        console.log('🔄 Personal complete, business pending');
                        setIsComplete(false);
                        setNextStep('/onboarding/business');
                    } else {
                        console.log('🔄 Personal onboarding needed');
                        setIsComplete(false);
                        setNextStep('/onboarding/personal');
                    }
                } else {
                    console.log('🔄 No blockchain data found, starting with personal onboarding');
                    setIsComplete(false);
                    setNextStep('/onboarding/personal');
                }
            } catch (error) {
                console.error('❌ Error checking onboarding status:', error);
                setIsComplete(false);
                setNextStep('/onboarding/personal');
            } finally {
                setLoading(false);
            }
        };

        checkOnboardingStatus();
    }, [user?.id]);

    return {
        isComplete,
        nextStep,
        loading,
        userId: user?.id
    };
}; 