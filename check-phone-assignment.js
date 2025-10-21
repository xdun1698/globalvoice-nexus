const axios = require('./backend/node_modules/axios').default || require('./backend/node_modules/axios');

const BACKEND_URL = 'https://globalvoice-backend.fly.dev';
const LOGIN_EMAIL = 'admin@test.com';
const LOGIN_PASSWORD = 'Admin123!';

async function checkPhoneAssignment() {
  try {
    console.log('🔐 Logging in...');
    
    // Login to get token
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Logged in successfully\n');
    
    // Get phone numbers
    console.log('📞 Fetching phone numbers...');
    const phoneResponse = await axios.get(`${BACKEND_URL}/api/phone-numbers`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const phones = Array.isArray(phoneResponse.data) ? phoneResponse.data : phoneResponse.data.phoneNumbers || [];
    console.log(`Found ${phones.length} phone number(s)\n`);
    
    if (phones.length === 0) {
      console.log('❌ No phone numbers found in database!');
      console.log('This is the problem - the phone number +1 (817) 541-7385 is not in the database.');
      console.log('\nYou need to add it via the web app:');
      console.log('1. Go to https://globalvoice-nexus.netlify.app');
      console.log('2. Navigate to Phone Numbers page');
      console.log('3. Add +18175417385');
      console.log('4. Assign it to "Tom - Collections Agent"');
      return;
    }
    
    phones.forEach(phone => {
      console.log(`📱 Phone: ${phone.number}`);
      console.log(`   Assigned to agent: ${phone.agent_id || 'NONE'}`);
      console.log(`   Status: ${phone.status || 'unknown'}`);
      console.log('');
    });
    
    // Get agents
    console.log('👥 Fetching agents...');
    const agentsResponse = await axios.get(`${BACKEND_URL}/api/agents`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const agents = Array.isArray(agentsResponse.data) ? agentsResponse.data : agentsResponse.data.agents || [];
    
    agents.forEach(agent => {
      console.log(`🤖 Agent: ${agent.name} (ID: ${agent.id})`);
      console.log(`   Voice: ${agent.elevenlabs_voice || agent.voice || 'not set'}`);
      console.log(`   Greeting: ${(agent.greeting || '').substring(0, 50)}...`);
      console.log('');
    });
    
    // Check if +18175417385 is assigned to Tom
    const targetPhone = phones.find(p => 
      p.number === '+18175417385' || 
      p.number === '+1 (817) 541-7385' || 
      p.number === '18175417385'
    );
    
    const tomAgent = agents.find(a => a.name === 'Tom - Collections Agent');
    
    if (!targetPhone) {
      console.log('❌ PROBLEM: Phone number +1 (817) 541-7385 is NOT in the database');
      console.log('   This is why you hear the wrong agent!');
      console.log('\n✅ SOLUTION: Add the phone number and assign it to Tom');
    } else if (!targetPhone.agent_id) {
      console.log('❌ PROBLEM: Phone number exists but is NOT assigned to any agent');
      console.log(`   Phone ID: ${targetPhone.id}`);
      console.log('\n✅ SOLUTION: Assign the phone number to Tom');
    } else if (targetPhone.agent_id !== tomAgent?.id) {
      console.log('❌ PROBLEM: Phone number is assigned to the WRONG agent');
      console.log(`   Currently assigned to agent: ${targetPhone.agent_id}`);
      console.log(`   Should be assigned to Tom: ${tomAgent?.id}`);
      console.log('\n✅ SOLUTION: Reassign the phone number to Tom');
    } else {
      console.log('✅ Phone number is correctly assigned to Tom!');
      console.log('   If you still hear Sophia, there may be a caching issue.');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkPhoneAssignment();
