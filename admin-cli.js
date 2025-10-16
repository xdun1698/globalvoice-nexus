#!/usr/bin/env node

/**
 * GlobalVoice Nexus - Enterprise Admin CLI
 * Manage agents, users, and system configuration
 */

const https = require('https');
const readline = require('readline');

const BACKEND_URL = 'https://globalvoice-backend.fly.dev';
const PHONE_NUMBER = '+18175417385';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

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

async function registerUser(email, password, name) {
  console.log('\n📝 Registering new user...');
  try {
    const response = await makeRequest('/api/auth/register', 'POST', {
      email,
      password,
      name
    });
    console.log('✅ User registered successfully');
    return response;
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  User already exists, will try to login');
      return null;
    }
    throw error;
  }
}

async function loginUser(email, password) {
  console.log('🔐 Logging in...');
  const response = await makeRequest('/api/auth/login', 'POST', {
    email,
    password
  });
  console.log('✅ Logged in successfully\n');
  return response.token;
}

async function createAgent(token, agentData) {
  console.log('🤖 Creating agent...');
  const response = await makeRequest('/api/agents', 'POST', agentData, token);
  console.log(`✅ Agent created! ID: ${response.agent.id}\n`);
  return response.agent;
}

async function assignPhoneNumber(token, agentId, phoneNumber) {
  console.log(`📞 Assigning phone number ${phoneNumber}...`);
  const response = await makeRequest(
    `/api/agents/${agentId}/phone-number`,
    'POST',
    { phoneNumber },
    token
  );
  console.log('✅ Phone number assigned!\n');
  return response;
}

async function setupFirstAgent() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║   GlobalVoice Nexus - Enterprise Agent Setup             ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');

  try {
    // Get user credentials
    const email = await question('Enter your email: ');
    const password = await question('Enter your password: ');
    const name = await question('Enter your name: ');

    console.log('');

    // Register or login
    await registerUser(email, password, name);
    const token = await loginUser(email, password);

    // Get agent details
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Now let\'s create your first AI agent:\n');

    const agentName = await question('Agent name (default: Customer Support Agent): ') || 'Customer Support Agent';
    const agentLanguage = await question('Primary language (default: en): ') || 'en';
    
    console.log('\nSelect voice:');
    console.log('1. Polly.Joanna (US English, Female)');
    console.log('2. Polly.Matthew (US English, Male)');
    console.log('3. Polly.Amy (British English, Female)');
    console.log('4. Polly.Brian (British English, Male)');
    const voiceChoice = await question('Choice (1-4, default: 1): ') || '1';
    
    const voices = {
      '1': 'Polly.Joanna',
      '2': 'Polly.Matthew',
      '3': 'Polly.Amy',
      '4': 'Polly.Brian'
    };
    const voice = voices[voiceChoice] || 'Polly.Joanna';

    const greeting = await question('\nGreeting message (press Enter for default): ') || 
      'Hello! Thank you for calling. How can I help you today?';

    const personality = await question('\nAgent personality (press Enter for default): ') ||
      'You are a professional and friendly customer support agent. Be helpful, empathetic, and concise. Ask clarifying questions when needed. Always maintain a positive tone.';

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Create agent
    const agent = await createAgent(token, {
      name: agentName,
      description: `AI-powered ${agentName.toLowerCase()} for handling customer inquiries`,
      greeting,
      language: agentLanguage,
      voice,
      personality,
      intents: [
        {
          name: 'greeting',
          examples: ['hello', 'hi', 'hey', 'good morning'],
          response: 'Hello! How can I assist you today?'
        },
        {
          name: 'help',
          examples: ['help', 'support', 'assistance', 'need help'],
          response: 'I\'m here to help! What do you need assistance with?'
        },
        {
          name: 'goodbye',
          examples: ['bye', 'goodbye', 'thanks', 'thank you'],
          response: 'You\'re welcome! Have a great day!'
        }
      ],
      workflows: [],
      enableVoiceCloning: false
    });

    // Assign phone number
    await assignPhoneNumber(token, agent.id, PHONE_NUMBER);

    // Success summary
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║                    🎉 SETUP COMPLETE!                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝\n');
    console.log('Your AI calling agent is now live and ready to receive calls!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📞 Phone Number: ${PHONE_NUMBER}`);
    console.log(`🤖 Agent Name: ${agentName}`);
    console.log(`🆔 Agent ID: ${agent.id}`);
    console.log(`🗣️  Voice: ${voice}`);
    console.log(`🌍 Language: ${agentLanguage}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📱 Login to your dashboard: https://globalvoice-nexus.netlify.app');
    console.log(`   Email: ${email}`);
    console.log('\n💡 Next Steps:');
    console.log('   1. Call your number to test the agent');
    console.log('   2. Login to the dashboard to view call logs');
    console.log('   3. Customize the agent\'s personality and responses');
    console.log('   4. Add more intents and workflows\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function listAgents() {
  console.log('\n📋 Listing all agents...\n');
  
  const email = await question('Enter your email: ');
  const password = await question('Enter your password: ');
  
  try {
    const token = await loginUser(email, password);
    const response = await makeRequest('/api/agents', 'GET', null, token);
    
    if (response.agents.length === 0) {
      console.log('No agents found. Run "setup" to create your first agent.\n');
    } else {
      console.log(`Found ${response.agents.length} agent(s):\n`);
      response.agents.forEach((agent, index) => {
        console.log(`${index + 1}. ${agent.name}`);
        console.log(`   ID: ${agent.id}`);
        console.log(`   Language: ${agent.language}`);
        console.log(`   Voice: ${agent.voice}`);
        console.log(`   Status: ${agent.status}`);
        console.log('');
      });
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'setup':
      await setupFirstAgent();
      break;
    case 'list':
      await listAgents();
      break;
    case 'help':
    default:
      console.log('\nGlobalVoice Nexus - Enterprise Admin CLI\n');
      console.log('Usage: node admin-cli.js <command>\n');
      console.log('Commands:');
      console.log('  setup    - Create your first agent (interactive)');
      console.log('  list     - List all agents');
      console.log('  help     - Show this help message\n');
      console.log('Examples:');
      console.log('  node admin-cli.js setup');
      console.log('  node admin-cli.js list\n');
      rl.close();
      break;
  }
}

main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  rl.close();
  process.exit(1);
});
