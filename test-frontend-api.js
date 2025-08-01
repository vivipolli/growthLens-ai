const fetch = require('node-fetch');

async function testFrontendAPI() {
  try {
    console.log('🧪 Testing Frontend API Call...');
    
    const payload = {
      userProfile: {
        personal: {
          name: 'Maria Silva',
          age: '26-35',
          location: 'São Paulo, Brazil',
          primary_motivation: 'Financial freedom',
          biggest_challenge: 'Time management',
          success_definition: 'Sustainable online business',
          core_values: ['Authenticity', 'Growth', 'Community'],
          work_style: 'Creative and flexible',
          dream_lifestyle: 'Working from home office',
          impact_goal: 'Help other women',
          fear: 'Not being good enough'
        },
        business: {
          industry: 'Digital Marketing',
          target_audience: {
            age_range: '26-35 years old',
            gender: 'Mixed gender',
            income_level: 'Middle class',
            education_level: 'Bachelor degree',
            location: 'São Paulo, Brazil',
            pain_points: 'Creating consistent content',
            goals_aspirations: 'Build online presence'
          }
        }
      },
      insightType: 'daily_missions'
    };

    const response = await fetch('http://localhost:3001/api/business/insights/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log('📥 API Response:', JSON.stringify(data, null, 2));

    // Simulate frontend processing
    if (data.insights) {
      console.log('✅ Insights found:', data.insights.length);
      
      const insights = data.insights;
      
      // Convert insights to missions
      const missions = insights.map((insight, index) => ({
        id: index + 1,
        title: insight.title,
        description: insight.content,
        status: 'pending',
        type: insight.category || 'strategy',
        estimatedTime: insight.timeline || '1-2 hours',
        priority: insight.priority || 'medium',
        category: insight.category || 'strategy'
      }));
      
      // Convert insights to goals
      const goals = insights.map((insight, index) => ({
        id: index + 1,
        title: insight.title,
        progress: 0,
        target: 100,
        unit: 'completion',
        status: 'in-progress',
        description: insight.content,
        timeline: insight.timeline || 'This week',
        priority: insight.priority || 'medium'
      }));
      
      console.log('🎯 Missions created:', missions.length);
      console.log('📈 Goals created:', goals.length);
      console.log('📊 Sample mission:', missions[0]);
      console.log('📊 Sample goal:', goals[0]);
    } else {
      console.log('❌ No insights found in response');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testFrontendAPI(); 