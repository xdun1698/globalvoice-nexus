// Direct database fix - add columns if missing and update Tom
const { Client } = require('./backend/node_modules/pg');

const DATABASE_URL = 'postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres';

async function fix() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Check if elevenlabs_voice column exists
    console.log('1️⃣ Checking agents table schema...');
    const columnsResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'agents'
      ORDER BY ordinal_position;
    `);
    
    console.log('Current columns:');
    columnsResult.rows.forEach(row => {
      console.log(`   - ${row.column_name} (${row.data_type})`);
    });
    
    const hasElevenLabsVoice = columnsResult.rows.some(r => r.column_name === 'elevenlabs_voice');
    const hasSystemPrompt = columnsResult.rows.some(r => r.column_name === 'system_prompt');
    
    // Add missing columns
    if (!hasElevenLabsVoice) {
      console.log('\n2️⃣ Adding elevenlabs_voice column...');
      await client.query('ALTER TABLE agents ADD COLUMN elevenlabs_voice VARCHAR(255)');
      console.log('✅ Added elevenlabs_voice column');
    } else {
      console.log('\n✅ elevenlabs_voice column exists');
    }
    
    if (!hasSystemPrompt) {
      console.log('\n3️⃣ Adding system_prompt column...');
      await client.query('ALTER TABLE agents ADD COLUMN system_prompt TEXT');
      console.log('✅ Added system_prompt column');
    } else {
      console.log('\n✅ system_prompt column exists');
    }
    
    // Find Tom agent
    console.log('\n4️⃣ Finding Tom agent...');
    const agentResult = await client.query(`
      SELECT id, name, voice, elevenlabs_voice, greeting 
      FROM agents 
      WHERE name LIKE '%Tom%' OR name LIKE '%Collections%'
      LIMIT 1
    `);
    
    if (agentResult.rows.length === 0) {
      console.log('❌ Tom agent not found');
      return;
    }
    
    const tom = agentResult.rows[0];
    console.log(`Found: ${tom.name} (${tom.id})`);
    console.log(`Current elevenlabs_voice: ${tom.elevenlabs_voice || 'NULL'}`);
    
    // Update Tom with correct configuration
    console.log('\n5️⃣ Updating Tom agent...');
    await client.query(`
      UPDATE agents 
      SET 
        name = $1,
        elevenlabs_voice = $2,
        voice = $3,
        greeting = $4,
        system_prompt = $5,
        personality = $6,
        description = $7
      WHERE id = $8
    `, [
      'Tom - Collections Agent',
      'tom',
      'Polly.Matthew',
      'Hello, this is Tom calling from the collections department. I\'m reaching out regarding an outstanding balance on your account. Do you have a moment to discuss this?',
      `You are Tom, a professional bill collector working for a collections agency. Your role is to:

1. COMPLIANCE FIRST:
   - Always identify yourself and the company
   - State the purpose of the call clearly
   - Never threaten, harass, or use abusive language
   - Follow FDCPA (Fair Debt Collection Practices Act) guidelines
   - Verify you're speaking with the right person before discussing debt

2. COMMUNICATION STYLE:
   - Professional and respectful tone
   - Firm but empathetic
   - Listen actively to customer concerns
   - Acknowledge financial hardship with understanding
   - Stay calm even if customer is upset

3. OBJECTIVES:
   - Collect payment in full if possible
   - Negotiate payment arrangements if needed
   - Document all commitments and promises
   - Provide clear next steps
   - Maintain positive customer relationship

4. CONVERSATION FLOW:
   - Verify identity: 'Am I speaking with [Name]?'
   - State purpose: 'I'm calling about account with a balance of $[amount]'
   - Ask about payment: 'Are you able to settle this balance today?'
   - If no: Offer payment plan options
   - Confirm agreement: Repeat terms back to customer
   - Provide confirmation and next steps

5. HANDLING OBJECTIONS:
   - 'I can't pay': Explore payment plan options
   - 'This isn't my debt': Verify account details, offer to investigate
   - 'I already paid': Request payment confirmation
   - 'I need more time': Set specific follow-up date
   - Customer is hostile: Remain calm, professional

6. PAYMENT OPTIONS:
   - Full payment today
   - Payment plan: 3, 6, or 12 months
   - Partial payment to show good faith

Remember: You represent the company professionally. Every interaction should leave the customer feeling respected.`,
      'Professional, firm but respectful, empathetic yet persistent. Maintains composure and follows compliance guidelines (FDCPA). Focuses on finding solutions and payment arrangements.',
      'Experienced collections specialist who balances firmness with understanding. Skilled at negotiating payment plans while maintaining regulatory compliance.',
      tom.id
    ]);
    
    console.log('✅ Tom agent updated successfully!\n');
    
    // Verify the update
    const verifyResult = await client.query(`
      SELECT name, elevenlabs_voice, voice, greeting 
      FROM agents 
      WHERE id = $1
    `, [tom.id]);
    
    const updated = verifyResult.rows[0];
    console.log('6️⃣ Verification:');
    console.log(`   Name: ${updated.name}`);
    console.log(`   ElevenLabs Voice: ${updated.elevenlabs_voice}`);
    console.log(`   Polly Voice: ${updated.voice}`);
    console.log(`   Greeting: ${updated.greeting.substring(0, 60)}...`);
    
    console.log('\n🎉 SUCCESS! Now call +1 (817) 541-7385 to test');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await client.end();
  }
}

fix();
