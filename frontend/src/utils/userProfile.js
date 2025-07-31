export const getUserProfile = () => {
  try {
    const personal = JSON.parse(localStorage.getItem('personalOnboardingAnswers') || '{}');
    const business = JSON.parse(localStorage.getItem('businessOnboardingAnswers') || '{}');
    
    if (!personal.name || !business.industry) return null;

    return {
      personal: {
        name: personal.name || '',
        age: personal.age || '',
        location: personal.location || '',
        primary_motivation: personal.primary_motivation || '',
        biggest_challenge: personal.biggest_challenge || '',
        success_definition: personal.success_definition || '',
        core_values: personal.core_values || [],
        work_style: personal.work_style || '',
        dream_lifestyle: personal.dream_lifestyle || '',
        impact_goal: personal.impact_goal || '',
        fear: personal.fear || ''
      },
      business: {
        industry: business.industry || '',
        target_audience: {
          age_range: business.age_range || '',
          gender: business.gender || '',
          income_level: business.income_level || '',
          education_level: business.education_level || '',
          location: business.location || '',
          pain_points: business.pain_points || '',
          goals_aspirations: business.goals_aspirations || ''
        },
        competitors: business.competitor_profiles || [],
        content_analysis: {
          engaging_aspects: business.engaging_content_aspects || '',
          visual_style: business.visual_communication_style || '',
          competitive_gaps: business.competitive_gaps || ''
        },
        main_offer: business.main_offer || '',
        pricing_strategy: business.pricing_strategy || ''
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error building user profile:', error);
    return null;
  }
};

export const isProfileComplete = () => {
  const profile = getUserProfile();
  return profile && profile.personal.name && profile.business.industry;
};

export const getPersonalProfile = () => {
  try {
    const personal = JSON.parse(localStorage.getItem('personalOnboardingAnswers') || '{}');
    return personal.name ? personal : null;
  } catch (error) {
    console.error('Error getting personal profile:', error);
    return null;
  }
};

export const getBusinessProfile = () => {
  try {
    const business = JSON.parse(localStorage.getItem('businessOnboardingAnswers') || '{}');
    return business.industry ? business : null;
  } catch (error) {
    console.error('Error getting business profile:', error);
    return null;
  }
};

export const savePersonalProfile = (data) => {
  try {
    localStorage.setItem('personalOnboardingAnswers', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving personal profile:', error);
    return false;
  }
};

export const saveBusinessProfile = (data) => {
  try {
    localStorage.setItem('businessOnboardingAnswers', JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving business profile:', error);
    return false;
  }
};

export const saveUserProfile = (userProfile) => {
  try {
    if (userProfile.personal) {
      localStorage.setItem('personalOnboardingAnswers', JSON.stringify(userProfile.personal));
    }
    if (userProfile.business) {
      localStorage.setItem('businessOnboardingAnswers', JSON.stringify(userProfile.business));
    }
    return true;
  } catch (error) {
    console.error('Error saving user profile:', error);
    return false;
  }
};

export const clearUserProfile = () => {
  try {
    localStorage.removeItem('personalOnboardingAnswers');
    localStorage.removeItem('businessOnboardingAnswers');
    return true;
  } catch (error) {
    console.error('Error clearing user profile:', error);
    return false;
  }
}; 