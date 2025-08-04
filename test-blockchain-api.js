const API_BASE_URL = 'http://localhost:3001';

async function testBlockchainAPI() {
  console.log('🧪 Testing Blockchain API...');
  
  try {
    // Test 1: Get user data from blockchain
    console.log('\n📋 Test 1: Getting user data from blockchain...');
    const response1 = await fetch(`${API_BASE_URL}/api/business/user/test/data`);
    const data1 = await response1.json();
    console.log('✅ Response 1:', JSON.stringify(data1, null, 2));
    
    // Test 2: Get user data for "Maria Silva"
    console.log('\n📋 Test 2: Getting user data for "Maria Silva"...');
    const response2 = await fetch(`${API_BASE_URL}/api/business/user/Maria%20Silva/data`);
    const data2 = await response2.json();
    console.log('✅ Response 2:', JSON.stringify(data2, null, 2));
    
    // Test 3: Get topic info
    console.log('\n📋 Test 3: Getting topic info for "test"...');
    const response3 = await fetch(`${API_BASE_URL}/api/business/user/test/topic`);
    const data3 = await response3.json();
    console.log('✅ Response 3:', JSON.stringify(data3, null, 2));
    
    // Test 4: Debug cache
    console.log('\n📋 Test 4: Debug cache for "test"...');
    const response4 = await fetch(`${API_BASE_URL}/api/business/test/debug-cache/test`);
    const data4 = await response4.json();
    console.log('✅ Response 4:', JSON.stringify(data4, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing blockchain API:', error);
  }
}

testBlockchainAPI(); 