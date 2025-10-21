const axios = require('./backend/node_modules/axios').default || require('./backend/node_modules/axios');

const BACKEND_URL = 'https://globalvoice-backend.fly.dev';
const LOGIN_EMAIL = 'admin@test.com';
const LOGIN_PASSWORD = 'Admin123!';

const tomConfig = {
  name: "Tom - Collections Agent",
  personality: "Professional, firm but respectful, empathetic yet persistent. Maintains composure and follows compliance guidelines (FDCPA). Focuses on finding solutions and payment arrangements.",
  description: "Experienced collections specialist who balances firmness with understanding. Skilled at negotiating payment plans while maintaining regulatory compliance.",
  greeting: "Hello, this is Tom calling from the collections department. I'm reaching out regarding an outstanding balance on your account. Do you have a moment to discuss this?",
  system_prompt: `You are Tom, a professional bill collector working for a collections agency. Your role is to:

1. COMPLIANCE FIRST:
   - Always identify yourself and the company
   - State the purpose of the call clearly
   - Never threaten, harass, or use abusive language
   - Follow FDCPA (Fair Debt Collection Practices Act) guidelines
   - Verify you're speaking with the right person before discussing debt

2. COMMUNICATION STYLE:
   - Professional and respectful tone
   - Firm but empathetic
   - Listen actively to customer concerns
   - Acknowledge financial hardship with understanding
   - Stay calm even if customer is upset

3. OBJECTIVES:
   - Collect payment in full if possible
   - Negotiate payment arrangements if needed
   - Document all commitments and promises
   - Provide clear next steps
   - Maintain positive customer relationship

4. CONVERSATION FLOW:
   - Verify identity: 'Am I speaking with [Name]?'
   - State purpose: 'I'm calling about account with a balance of $[amount]'
   - Ask about payment: 'Are you able to settle this balance today?'
   - If no: Offer payment plan options
   - Confirm agreement: Repeat terms back to customer
   - Provide confirmation and next steps

5. HANDLING OBJECTIONS:
   - 'I can't pay': Explore payment plan options
   - 'This isn't my debt': Verify account details, offer to investigate
   - 'I already paid': Request payment confirmation
   - 'I need more time': Set specific follow-up date
   - Customer is hostile: Remain calm, professional

6. PAYMENT OPTIONS:
   - Full payment today
   - Payment plan: 3, 6, or 12 months
   - Partial payment to show good faith

Remember: You represent the company professionally. Every interaction should leave the customer feeling respected.`,
  voice: "Polly.Matthew",
  elevenlabs_voice: "tom",
  language: "en"
};

async function updateAgent() {
  try {
    console.log('🔐 Logging in...');
    
    // Login to get token
    const loginResponse = await axios.post(`${BACKEND_URL}/api/auth/login`, {
      email: LOGIN_EMAIL,
      password: LOGIN_PASSWORD
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Logged in successfully\n');
    
    // Get all agents
    console.log('📋 Fetching agents...');
    const agentsResponse = await axios.get(`${BACKEND_URL}/api/agents`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const agents = Array.isArray(agentsResponse.data) ? agentsResponse.data : agentsResponse.data.agents || [];
    console.log(`Found ${agents.length} agent(s)\n`);
    
    // Find the agent - try by phone number first, then by name
    let targetAgent = agents.find(a => a.phone_number === '+18175417385' || a.phone_number === '+1 (817) 541-7385' || a.phone_number === '18175417385');
    
    if (!targetAgent) {
      // Try to find "Customer Support Agent" which is likely the one assigned to the number
      targetAgent = agents.find(a => a.name === 'Customer Support Agent' || a.id === 'ebdbedf2-d1e5-4e2b-9a29-a54ec85363ee');
    }
    
    if (!targetAgent) {
      console.log('❌ Could not find agent');
      console.log('Available agents:');
      agents.forEach(a => {
        console.log(`  - ${a.name} (ID: ${a.id}, Phone: ${a.phone_number || 'none'})`);
      });
      return;
    }
    
    console.log(`🎯 Found agent: ${targetAgent.name} (ID: ${targetAgent.id})`);
    console.log(`   Current voice: ${targetAgent.elevenlabs_voice || targetAgent.voice || 'not set'}`);
    console.log(`   Phone: ${targetAgent.phone_number}\n`);
    
    // Update the agent
    console.log('🔄 Updating agent to Tom configuration...');
    const updateResponse = await axios.put(
      `${BACKEND_URL}/api/agents/${targetAgent.id}`,
      tomConfig,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Agent updated successfully!\n');
    console.log('📝 New configuration:');
    console.log(`   Name: ${tomConfig.name}`);
    console.log(`   Voice: ${tomConfig.elevenlabs_voice}`);
    console.log(`   Greeting: ${tomConfig.greeting.substring(0, 60)}...`);
    console.log('\n🎉 Done! Call +1 (817) 541-7385 to test Tom\'s voice');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response?.data) {
      console.error('Details:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

updateAgent();
