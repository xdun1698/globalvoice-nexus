const { Client } = require('pg');

// Set Vapi keys for this script
process.env.VAPI_PRIVATE_KEY = '340a3e25-d52c-46cd-a36c-1d12b9163393';
process.env.VAPI_PUBLIC_KEY = 'c92dd79e-fc10-47a9-b650-eb6586987933';

const vapiService = require('./src/services/vapi');

const DATABASE_URL = 'postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres';

async function syncCourtneyAgents() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Get Courtney's agents
    const agents = await client.query(`
      SELECT * FROM agents 
      WHERE user_id = (SELECT id FROM users WHERE email = 'courtney@mvp.com')
      AND vapi_assistant_id IS NULL
    `);
    
    console.log(`📋 Found ${agents.rows.length} agents to sync\n`);
    
    for (const agent of agents.rows) {
      console.log(`🔄 Syncing: ${agent.name}...`);
      
      try {
        // Sync assistant to Vapi
        const assistant = await vapiService.syncAssistant(agent);
        
        console.log(`   ✅ Created in Vapi: ${assistant.id}`);
        
        // Update database with vapi_assistant_id
        await client.query(
          'UPDATE agents SET vapi_assistant_id = $1, updated_at = NOW() WHERE id = $2',
          [assistant.id, agent.id]
        );
        
        console.log(`   ✅ Updated database\n`);
        
      } catch (error) {
        console.log(`   ❌ Failed: ${error.message}\n`);
      }
    }
    
    // Verify sync
    const synced = await client.query(`
      SELECT name, vapi_assistant_id FROM agents 
      WHERE user_id = (SELECT id FROM users WHERE email = 'courtney@mvp.com')
    `);
    
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 Final Status:\n');
    synced.rows.forEach(a => {
      console.log(`   ${a.vapi_assistant_id ? '✅' : '❌'} ${a.name}`);
      if (a.vapi_assistant_id) {
        console.log(`      Vapi ID: ${a.vapi_assistant_id}`);
      }
    });
    console.log('═══════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('✅ Database connection closed');
  }
}

syncCourtneyAgents();
