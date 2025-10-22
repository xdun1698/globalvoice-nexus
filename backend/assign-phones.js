const { Client } = require('pg');

const DATABASE_URL = 'postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres';

async function assignPhones() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Get Courtney's agents
    const agents = await client.query(`
      SELECT id, name FROM agents 
      WHERE user_id = (SELECT id FROM users WHERE email = 'courtney@mvp.com')
      ORDER BY name
    `);
    
    // Get unassigned phone numbers
    const phones = await client.query(`
      SELECT id, number FROM phone_numbers 
      WHERE agent_id IS NULL
      ORDER BY number
    `);
    
    console.log(`📋 Found ${agents.rows.length} agents`);
    console.log(`📞 Found ${phones.rows.length} unassigned phones\n`);
    
    if (agents.rows.length === 0 || phones.rows.length === 0) {
      console.log('❌ No agents or phones to assign\n');
      return;
    }
    
    // Assign first phone to first agent
    if (agents.rows[0] && phones.rows[0]) {
      await client.query(
        'UPDATE phone_numbers SET agent_id = $1 WHERE id = $2',
        [agents.rows[0].id, phones.rows[0].id]
      );
      console.log(`✅ Assigned ${phones.rows[0].number} → ${agents.rows[0].name}`);
    }
    
    // Assign second phone to second agent if available
    if (agents.rows[1] && phones.rows[1]) {
      await client.query(
        'UPDATE phone_numbers SET agent_id = $1 WHERE id = $2',
        [agents.rows[1].id, phones.rows[1].id]
      );
      console.log(`✅ Assigned ${phones.rows[1].number} → ${agents.rows[1].name}`);
    }
    
    // Show final assignments
    const assignments = await client.query(`
      SELECT pn.number, a.name as agent_name
      FROM phone_numbers pn
      LEFT JOIN agents a ON pn.agent_id = a.id
      ORDER BY pn.number
    `);
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 Final Phone Assignments:\n');
    assignments.rows.forEach(a => {
      console.log(`   📞 ${a.number} → ${a.agent_name || 'UNASSIGNED'}`);
    });
    console.log('═══════════════════════════════════════════════════════\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
    console.log('✅ Database connection closed');
  }
}

assignPhones();
