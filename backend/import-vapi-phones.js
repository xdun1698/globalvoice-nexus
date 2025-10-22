const { Client } = require('pg');

// Set Vapi keys for this script
process.env.VAPI_PRIVATE_KEY = '340a3e25-d52c-46cd-a36c-1d12b9163393';
process.env.VAPI_PUBLIC_KEY = 'c92dd79e-fc10-47a9-b650-eb6586987933';

const vapiService = require('./src/services/vapi');

const DATABASE_URL = 'postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres';

async function importVapiPhones() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Get phone numbers from Vapi
    console.log('📞 Fetching phone numbers from Vapi...\n');
    const vapiPhones = await vapiService.getPhoneNumbers();
    
    console.log(`Found ${vapiPhones.length} phone numbers in Vapi:\n`);
    vapiPhones.forEach((phone, idx) => {
      console.log(`   ${idx + 1}. ${phone.number || phone.phoneNumber}`);
      console.log(`      ID: ${phone.id}`);
      console.log(`      Provider: ${phone.provider || 'Unknown'}\n`);
    });
    
    if (vapiPhones.length === 0) {
      console.log('❌ No phone numbers found in Vapi');
      console.log('   Please add phone numbers in Vapi dashboard first.\n');
      return;
    }
    
    // Update database with Vapi phone IDs
    console.log('🔄 Updating database with Vapi phone IDs...\n');
    
    for (const vapiPhone of vapiPhones) {
      const phoneNumber = vapiPhone.number || vapiPhone.phoneNumber;
      const cleanNumber = phoneNumber.replace(/\D/g, ''); // Remove non-digits
      
      // Check if phone exists in database
      const existing = await client.query(
        'SELECT * FROM phone_numbers WHERE number = $1 OR number = $2',
        [phoneNumber, cleanNumber]
      );
      
      if (existing.rows.length > 0) {
        // Update with vapi_phone_id
        await client.query(
          'UPDATE phone_numbers SET vapi_phone_id = $1 WHERE id = $2',
          [vapiPhone.id, existing.rows[0].id]
        );
        console.log(`   ✅ Updated ${phoneNumber} with Vapi ID`);
      } else {
        // Insert new phone number
        await client.query(
          `INSERT INTO phone_numbers (number, vapi_phone_id, country_code, capabilities)
           VALUES ($1, $2, $3, $4)`,
          [cleanNumber, vapiPhone.id, 'US', JSON.stringify({ voice: true, sms: true })]
        );
        console.log(`   ✅ Added ${phoneNumber} to database`);
      }
    }
    
    // Show final status
    const allPhones = await client.query(`
      SELECT 
        pn.number,
        pn.vapi_phone_id,
        a.name as agent_name
      FROM phone_numbers pn
      LEFT JOIN agents a ON pn.agent_id = a.id
      ORDER BY pn.number
    `);
    
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('📊 Final Phone Number Status:\n');
    allPhones.rows.forEach(p => {
      console.log(`   📞 ${p.number}`);
      console.log(`      Vapi ID: ${p.vapi_phone_id || '❌ NOT SET'}`);
      console.log(`      Agent: ${p.agent_name || 'Unassigned'}\n`);
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

importVapiPhones();
