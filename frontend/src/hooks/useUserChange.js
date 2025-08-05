import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';

export const useUserChange = () => {
    const { user } = useUser();
    const [isNewUser, setIsNewUser] = useState(false);
    const [needsOnboarding, setNeedsOnboarding] = useState(false);

    useEffect(() => {
        if (!user?.id) return;

        const lastUserId = localStorage.getItem('lastLoggedInUserId');

        // Check if this is a new user
        if (lastUserId && lastUserId !== user.id) {
            console.log(`🔄 User changed: ${lastUserId} → ${user.id}`);
            setIsNewUser(true);
            setNeedsOnboarding(true);
        } else {
            // For now, always force onboarding since we're not checking blockchain data
            setIsNewUser(false);
            setNeedsOnboarding(true);
        }

        // Save current user ID
        localStorage.setItem('lastLoggedInUserId', user.id);

    }, [user?.id]);

    const resetUserData = () => {
        console.log('🔄 Resetting user data...');
        // No localStorage to clear, just force onboarding
        setNeedsOnboarding(true);
    };

    return {
        isNewUser,
        needsOnboarding,
        resetUserData,
        userId: user?.id
    };
}; 