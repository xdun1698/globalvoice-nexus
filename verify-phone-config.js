const { Client } = require('./backend/node_modules/pg');

const DATABASE_URL = 'postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres';

async function verifyPhoneConfig() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Check phone number assignment
    const phoneResult = await client.query(`
      SELECT 
        pn.id,
        pn.number,
        pn.agent_id,
        a.name as agent_name,
        a.elevenlabs_voice,
        a.greeting
      FROM phone_numbers pn
      LEFT JOIN agents a ON pn.agent_id = a.id
      WHERE pn.number = '+18175417385'
    `);
    
    if (phoneResult.rows.length === 0) {
      console.log('❌ Phone number +18175417385 NOT FOUND in database');
      console.log('\nThis is why calls loop - the number has no agent assigned!\n');
      
      // Show all phone numbers
      const allPhones = await client.query(`
        SELECT number, agent_id FROM phone_numbers
      `);
      console.log('Phone numbers in database:');
      allPhones.rows.forEach(p => {
        console.log(`  ${p.number} → agent_id: ${p.agent_id || 'NONE'}`);
      });
      
      return;
    }
    
    const phone = phoneResult.rows[0];
    console.log('📞 Phone Number Configuration:');
    console.log(`  Number: ${phone.number}`);
    console.log(`  Agent ID: ${phone.agent_id || 'NOT ASSIGNED'}`);
    console.log(`  Agent Name: ${phone.agent_name || 'N/A'}`);
    console.log(`  Voice: ${phone.elevenlabs_voice || 'N/A'}`);
    console.log(`  Greeting: ${phone.greeting ? phone.greeting.substring(0, 60) + '...' : 'N/A'}`);
    
    if (!phone.agent_id) {
      console.log('\n❌ PROBLEM: Phone number exists but has NO AGENT assigned!');
      console.log('This causes the "number not configured" error loop.\n');
      
      // Find Will agent
      const willAgent = await client.query(`
        SELECT id, name FROM agents WHERE name LIKE '%Will%' LIMIT 1
      `);
      
      if (willAgent.rows.length > 0) {
        console.log(`Found Will agent: ${willAgent.rows[0].name} (${willAgent.rows[0].id})`);
        console.log('\nTo fix, run:');
        console.log(`UPDATE phone_numbers SET agent_id = '${willAgent.rows[0].id}' WHERE number = '+18175417385';`);
      }
    } else {
      console.log('\n✅ Phone number is properly assigned to agent!');
      console.log('\nIf calls still loop, check Twilio webhook URLs are exactly:');
      console.log('  Voice: https://globalvoice-backend.fly.dev/api/webhooks/twilio/voice (POST)');
      console.log('  Status: https://globalvoice-backend.fly.dev/api/webhooks/twilio/status (POST)');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

verifyPhoneConfig();
