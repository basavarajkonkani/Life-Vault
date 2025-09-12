const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const demoUserId = '550e8400-e29b-41d4-a716-446655440000';

async function checkAndCreateUser() {
  try {
    console.log('Checking existing users...');

    // Check what users exist
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, name, email, phone');

    if (usersError) {
      console.error('Error fetching users:', usersError);
      return;
    }

    console.log('Existing users:', users);

    // Check if demo user exists
    const demoUser = users.find(u => u.id === demoUserId);
    
    if (!demoUser) {
      console.log('Creating demo user...');
      
      // Hash the demo PIN
      const pinHash = await bcrypt.hash('1234', 10);
      
      const { error: userError } = await supabase.from('users').insert({
        id: demoUserId,
        name: 'Demo User',
        email: 'demo@lifevault.com',
        phone: '+91 9876543210',
        pin_hash: pinHash,
        role: 'owner',
        is_active: true
      });
      
      if (userError) {
        console.error('Error creating user:', userError);
        return;
      }
      
      console.log('✅ Demo user created successfully');
    } else {
      console.log('✅ Demo user already exists');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkAndCreateUser();
