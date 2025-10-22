const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres';

async function assignAgentsToCourtney() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Get Courtney's user ID
    const courtneyResult = await client.query(`
      SELECT id, email, name FROM users WHERE email = 'courtney@mvp.com'
    `);
    
    if (courtneyResult.rows.length === 0) {
      console.log('❌ Courtney user not found!\n');
      return;
    }
    
    const courtneyUserId = courtneyResult.rows[0].id;
    console.log(`📧 Found Courtney: ${courtneyResult.rows[0].email}`);
    console.log(`🆔 User ID: ${courtneyUserId}\n`);
    
    // Get admin user ID (to copy agents from)
    const adminResult = await client.query(`
      SELECT id FROM users WHERE email = 'admin@test.com'
    `);
    
    if (adminResult.rows.length === 0) {
      console.log('❌ Admin user not found!\n');
      return;
    }
    
    const adminUserId = adminResult.rows[0].id;
    
    // Find Will and Shannon agents from admin
    const agentsToCopy = await client.query(`
      SELECT * FROM agents 
      WHERE user_id = $1 
      AND (name ILIKE '%will%' OR name ILIKE '%shannon%' OR name ILIKE '%shannan%')
    `, [adminUserId]);
    
    console.log(`📋 Found ${agentsToCopy.rows.length} agent(s) to copy:\n`);
    
    if (agentsToCopy.rows.length === 0) {
      console.log('❌ No Will or Shannon agents found for admin user\n');
      return;
    }
    
    // Check if Courtney already has these agents
    const courtneyExisting = await client.query(`
      SELECT name FROM agents WHERE user_id = $1
    `, [courtneyUserId]);
    
    const existingNames = courtneyExisting.rows.map(r => r.name.toLowerCase());
    
    let copiedCount = 0;
    let skippedCount = 0;
    
    for (const agent of agentsToCopy.rows) {
      // Check if agent already exists for Courtney
      if (existingNames.some(name => name.includes(agent.name.toLowerCase().split(' ')[0]))) {
        console.log(`⏭️  Skipped: ${agent.name} (already exists for Courtney)`);
        skippedCount++;
        continue;
      }
      
      // Copy agent to Courtney
      const result = await client.query(`
        INSERT INTO agents (
          user_id,
          name,
          voice,
          language,
          personality,
          greeting,
          system_prompt,
          elevenlabs_voice,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id, name
      `, [
        courtneyUserId,
        agent.name,
        agent.voice,
        agent.language,
        agent.personality,
        agent.greeting,
        agent.system_prompt,
        agent.elevenlabs_voice
      ]);
      
      console.log(`✅ Copied: ${result.rows[0].name}`);
      console.log(`   Agent ID: ${result.rows[0].id}`);
      copiedCount++;
    }
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log(`📊 Summary:`);
    console.log(`   ✅ Copied: ${copiedCount} agent(s)`);
    console.log(`   ⏭️  Skipped: ${skippedCount} agent(s)`);
    console.log('═══════════════════════════════════════════════════════\n');
    
    // Show Courtney's final agent list
    const finalAgents = await client.query(`
      SELECT id, name, voice, language 
      FROM agents 
      WHERE user_id = $1
      ORDER BY name
    `, [courtneyUserId]);
    
    console.log(`🎯 Courtney now has ${finalAgents.rows.length} agent(s):\n`);
    finalAgents.rows.forEach((agent, idx) => {
      console.log(`   ${idx + 1}. ${agent.name}`);
      console.log(`      Voice: ${agent.voice} | Language: ${agent.language}`);
    });
    
    console.log('\n✨ Courtney can now see and use these agents in the dashboard!');
    console.log('🌐 Login: https://globalvoice-nexus.netlify.app/login\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('✅ Database connection closed');
  }
}

// Run the script
assignAgentsToCourtney();
