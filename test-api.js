const fetch = require('node-fetch');

async function testDailyMissions() {
  try {
    console.log('🎯 Testing Daily Missions API...');
    const response = await fetch('http://localhost:3001/api/business/daily-missions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userProfile: {
          personal: {
            name: "Test User",
            location: "Brazil",
            age: 30,
            primary_motivation: "Financial Freedom",
            biggest_challenge: "Time Management",
            success_definition: "Build a successful online business",
            core_values: ["Integrity", "Innovation"],
            work_style: "Flexible",
            dream_lifestyle: "Location independent",
            impact_goal: "Help others succeed",
            fear: "Failure"
          },
          business: {
            industry: "Digital Marketing",
            target_audience: {
              age_range: "25-40",
              gender: "All",
              income_level: "Middle class",
              location: "Global",
              pain_points: "Lack of time",
              goals_aspirations: "Financial freedom"
            },
            main_offer: "Online courses",
            content_analysis: {
              competitive_gaps: "Not analyzed yet"
            }
          }
        }
      })
    });

    const data = await response.json();
    console.log('✅ Daily Missions Response:', JSON.stringify(data, null, 2));
    console.log('📊 Number of daily missions:', data.insights ? data.insights.length : 0);
  } catch (error) {
    console.error('❌ Daily Missions API Error:', error);
  }
}

async function testWeeklyGoals() {
  try {
    console.log('📈 Testing Weekly Goals API...');
    const response = await fetch('http://localhost:3001/api/business/weekly-goals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userProfile: {
          personal: {
            name: "Test User",
            location: "Brazil",
            age: 30,
            primary_motivation: "Financial Freedom",
            biggest_challenge: "Time Management",
            success_definition: "Build a successful online business",
            core_values: ["Integrity", "Innovation"],
            work_style: "Flexible",
            dream_lifestyle: "Location independent",
            impact_goal: "Help others succeed",
            fear: "Failure"
          },
          business: {
            industry: "Digital Marketing",
            target_audience: {
              age_range: "25-40",
              gender: "All",
              income_level: "Middle class",
              location: "Global",
              pain_points: "Lack of time",
              goals_aspirations: "Financial freedom"
            },
            main_offer: "Online courses",
            content_analysis: {
              competitive_gaps: "Not analyzed yet"
            }
          }
        }
      })
    });

    const data = await response.json();
    console.log('✅ Weekly Goals Response:', JSON.stringify(data, null, 2));
    console.log('📊 Number of weekly goals:', data.insights ? data.insights.length : 0);
  } catch (error) {
    console.error('❌ Weekly Goals API Error:', error);
  }
}

async function testAIInsights() {
  try {
    console.log('💡 Testing AI Insights API...');
    const response = await fetch('http://localhost:3001/api/business/ai-insights', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userProfile: {
          personal: {
            name: "Test User",
            location: "Brazil",
            age: 30,
            primary_motivation: "Financial Freedom",
            biggest_challenge: "Time Management",
            success_definition: "Build a successful online business",
            core_values: ["Integrity", "Innovation"],
            work_style: "Flexible",
            dream_lifestyle: "Location independent",
            impact_goal: "Help others succeed",
            fear: "Failure"
          },
          business: {
            industry: "Digital Marketing",
            target_audience: {
              age_range: "25-40",
              gender: "All",
              income_level: "Middle class",
              location: "Global",
              pain_points: "Lack of time",
              goals_aspirations: "Financial freedom"
            },
            main_offer: "Online courses",
            content_analysis: {
              competitive_gaps: "Not analyzed yet"
            }
          }
        }
      })
    });

    const data = await response.json();
    console.log('✅ AI Insights Response:', JSON.stringify(data, null, 2));
    console.log('📊 Number of AI insights:', data.insights ? data.insights.length : 0);
  } catch (error) {
    console.error('❌ AI Insights API Error:', error);
  }
}

async function testAllAPIs() {
  console.log('🚀 Testing all APIs separately...\n');
  
  await testDailyMissions();
  console.log('\n' + '='.repeat(50) + '\n');
  

  console.log('\n' + '='.repeat(50) + '\n');
  
  await testAIInsights();
  console.log('\n' + '='.repeat(50) + '\n');
  
  console.log('✅ All API tests completed!');
}

testAllAPIs(); 