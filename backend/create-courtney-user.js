const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const DATABASE_URL = 'postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres';

async function createCourtneyUser() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Check if Courtney already exists
    const checkResult = await client.query(`
      SELECT id, email, name FROM users WHERE email = 'courtney@prospect.com'
    `);
    
    if (checkResult.rows.length > 0) {
      console.log('⚠️  Courtney user already exists!\n');
      console.log(`User ID: ${checkResult.rows[0].id}`);
      console.log(`Email: ${checkResult.rows[0].email}`);
      console.log(`Name: ${checkResult.rows[0].name}\n`);
      return;
    }
    
    console.log('📝 Creating Courtney prospect user...\n');
    
    // Hash password: Prospect123!
    const hashedPassword = await bcrypt.hash('Prospect123!', 10);
    
    // Create Courtney user
    const result = await client.query(`
      INSERT INTO users (
        email,
        password,
        name,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING id, email, name, created_at
    `, [
      'courtney@prospect.com',
      hashedPassword,
      'Courtney'
    ]);
    
    console.log('✅ Successfully created Courtney prospect user!\n');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📧 Email:    courtney@prospect.com');
    console.log('🔑 Password: Prospect123!');
    console.log('👤 Name:     Courtney');
    console.log('🆔 User ID:  ' + result.rows[0].id);
    console.log('📅 Created:  ' + result.rows[0].created_at);
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('🎯 User Type: PROSPECT');
    console.log('📝 Description: Test prospect user for demo and sales purposes\n');
    
    console.log('✨ You can now login with:');
    console.log('   Email: courtney@prospect.com');
    console.log('   Password: Prospect123!\n');
    
    console.log('🌐 Login URL: https://globalvoice-nexus.netlify.app/login\n');
    
  } catch (error) {
    console.error('❌ Error creating Courtney user:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('✅ Database connection closed');
  }
}

// Run the script
createCourtneyUser();
