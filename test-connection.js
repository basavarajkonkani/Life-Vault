require('dotenv').config();
const fetch = require('cross-fetch');
global.fetch = fetch;
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase environment variables!');
    console.log('Please ensure SUPABASE_URL and SUPABASE_ANON_KEY are set in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testConnection() {
    try {
        console.log('🔍 Testing Supabase connection...');

        // Test database connection by checking tables
        const tables = ['users', 'assets', 'nominees', 'vault_requests'];
        
        for (const table of tables) {
            console.log(`\n📋 Testing ${table} table...`);
            
            // Count records
            const { count, error: countError } = await supabase
                .from(table)
                .select('*', { count: 'exact', head: true });

            if (countError) {
                console.error(`❌ Error accessing ${table}:`, countError.message);
                continue;
            }

            console.log(`✅ ${table} table is accessible`);
            console.log(`📊 Current record count: ${count || 0}`);
        }

        // Test RLS policies by trying to insert and select
        console.log('\n🔒 Testing RLS policies...');
        
        // Try to read users without auth (should fail due to RLS)
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*');

        if (usersError && usersError.message.includes('permission denied')) {
            console.log('✅ RLS working: Unauthorized access blocked');
        } else if (!users || users.length === 0) {
            console.log('✅ RLS working: No data returned without auth');
        } else {
            console.warn('⚠️ Warning: RLS might not be working as expected');
        }

        console.log('\n✅ Database connection test completed!');

    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
    }
}

// Run the test
testConnection(); 