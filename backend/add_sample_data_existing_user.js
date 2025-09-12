const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Use the existing user ID
const existingUserId = '22ce220b-e5a2-4a51-80ac-a7737c97decd';

async function addSampleData() {
  try {
    console.log('Adding sample data to Supabase for existing user...');

    // Clear existing data
    await supabase.from('assets').delete().eq('user_id', existingUserId);
    await supabase.from('nominees').delete().eq('user_id', existingUserId);
    await supabase.from('trading_accounts').delete().eq('user_id', existingUserId);

    // Add sample assets
    const { error: assetsError } = await supabase.from('assets').insert([
      {
        user_id: existingUserId,
        category: 'Bank',
        institution: 'State Bank of India',
        account_number: '****1234',
        current_value: 500000,
        status: 'Active',
        notes: 'Primary savings account',
        documents: []
      },
      {
        user_id: existingUserId,
        category: 'Mutual Fund',
        institution: 'HDFC Mutual Fund',
        account_number: 'MF001234',
        current_value: 300000,
        status: 'Active',
        notes: 'Equity growth fund',
        documents: []
      },
      {
        user_id: existingUserId,
        category: 'LIC Policy',
        institution: 'Life Insurance Corporation',
        account_number: 'LIC123456',
        current_value: 200000,
        status: 'Active',
        notes: 'Term life insurance policy',
        documents: []
      },
      {
        user_id: existingUserId,
        category: 'Fixed Deposit',
        institution: 'ICICI Bank',
        account_number: 'FD789012',
        current_value: 150000,
        status: 'Active',
        notes: '5-year fixed deposit',
        documents: []
      }
    ]);

    if (assetsError) throw assetsError;
    console.log('✅ Sample assets added');

    // Add sample nominees
    const { error: nomineesError } = await supabase.from('nominees').insert([
      {
        user_id: existingUserId,
        name: 'Jane Doe',
        relation: 'Spouse',
        phone: '+91 9876543211',
        email: 'jane@example.com',
        allocation_percentage: 60,
        is_executor: true,
        is_backup: false
      },
      {
        user_id: existingUserId,
        name: 'John Jr',
        relation: 'Child',
        phone: '+91 9876543212',
        email: 'john@example.com',
        allocation_percentage: 40,
        is_executor: false,
        is_backup: false
      }
    ]);

    if (nomineesError) throw nomineesError;
    console.log('✅ Sample nominees added');

    // Add sample trading accounts
    const { error: tradingError } = await supabase.from('trading_accounts').insert([
      {
        user_id: existingUserId,
        platform: 'Zerodha',
        account_number: 'ZR123456',
        current_value: 250000,
        status: 'Active',
        notes: 'Primary trading account'
      },
      {
        user_id: existingUserId,
        platform: 'Upstox',
        account_number: 'UP789012',
        current_value: 100000,
        status: 'Active',
        notes: 'Secondary trading account'
      }
    ]);

    if (tradingError) throw tradingError;
    console.log('✅ Sample trading accounts added');

    console.log('🎉 Sample data added successfully!');
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
  }
}

addSampleData();
