const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Test Supabase connection and operations
async function testSupabase() {
  console.log('🧪 Testing Supabase Connection...\n');

  // Check environment variables
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.error('Please create a .env file with:');
    console.error('SUPABASE_URL=your-project-url');
    console.error('SUPABASE_ANON_KEY=your-anon-key');
    return;
  }

  console.log(`🔗 Connecting to: ${supabaseUrl}`);

  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  try {
    // Test 1: Check database connection
    console.log('1️⃣ Testing database connection...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('Make sure you have run the database schema (supabase-schema.sql)');
      return;
    }

    console.log('✅ Database connection successful!');

    // Test 2: Check tables exist
    console.log('\n2️⃣ Checking required tables...');
    
    const tables = ['users', 'assets', 'nominees', 'vault_requests'];
    
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.error(`❌ Table '${table}' not found:`, tableError.message);
        } else {
          console.log(`✅ Table '${table}' exists`);
        }
      } catch (err) {
        console.error(`❌ Error checking table '${table}':`, err.message);
      }
    }

    // Test 3: Count existing data
    console.log('\n3️⃣ Checking existing data...');
    
    for (const table of tables) {
      try {
        const { count, error: countError } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true });
        
        if (!countError) {
          console.log(`📊 ${table}: ${count || 0} records`);
        }
      } catch (err) {
        console.log(`📊 ${table}: Unable to count`);
      }
    }

    console.log('\n🎉 Supabase setup looks good!');
    console.log('✅ You can now start the Supabase backend with:');
    console.log('   node supabase-backend-updated.js');

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

// Run the test
testSupabase(); 