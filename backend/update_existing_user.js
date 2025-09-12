const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function updateExistingUser() {
  try {
    console.log('Updating existing test user...');

    const testEmail = 'test@lifevault.com';
    const testPin = '1234';

    // Hash the PIN
    const pinHash = await bcrypt.hash(testPin, 10);

    // Update user profile with PIN hash
    const { error: updateError } = await supabase
      .from('users')
      .update({
        pin_hash: pinHash
      })
      .eq('email', testEmail);

    if (updateError) {
      console.error('Update error:', updateError);
    } else {
      console.log('✅ Test user updated with PIN hash');
    }

    console.log('🎉 Test user ready!');
    console.log('Email:', testEmail);
    console.log('Password: test123456');
    console.log('PIN:', testPin);

  } catch (error) {
    console.error('❌ Error updating test user:', error);
  }
}

updateExistingUser();
