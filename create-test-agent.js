#!/usr/bin/env node

/**
 * Create Test Agent - Automatic Setup
 * This creates a ready-to-use test agent with phone number assigned
 */

const https = require('https');

const BACKEND_URL = 'https://globalvoice-backend.fly.dev';
const PHONE_NUMBER = '+18175417385';

// Default test credentials
const TEST_EMAIL = 'admin@globalvoice.com';
const TEST_PASSWORD = 'Admin123!';
const TEST_NAME = 'Admin User';

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
          const parsed = JSON.parse(body);
          if (res.statusCode >= 400) {
            reject(new Error(parsed.error || `HTTP ${res.statusCode}`));
          } else {
            resolve(parsed);
          }
        } catch (e) {
          if (res.statusCode >= 400) {
            reject(new Error(`HTTP ${res.statusCode}: ${body}`));
          } else {
            resolve(body);
          }
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
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   GlobalVoice Nexus - Automatic Test Agent Setup         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Register admin user
    console.log('📝 Creating admin account...');
    try {
      await makeRequest('/api/auth/register', 'POST', {
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        name: TEST_NAME
      });
      console.log('✅ Admin account created\n');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Admin account already exists\n');
      } else {
        throw error;
      }
    }

    // Step 2: Login
    console.log('🔐 Logging in...');
    const loginResponse = await makeRequest('/api/auth/login', 'POST', {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    const token = loginResponse.token;
    console.log('✅ Logged in successfully\n');

    // Step 3: Create test agent
    console.log('🤖 Creating test agent...');
    const agentData = {
      name: 'Customer Support Agent',
      description: 'AI-powered customer support agent for handling inquiries',
      greeting: 'Hello! Thank you for calling. My name is Sarah, and I\'m here to help you today. How can I assist you?',
      language: 'en',
      voice: 'Polly.Joanna',
      personality: 'You are a professional and empathetic customer support agent named Sarah. Be friendly, helpful, and patient. Listen carefully to customer concerns, ask clarifying questions when needed, and provide clear solutions. Always maintain a positive and reassuring tone.',
      intents: [
        {
          name: 'greeting',
          examples: ['hello', 'hi', 'hey', 'good morning', 'good afternoon'],
          response: 'Hello! How can I help you today?'
        },
        {
          name: 'help_request',
          examples: ['I need help', 'can you help me', 'I have a problem', 'assistance needed'],
          response: 'I\'d be happy to help you. Could you tell me more about what you need assistance with?'
        },
        {
          name: 'billing_inquiry',
          examples: ['billing question', 'invoice', 'charge', 'payment', 'subscription'],
          response: 'I can help you with your billing question. Could you provide your account number or email address?'
        },
        {
          name: 'technical_support',
          examples: ['not working', 'broken', 'error', 'technical issue', 'bug'],
          response: 'I understand you\'re experiencing a technical issue. Let me help you troubleshoot this. Can you describe what\'s happening?'
        },
        {
          name: 'farewell',
          examples: ['goodbye', 'bye', 'thank you', 'thanks', 'that\'s all'],
          response: 'You\'re welcome! Thank you for calling. Have a wonderful day!'
        }
      ],
      workflows: [],
      enableVoiceCloning: false
    };

    const agentResponse = await makeRequest('/api/agents', 'POST', agentData, token);
    const agentId = agentResponse.agent.id;
    console.log(`✅ Agent created! ID: ${agentId}\n`);

    // Step 4: Assign phone number
    console.log(`📞 Assigning phone number ${PHONE_NUMBER}...`);
    await makeRequest(
      `/api/agents/${agentId}/phone-number`,
      'POST',
      { phoneNumber: PHONE_NUMBER },
      token
    );
    console.log('✅ Phone number assigned!\n');

    // Success!
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    🎉 SETUP COMPLETE!                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    console.log('Your AI calling agent is now live and ready to use!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📞 Phone Number: ${PHONE_NUMBER}`);
    console.log(`🤖 Agent Name: Customer Support Agent`);
    console.log(`🆔 Agent ID: ${agentId}`);
    console.log(`🗣️  Voice: Polly.Joanna (US Female)`);
    console.log(`🌍 Language: English`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📱 Login to dashboard: https://globalvoice-nexus.netlify.app');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Password: ${TEST_PASSWORD}\n`);
    console.log('💡 Next Steps:');
    console.log('   1. Call your number to test the agent');
    console.log('   2. Login to the dashboard to view/edit the agent');
    console.log('   3. Customize the personality and responses');
    console.log('   4. Add more intents and workflows\n');
    console.log('🔑 IMPORTANT: Add OpenAI API key for AI responses:');
    console.log('   flyctl secrets set OPENAI_API_KEY="sk-..." -a globalvoice-backend\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

main();
