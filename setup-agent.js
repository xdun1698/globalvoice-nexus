#!/usr/bin/env node

/**
 * Quick Agent Setup Script
 * Creates an agent and assigns your Twilio phone number
 */

const https = require('https');

const BACKEND_URL = 'https://globalvoice-backend.fly.dev';
const PHONE_NUMBER = '+18175417385';

// You need to get this from the app after logging in
const EMAIL = 'test@globalvoice.com';
const PASSWORD = 'test123'; // Change this to your actual password

async function makeRequest(path, method, data, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BACKEND_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = https.request(url, options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

async function main() {
  console.log('🚀 Setting up your AI calling agent...\n');

  // Step 1: Login
  console.log('📝 Logging in...');
  const loginResponse = await makeRequest('/api/auth/login', 'POST', {
    email: EMAIL,
    password: PASSWORD
  });

  if (!loginResponse.token) {
    console.error('❌ Login failed:', loginResponse);
    process.exit(1);
  }

  const token = loginResponse.token;
  console.log('✅ Logged in successfully\n');

  // Step 2: Create Agent
  console.log('🤖 Creating agent...');
  const agentResponse = await makeRequest('/api/agents', 'POST', {
    name: 'Test Support Agent',
    description: 'AI-powered customer support agent',
    greeting: 'Hello! Thank you for calling. How can I help you today?',
    language: 'en',
    voice: 'Polly.Joanna',
    personality: 'You are a friendly and professional customer support agent. Be helpful, concise, and empathetic.',
    intents: [],
    workflows: [],
    enableVoiceCloning: false
  }, token);

  if (!agentResponse.agent || !agentResponse.agent.id) {
    console.error('❌ Failed to create agent:', agentResponse);
    process.exit(1);
  }

  const agentId = agentResponse.agent.id;
  console.log(`✅ Agent created! ID: ${agentId}\n`);

  // Step 3: Assign Phone Number
  console.log(`📞 Assigning phone number ${PHONE_NUMBER}...`);
  const phoneResponse = await makeRequest(
    `/api/agents/${agentId}/phone-number`,
    'POST',
    { phoneNumber: PHONE_NUMBER },
    token
  );

  if (phoneResponse.error) {
    console.error('❌ Failed to assign phone number:', phoneResponse);
    process.exit(1);
  }

  console.log('✅ Phone number assigned!\n');

  // Success!
  console.log('🎉 Setup complete!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📞 Call this number: +1 (817) 541-7385');
  console.log('🤖 Agent Name: Test Support Agent');
  console.log(`🆔 Agent ID: ${agentId}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('Your AI agent is now ready to receive calls!');
}

main().catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
