const API_BASE_URL = 'http://localhost:3001/api/business';

const sampleUserProfile = {
  personal: {
    name: "Ana Silva",
    age: "26-35",
    location: "São Paulo, Brazil",
    primary_motivation: "Financial freedom",
    biggest_challenge: "Finding my ideal customers and creating content that truly resonates with them",
    success_definition: "Having a profitable online business that allows me to work from anywhere while helping others achieve their fitness goals",
    core_values: ["Authenticity", "Health", "Growth"],
    work_style: "Creative and flexible",
    dream_lifestyle: "Working remotely, traveling while running my online fitness business, having time for family and personal wellness",
    impact_goal: "Help 1000+ people achieve their fitness goals and build confidence through sustainable habits",
    fear: "Spending time and money creating content that no one wants or failing to build a sustainable income"
  },
  business: {
    industry: "Health & Wellness",
    target_audience: {
      age_range: "26-35 years old",
      gender: "Primarily women",
      income_level: "Middle class ($50k-$80k/year)",
      education_level: "Bachelor's degree",
      location: "Urban areas in Brazil and Latin America",
      pain_points: "Struggling to maintain consistent workout routines, feeling overwhelmed by conflicting fitness advice, lack of motivation and accountability",
      goals_aspirations: "Want to feel confident in their bodies, develop healthy habits, have more energy for work and family, achieve specific fitness goals like weight loss or strength building"
    },
    competitors: [
      { name: "@gabrielaguglielmelli", link: "https://instagram.com/gabrielaguglielmelli" },
      { name: "@mairamedeiros", link: "https://instagram.com/mairamedeiros" }
    ],
    content_analysis: {
      engaging_aspects: "Personal transformation stories, workout videos with clear instructions, meal prep content, motivational quotes with personal experiences",
      visual_style: "Bright, energetic colors, before/after photos, workout demonstration videos, clean and modern layouts",
      competitive_gaps: "Not enough beginner-friendly content, lack of long-term habit-building focus, limited community interaction, missing content for busy professionals"
    },
    main_offer: "8-week online fitness transformation program with personalized workout plans, nutrition guidance, and weekly group coaching calls",
    pricing_strategy: "R$ 497 for the complete program, with payment plans available"
  },
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};

async function testBusinessChat() {
  console.log('🤖 Testing personalized business chat...');
  
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: "I'm struggling to create content that stands out. My competitors seem to have everything covered. How can I differentiate myself?",
      userProfile: sampleUserProfile,
      chatHistory: []
    })
  });

  const result = await response.json();
  console.log('Business chat response:', result);
  return result;
}

async function testGenerateContentInsights() {
  console.log('📝 Testing content strategy insights...');
  
  const response = await fetch(`${API_BASE_URL}/insights/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userProfile: sampleUserProfile,
      insightType: 'content_strategy',
      specificQuestion: 'How can I create content that appeals to busy professional women who want to start fitness but feel overwhelmed?'
    })
  });

  const result = await response.json();
  console.log('Content insights response:', result);
  return result;
}

async function testGenerateAudienceGrowthInsights() {
  console.log('📈 Testing audience growth insights...');
  
  const response = await fetch(`${API_BASE_URL}/insights/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userProfile: sampleUserProfile,
      insightType: 'audience_growth'
    })
  });

  const result = await response.json();
  console.log('Audience growth insights:', result);
  return result;
}

async function testGenerateMonetizationInsights() {
  console.log('💰 Testing monetization insights...');
  
  const response = await fetch(`${API_BASE_URL}/insights/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userProfile: sampleUserProfile,
      insightType: 'monetization'
    })
  });

  const result = await response.json();
  console.log('Monetization insights:', result);
  return result;
}

async function testSaveProfile() {
  console.log('💾 Testing profile save...');
  
  const response = await fetch(`${API_BASE_URL}/profile/save`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(sampleUserProfile)
  });

  const result = await response.json();
  console.log('Profile save response:', result);
  return result;
}

async function testGetRecommendations() {
  console.log('🎯 Testing personalized recommendations...');
  
  const response = await fetch(`${API_BASE_URL}/recommendations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userProfile: sampleUserProfile,
      category: 'goal_planning'
    })
  });

  const result = await response.json();
  console.log('Recommendations response:', result);
  return result;
}

async function runBusinessCoachingDemo() {
  console.log('🚀 Starting Business Coaching API Demo...\n');
  
  try {
    await testSaveProfile();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await testBusinessChat();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await testGenerateContentInsights();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await testGenerateAudienceGrowthInsights();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await testGenerateMonetizationInsights();
    console.log('\n' + '='.repeat(50) + '\n');
    
    await testGetRecommendations();
    
    console.log('\n✅ Business Coaching API Demo completed successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error);
  }
}

if (typeof window === 'undefined') {
  runBusinessCoachingDemo();
}

module.exports = {
  testBusinessChat,
  testGenerateContentInsights,
  testGenerateAudienceGrowthInsights,
  testGenerateMonetizationInsights,
  testSaveProfile,
  testGetRecommendations,
  runBusinessCoachingDemo,
  sampleUserProfile
}; 