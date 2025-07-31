const API_BASE_URL = 'http://localhost:3001/api/agent';

async function testBasicChat() {
  console.log('Testing basic chat...');
  
  const response = await fetch(`${API_BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: "What's my HBAR balance?",
      chatHistory: []
    })
  });

  const result = await response.json();
  console.log('Chat response:', result);
  return result;
}

async function testCreateTransaction() {
  console.log('Testing transaction creation...');
  
  const response = await fetch(`${API_BASE_URL}/transaction/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      message: "Transfer 1 HBAR to 0.0.12345",
      userAccountId: "0.0.67890",
      chatHistory: []
    })
  });

  const result = await response.json();
  console.log('Transaction creation response:', result);
  return result;
}

async function testSignTransaction() {
  console.log('Testing transaction signing...');
  
  const transactionResponse = await testCreateTransaction();
  
  if (transactionResponse.transactionBytes) {
    const response = await fetch(`${API_BASE_URL}/transaction/sign`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        transactionBytes: transactionResponse.transactionBytes,
        userAccountId: "0.0.67890",
        userPrivateKey: "your_user_private_key_here"
      })
    });

    const result = await response.json();
    console.log('Transaction signing response:', result);
    return result;
  } else {
    console.log('No transaction bytes to sign');
  }
}

async function testHealthCheck() {
  console.log('Testing health check...');
  
  const response = await fetch(`${API_BASE_URL}/health`);
  const result = await response.json();
  console.log('Health check response:', result);
  return result;
}

async function runAllTests() {
  try {
    await testHealthCheck();
    await testBasicChat();
    await testCreateTransaction();
  } catch (error) {
    console.error('Test failed:', error);
  }
}

if (typeof window === 'undefined') {
  runAllTests();
}

module.exports = {
  testBasicChat,
  testCreateTransaction,
  testSignTransaction,
  testHealthCheck,
  runAllTests
}; 