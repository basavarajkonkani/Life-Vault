const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const existingUserId = '22ce220b-e5a2-4a51-80ac-a7737c97decd';

async function addTradingAccounts() {
  try {
    console.log('Adding trading accounts with correct schema...');

    // Add sample trading accounts with correct column names
    const { error: tradingError } = await supabase.from('trading_accounts').insert([
      {
        user_id: existingUserId,
        broker_name: 'Zerodha',
        client_id: 'ZR123456',
        demat_number: 'ZR123456',
        current_value: 250000,
        status: 'Active',
        notes: 'Primary trading account'
      },
      {
        user_id: existingUserId,
        broker_name: 'Upstox',
        client_id: 'UP789012',
        demat_number: 'UP789012',
        current_value: 100000,
        status: 'Active',
        notes: 'Secondary trading account'
      }
    ]);

    if (tradingError) throw tradingError;
    console.log('✅ Sample trading accounts added');

    console.log('🎉 Trading accounts added successfully!');
  } catch (error) {
    console.error('❌ Error adding trading accounts:', error);
  }
}

addTradingAccounts();
