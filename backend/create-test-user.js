#!/usr/bin/env node

/**
 * Create Test User Script
 * Creates a test user directly in the Supabase database
 */

const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const DATABASE_URL = 'postgresql://postgres:U1rw29AqFQPvJLse@db.hzxubnyehbrsqmzciixf.supabase.co:5432/postgres';

async function createTestUser() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!');

    // Hash password
    const password = 'TestPass123!';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user already exists
    const checkResult = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['test@globalvoice.com']
    );

    if (checkResult.rows.length > 0) {
      console.log('⚠️  Test user already exists. Updating password...');
      await client.query(
        'UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2',
        [hashedPassword, 'test@globalvoice.com']
      );
      console.log('✅ Test user password updated!');
    } else {
      console.log('👤 Creating test user...');
      const result = await client.query(
        `INSERT INTO users (name, email, password, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id, name, email, created_at`,
        ['Test User', 'test@globalvoice.com', hashedPassword]
      );
      console.log('✅ Test user created!');
      console.log('📋 User details:', result.rows[0]);
    }

    console.log('\n🎉 Success! You can now login with:');
    console.log('   Email: test@globalvoice.com');
    console.log('   Password: TestPass123!');
    console.log('\n🌐 Login at: https://globalvoice-nexus.netlify.app/login');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTestUser();
