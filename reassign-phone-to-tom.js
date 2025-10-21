const axios = require('./backend/node_modules/axios').default || require('./backend/node_modules/axios');

const BACKEND_URL = 'https://globalvoice-backend.fly.dev';
const LOGIN_EMAIL = 'admin@test.com';
const LOGIN_PASSWORD = 'Admin123!';

async function reassignPhone() {
  try {
    console.log('🔐 Logging in...');
    
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Logged in\n');
    
    // Get phone numbers
    const phoneResponse = await axios.get(`${BACKEND_URL}/api/phone-numbers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const phones = Array.isArray(phoneResponse.data) ? phoneResponse.data : phoneResponse.data.phoneNumbers || [];
    const targetPhone = phones.find(p => p.number === '+18175417385');
    
    if (!targetPhone) {
      console.log('❌ Phone number not found');
      return;
    }
    
    // Get Tom agent
    const agentsResponse = await axios.get(`${BACKEND_URL}/api/agents`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const agents = Array.isArray(agentsResponse.data) ? agentsResponse.data : agentsResponse.data.agents || [];
    const tomAgent = agents.find(a => a.name === 'Tom - Collections Agent');
    
    if (!tomAgent) {
      console.log('❌ Tom agent not found');
      return;
    }
    
    console.log(`📞 Reassigning phone ${targetPhone.number}`);
    console.log(`   From: ${targetPhone.agent_id}`);
    console.log(`   To: ${tomAgent.id} (Tom - Collections Agent)\n`);
    
    // Update phone number assignment
    await axios.put(
      `${BACKEND_URL}/api/phone-numbers/${targetPhone.id}/agent`,
      {
        agent_id: tomAgent.id
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Phone number reassigned successfully!');
    console.log('\n🎉 Now call +1 (817) 541-7385 to hear Tom\'s voice');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

reassignPhone();
