const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestUser() {
  try {
    console.log('Creating test user...');

    const testEmail = 'test@lifevault.com';
    const testPassword = 'test123456';
    const testName = 'Test User';
    const testPhone = '+91 9876543210';

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: {
        name: testName,
        phone: testPhone,
        role: 'owner'
      }
    });

    if (authError) {
      console.error('Auth creation error:', authError);
      return;
    }

    console.log('✅ Test user created in Supabase Auth:', authData.user.id);

    // Create user profile in users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        name: testName,
        email: testEmail,
        phone: testPhone,
        role: 'owner',
        is_active: true
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    } else {
      console.log('✅ Test user profile created');
    }

    console.log('🎉 Test user created successfully!');
    console.log('Email:', testEmail);
    console.log('Password:', testPassword);
    console.log('You can now use these credentials to test the login.');

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  }
}

createTestUser();
