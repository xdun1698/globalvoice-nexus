const { Client } = require('./backend/node_modules/pg');

const DATABASE_URL = 'postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres';

async function updateWillToTexas() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Update Will with Texas/Dallas personality
    const result = await client.query(`
      UPDATE agents 
      SET 
        name = $1,
        personality = $2,
        greeting = $3,
        description = $4,
        updated_at = NOW()
      WHERE name LIKE '%Will%'
      RETURNING id, name, elevenlabs_voice
    `, [
      'Will - Collections Agent',
      `You are Will, a professional collections agent based in Dallas, Texas. You have a warm, conversational American accent - think Dallas businessman, not formal or British. You're direct but friendly, professional but approachable. You speak naturally like someone from Texas - confident, straightforward, and personable. You understand that people have financial challenges and you're here to help find solutions, not to intimidate. You're experienced in payment arrangements and genuinely want to help people resolve their accounts.`,
      `Hey there! This is Will calling from the collections department. Hope I caught you at a good time - I wanted to reach out about your account and see if we can work something out together. You got a few minutes to chat?`,
      `Collections specialist focused on finding payment solutions and helping customers resolve outstanding balances through professional, empathetic communication.`
    ]);
    
    if (result.rows.length === 0) {
      console.log('❌ Will agent not found');
      return;
    }
    
    const agent = result.rows[0];
    console.log('✅ Updated Will successfully!\n');
    console.log('Agent Details:');
    console.log(`  ID: ${agent.id}`);
    console.log(`  Name: ${agent.name}`);
    console.log(`  Voice: ${agent.elevenlabs_voice}`);
    console.log('\n📝 New Personality:');
    console.log('  - Dallas, Texas based');
    console.log('  - Warm American accent (not British)');
    console.log('  - Conversational and approachable');
    console.log('  - Professional but friendly');
    console.log('\n🎙️ Voice Settings:');
    console.log('  - Using Antoni (pure American male)');
    console.log('  - Stability: 0.35 (expressive)');
    console.log('  - Style: 0.3 (natural)');
    console.log('  - Temperature: 0.8 (conversational)');
    console.log('\n🎉 Done! Call +1 (817) 541-7385 to test');
    console.log('   Will should sound like a Dallas businessman now!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

updateWillToTexas();
