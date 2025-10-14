import fetch from 'node-fetch';

// Simple test to verify our API is working
const testHealthEndpoint = async () => {
  try {
    console.log('Testing health endpoint...');
    const response = await fetch('http://localhost:5000/health');
    if (!response.ok) {
      console.error(`Health check failed with status: ${response.status}`);
      return;
    }
    const data = await response.json();
    console.log('✅ Health check successful:', data);
    return data;
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    return null;
  }
};

const testAskEndpoint = async () => {
  try {
    console.log('Testing ask endpoint...');
    const response = await fetch('http://localhost:5000/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: 'Hello! What is 2+2?' })
    });
    
    if (!response.ok) {
      console.error(`Ask endpoint failed with status: ${response.status}`);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('✅ Ask endpoint successful:', data);
    return data;
  } catch (error) {
    console.error('❌ Ask endpoint failed:', error.message);
    return null;
  }
};

// Run tests
const runTests = async () => {
  console.log('🧪 Testing API endpoints...\n');
  
  const healthResult = await testHealthEndpoint();
  console.log('');
  
  if (healthResult && healthResult.status === 'ok') {
    await testAskEndpoint();
  } else {
    console.log('⚠️  Skipping ask endpoint test due to health check failure');
  }
  
  console.log('\n🏁 Test completed');
};

runTests().catch(console.error);