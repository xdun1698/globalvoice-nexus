const axios = require('./backend/node_modules/axios').default || require('./backend/node_modules/axios');

const BACKEND_URL = 'https://globalvoice-backend.fly.dev';

async function verify() {
  try {
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: 'admin@test.com',
      password: 'Admin123!'
    });
    
    const token = loginResponse.data.token;
    
    const agentsResponse = await axios.get(`${BACKEND_URL}/api/agents`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const agents = Array.isArray(agentsResponse.data) ? agentsResponse.data : agentsResponse.data.agents || [];
    const tom = agents.find(a => a.name === 'Tom - Collections Agent');
    
    console.log('Tom Agent Configuration:');
    console.log('========================');
    console.log(`ID: ${tom.id}`);
    console.log(`Name: ${tom.name}`);
    console.log(`Voice (Polly): ${tom.voice}`);
    console.log(`ElevenLabs Voice: ${tom.elevenlabs_voice}`);
    console.log(`Gender: ${tom.gender || 'NOT SET'}`);
    console.log(`Greeting: ${tom.greeting?.substring(0, 80)}...`);
    console.log(`System Prompt: ${tom.system_prompt?.substring(0, 80)}...`);
    
    console.log('\n\nPROBLEM CHECK:');
    if (!tom.elevenlabs_voice) {
      console.log('❌ elevenlabs_voice is NOT SET!');
      console.log('   This is why you hear the default female voice');
    } else {
      console.log(`✅ elevenlabs_voice is set to: ${tom.elevenlabs_voice}`);
    }
    
    const phoneResponse = await axios.get(`${BACKEND_URL}/api/phone-numbers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const phones = Array.isArray(phoneResponse.data) ? phoneResponse.data : phoneResponse.data.phoneNumbers || [];
    const phone = phones.find(p => p.number === '+18175417385');
    
    console.log('\n\nPhone Assignment:');
    console.log('=================');
    console.log(`Phone: ${phone.number}`);
    console.log(`Assigned to agent: ${phone.agent_id}`);
    console.log(`Matches Tom: ${phone.agent_id === tom.id ? 'YES ✅' : 'NO ❌'}`);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

verify();
