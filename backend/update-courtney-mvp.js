const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const DATABASE_URL = 'postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres';

async function updateCourtneyToMVP() {
  const client = new Client({ connectionString: DATABASE_URL });
  
  try {
    await client.connect();
    console.log('✅ Connected to database\n');
    
    // Check if old Courtney exists
    const checkOldResult = await client.query(`
      SELECT id, email, name FROM users WHERE email = 'courtney@prospect.com'
    `);
    
    // Check if new email already exists
    const checkNewResult = await client.query(`
      SELECT id, email, name FROM users WHERE email = 'courtney@mvp.com'
    `);
    
    if (checkNewResult.rows.length > 0) {
      console.log('⚠️  User with courtney@mvp.com already exists!\n');
      console.log(`User ID: ${checkNewResult.rows[0].id}`);
      console.log(`Email: ${checkNewResult.rows[0].email}`);
      console.log(`Name: ${checkNewResult.rows[0].name}\n`);
      return;
    }
    
    if (checkOldResult.rows.length === 0) {
      console.log('❌ Courtney user (courtney@prospect.com) not found!\n');
      console.log('Creating new MVP user instead...\n');
      
      // Create new user
      const hashedPassword = await bcrypt.hash('mvptexas321!', 10);
      
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
        'courtney@mvp.com',
        hashedPassword,
        'Courtney'
      ]);
      
      console.log('✅ Successfully created Courtney MVP user!\n');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📧 Email:    courtney@mvp.com');
      console.log('🔑 Password: mvptexas321!');
      console.log('👤 Name:     Courtney');
      console.log('🎯 Type:     MVP');
      console.log('🆔 User ID:  ' + result.rows[0].id);
      console.log('📅 Created:  ' + result.rows[0].created_at);
      console.log('═══════════════════════════════════════════════════════\n');
      
    } else {
      console.log('📝 Updating Courtney user to MVP credentials...\n');
      
      const userId = checkOldResult.rows[0].id;
      
      // Hash new password
      const hashedPassword = await bcrypt.hash('mvptexas321!', 10);
      
      // Update user
      const result = await client.query(`
        UPDATE users 
        SET 
          email = $1,
          password = $2,
          updated_at = NOW()
        WHERE id = $3
        RETURNING id, email, name, updated_at
      `, [
        'courtney@mvp.com',
        hashedPassword,
        userId
      ]);
      
      console.log('✅ Successfully updated Courtney to MVP user!\n');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📧 Email:    courtney@mvp.com (UPDATED)');
      console.log('🔑 Password: mvptexas321! (UPDATED)');
      console.log('👤 Name:     Courtney');
      console.log('🎯 Type:     MVP');
      console.log('🆔 User ID:  ' + result.rows[0].id);
      console.log('📅 Updated:  ' + result.rows[0].updated_at);
      console.log('═══════════════════════════════════════════════════════\n');
    }
    
    console.log('🎯 User Type: MVP (Most Valuable Player)');
    console.log('📝 Description: MVP test user for premium demos and trials\n');
    
    console.log('✨ You can now login with:');
    console.log('   Email: courtney@mvp.com');
    console.log('   Password: mvptexas321!\n');
    
    console.log('🌐 Login URL: https://globalvoice-nexus.netlify.app/login\n');
    
  } catch (error) {
    console.error('❌ Error updating Courtney user:', error.message);
    console.error(error);
  } finally {
    await client.end();
    console.log('✅ Database connection closed');
  }
}

// Run the script
updateCourtneyToMVP();
