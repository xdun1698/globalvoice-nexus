const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres';

async function diagnose() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║     CALL FUNCTIONALITY DIAGNOSIS                           ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    // 1. Check Courtney's agents
    console.log('📋 1. CHECKING COURTNEY\'S AGENTS...\n');
    const agents = await client.query(`
      SELECT id, name, vapi_assistant_id, elevenlabs_voice, voice
      FROM agents 
      WHERE user_id = (SELECT id FROM users WHERE email = 'courtney@mvp.com')
      ORDER BY name
    `);
    
    if (agents.rows.length === 0) {
      console.log('   ❌ No agents found for Courtney!\n');
    } else {
      agents.rows.forEach((a, idx) => {
        console.log(`   Agent ${idx + 1}: ${a.name}`);
        console.log(`   ├─ ID: ${a.id}`);
        console.log(`   ├─ Vapi Assistant ID: ${a.vapi_assistant_id || '❌ NOT SYNCED'}`);
        console.log(`   ├─ Voice: ${a.elevenlabs_voice || a.voice || 'Not set'}`);
        console.log(`   └─ Status: ${a.vapi_assistant_id ? '✅ Synced' : '❌ Not synced'}\n`);
      });
    }
    
    // 2. Check phone numbers
    console.log('📞 2. CHECKING PHONE NUMBERS...\n');
    const phones = await client.query(`
      SELECT 
        pn.id,
        pn.number,
        pn.agent_id,
        pn.vapi_phone_id,
        a.name as agent_name
      FROM phone_numbers pn
      LEFT JOIN agents a ON pn.agent_id = a.id
      ORDER BY pn.number
    `);
    
    if (phones.rows.length === 0) {
      console.log('   ❌ No phone numbers found in database!\n');
    } else {
      phones.rows.forEach((p, idx) => {
        console.log(`   Phone ${idx + 1}: ${p.number}`);
        console.log(`   ├─ ID: ${p.id}`);
        console.log(`   ├─ Assigned to: ${p.agent_name || '❌ UNASSIGNED'}`);
        console.log(`   ├─ Vapi Phone ID: ${p.vapi_phone_id || '❌ NOT IN VAPI'}`);
        console.log(`   └─ Status: ${p.agent_id && p.vapi_phone_id ? '✅ Ready' : '❌ Not ready'}\n`);
      });
    }
    
    // 3. Check environment variables
    console.log('🔑 3. CHECKING ENVIRONMENT VARIABLES...\n');
    const vapiPrivateKey = process.env.VAPI_PRIVATE_KEY;
    const vapiPublicKey = process.env.VAPI_PUBLIC_KEY;
    
    console.log(`   VAPI_PRIVATE_KEY: ${vapiPrivateKey ? '✅ Set' : '❌ NOT SET'}`);
    console.log(`   VAPI_PUBLIC_KEY: ${vapiPublicKey ? '✅ Set' : '❌ NOT SET'}\n`);
    
    // 4. Test Vapi connection
    console.log('🔌 4. TESTING VAPI CONNECTION...\n');
    if (!vapiPrivateKey) {
      console.log('   ❌ Cannot test - VAPI_PRIVATE_KEY not set\n');
    } else {
      try {
        const vapiService = require('./src/services/vapi');
        const assistants = await vapiService.listAssistants();
        console.log(`   ✅ Connected to Vapi successfully`);
        console.log(`   ├─ Assistants in Vapi: ${assistants.length}`);
        if (assistants.length > 0) {
          assistants.forEach((asst, idx) => {
            console.log(`   │  ${idx + 1}. ${asst.name || 'Unnamed'} (ID: ${asst.id})`);
          });
        }
        console.log('   └─ Status: ✅ Vapi connection working\n');
      } catch (error) {
        console.log(`   ❌ Cannot connect to Vapi`);
        console.log(`   └─ Error: ${error.message}\n`);
      }
    }
    
    // 5. Test Vapi phone numbers
    console.log('📱 5. CHECKING VAPI PHONE NUMBERS...\n');
    if (!vapiPrivateKey) {
      console.log('   ❌ Cannot check - VAPI_PRIVATE_KEY not set\n');
    } else {
      try {
        const vapiService = require('./src/services/vapi');
        const vapiPhones = await vapiService.listPhoneNumbers();
        console.log(`   Phone numbers in Vapi: ${vapiPhones.length}`);
        if (vapiPhones.length > 0) {
          vapiPhones.forEach((phone, idx) => {
            console.log(`   ${idx + 1}. ${phone.number || phone.phoneNumber} (ID: ${phone.id})`);
          });
          console.log('   └─ Status: ✅ Phone numbers available\n');
        } else {
          console.log('   └─ Status: ❌ No phone numbers in Vapi\n');
        }
      } catch (error) {
        console.log(`   ❌ Cannot get Vapi phone numbers`);
        console.log(`   └─ Error: ${error.message}\n`);
      }
    }
    
    // 6. Diagnosis Summary
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     DIAGNOSIS SUMMARY                                      ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    const issues = [];
    const warnings = [];
    
    // Check agents
    if (agents.rows.length === 0) {
      issues.push('No agents found for Courtney');
    } else {
      agents.rows.forEach(a => {
        if (!a.vapi_assistant_id) {
          issues.push(`Agent "${a.name}" not synced to Vapi (missing vapi_assistant_id)`);
        }
      });
    }
    
    // Check phone numbers
    if (phones.rows.length === 0) {
      issues.push('No phone numbers in database');
    } else {
      phones.rows.forEach(p => {
        if (!p.agent_id) {
          warnings.push(`Phone ${p.number} not assigned to any agent`);
        }
        if (!p.vapi_phone_id) {
          warnings.push(`Phone ${p.number} not synced to Vapi`);
        }
      });
    }
    
    // Check Vapi config
    if (!vapiPrivateKey) {
      issues.push('VAPI_PRIVATE_KEY environment variable not set');
    }
    if (!vapiPublicKey) {
      issues.push('VAPI_PUBLIC_KEY environment variable not set');
    }
    
    // Print issues
    if (issues.length > 0) {
      console.log('❌ CRITICAL ISSUES (Must fix):');
      issues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
      console.log('');
    }
    
    if (warnings.length > 0) {
      console.log('⚠️  WARNINGS (Should fix):');
      warnings.forEach((warning, i) => {
        console.log(`   ${i + 1}. ${warning}`);
      });
      console.log('');
    }
    
    if (issues.length === 0 && warnings.length === 0) {
      console.log('✅ NO ISSUES FOUND!');
      console.log('   All systems configured correctly.');
      console.log('   Calls should work.\n');
    } else {
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║     RECOMMENDED FIXES                                      ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');
      
      if (agents.rows.some(a => !a.vapi_assistant_id)) {
        console.log('🔧 FIX 1: Sync agents to Vapi');
        console.log('   1. Login as admin@test.com');
        console.log('   2. Go to Vapi Sync page');
        console.log('   3. Click "Export Agents to Vapi"');
        console.log('   4. Wait for sync to complete\n');
      }
      
      if (phones.rows.some(p => !p.agent_id)) {
        console.log('🔧 FIX 2: Assign phone numbers to agents');
        console.log('   1. Go to Phone Numbers page');
        console.log('   2. Click "Assign" on each phone number');
        console.log('   3. Select an agent');
        console.log('   4. Save\n');
      }
      
      if (phones.rows.some(p => !p.vapi_phone_id)) {
        console.log('🔧 FIX 3: Import phone numbers from Vapi');
        console.log('   1. Go to Phone Numbers page');
        console.log('   2. Click "Import Phone Numbers"');
        console.log('   3. Wait for import to complete\n');
      }
      
      if (!vapiPrivateKey || !vapiPublicKey) {
        console.log('🔧 FIX 4: Set Vapi API keys');
        console.log('   1. Get keys from Vapi dashboard');
        console.log('   2. Set in Fly.io secrets:');
        console.log('      flyctl secrets set VAPI_PRIVATE_KEY="..." -a globalvoice-backend');
        console.log('      flyctl secrets set VAPI_PUBLIC_KEY="..." -a globalvoice-backend');
        console.log('   3. Deploy backend\n');
      }
    }
    
    console.log('═══════════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('\n❌ DIAGNOSIS FAILED:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('✅ Database connection closed\n');
  }
}

// Run diagnosis
diagnose();
