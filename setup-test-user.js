// Script para configurar dados de teste no localStorage
// Execute este script no console do navegador

console.log('🔧 Setting up test user data...');

// Configurar dados pessoais
const personalData = {
  name: "undefined", // Usar o userId que tem dados na blockchain
  age: "30",
  location: "São Paulo, Brazil",
  primary_motivation: "Build a successful online business",
  biggest_challenge: "Getting consistent traffic",
  success_definition: "Having a profitable business that helps people",
  core_values: ["Authenticity", "Quality", "Innovation"],
  work_style: "Structured and focused",
  dream_lifestyle: "Location independent with financial freedom",
  impact_goal: "Help 1000+ people achieve their goals",
  fear: "Not reaching my potential"
};

// Configurar dados de negócio
const businessData = {
  industry: "Digital Marketing",
  age_range: "25-45",
  gender: "All",
  income_level: "Middle to high",
  education_level: "College educated",
  location: "Global",
  pain_points: "Lack of consistent income",
  goals_aspirations: "Build passive income streams",
  competitor_profiles: ["Competitor A", "Competitor B"],
  engaging_content_aspects: "Educational and actionable",
  visual_communication_style: "Clean and professional",
  competitive_gaps: "More personalized approach",
  main_offer: "Digital marketing coaching",
  pricing_strategy: "Premium value-based pricing"
};

// Salvar no localStorage
localStorage.setItem('personalOnboardingAnswers', JSON.stringify(personalData));
localStorage.setItem('businessOnboardingAnswers', JSON.stringify(businessData));

console.log('✅ Test user data configured!');
console.log('📋 Personal data:', personalData);
console.log('📋 Business data:', businessData);
console.log('🔄 Now refresh the page and go to Progress to see the blockchain data!'); 