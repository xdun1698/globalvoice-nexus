const { Client } = require('./backend/node_modules/pg');

const DATABASE_URL = 'postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres';

async function updateToWill() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Find the collections agent
    const agentResult = await client.query(`
      SELECT id, name, elevenlabs_voice 
      FROM agents 
      WHERE name LIKE '%Collections%' OR name LIKE '%Tom%'
      LIMIT 1
    `);
    
    if (agentResult.rows.length === 0) {
      console.log('❌ Collections agent not found');
      return;
    }
    
    const agent = agentResult.rows[0];
    console.log(`Found: ${agent.name} (${agent.id})`);
    console.log(`Current voice: ${agent.elevenlabs_voice || 'NULL'}\n`);
    
    // Update to Will with conversational settings
    console.log('Updating to Will (conversational voice)...');
    await client.query(`
      UPDATE agents 
      SET 
        name = $1,
        elevenlabs_voice = $2,
        greeting = $3,
        updated_at = NOW()
      WHERE id = $4
    `, [
      'Will - Collections Agent',
      'will',
      'Hey there! This is Will calling from the collections department. I wanted to reach out about your account. Do you have a few minutes to chat?',
      agent.id
    ]);
    
    console.log('✅ Updated to Will successfully!\n');
    
    // Verify
    const verifyResult = await client.query(`
      SELECT name, elevenlabs_voice, greeting 
      FROM agents 
      WHERE id = $1
    `, [agent.id]);
    
    const updated = verifyResult.rows[0];
    console.log('Verification:');
    console.log(`  Name: ${updated.name}`);
    console.log(`  Voice: ${updated.elevenlabs_voice}`);
    console.log(`  Greeting: ${updated.greeting.substring(0, 60)}...`);
    console.log('\n🎉 Done! Call +1 (817) 541-7385 to test Will\'s conversational voice');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

updateToWill();
