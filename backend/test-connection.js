const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }
    
    console.log('📡 Supabase URL:', supabaseUrl);
    console.log('🔑 Service Key:', supabaseKey.substring(0, 20) + '...');
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection by querying users table
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      return;
    }
    
    console.log('✅ Supabase connection successful!');
    console.log('📊 Database is accessible');
    
    // Test all tables
    const tables = ['users', 'assets', 'nominees', 'vault_requests', 'trading_accounts'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`❌ Table ${table}: ${error.message}`);
        } else {
          console.log(`✅ Table ${table}: Accessible`);
        }
      } catch (err) {
        console.log(`❌ Table ${table}: ${err.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testConnection();
