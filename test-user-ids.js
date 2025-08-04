const API_BASE_URL = 'http://localhost:3001';

async function testUserIds() {
  console.log('🧪 Testing different user IDs...');
  
  const testUsers = [
    'test',
    'Maria Silva', 
    'anonymous',
    'undefined',
    'Test User'
  ];
  
  for (const userId of testUsers) {
    console.log(`\n📋 Testing userId: "${userId}"`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/business/user/${encodeURIComponent(userId)}/data`);
      const data = await response.json();
      
      console.log(`✅ Response for "${userId}":`);
      console.log(`   - Success: ${data.success}`);
      console.log(`   - Has userProfile: ${!!data.data?.userProfile}`);
      console.log(`   - Has businessData: ${!!data.data?.businessData}`);
      console.log(`   - AI Insights count: ${data.data?.aiInsights?.length || 0}`);
      console.log(`   - Mission Completions count: ${data.data?.missionCompletions?.length || 0}`);
      
      if (data.data?.missionCompletions?.length > 0) {
        console.log(`   - Mission Completions:`, data.data.missionCompletions);
      }
      
    } catch (error) {
      console.error(`❌ Error testing "${userId}":`, error.message);
    }
  }
}

testUserIds(); 