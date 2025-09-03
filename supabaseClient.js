const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY in your .env file');
  console.error('Example:');
  console.error('SUPABASE_URL=https://your-project.supabase.co');
  console.error('SUPABASE_ANON_KEY=your-anon-key');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ Supabase client initialized');
console.log(`🔗 Connected to: ${supabaseUrl}`);

module.exports = supabase; 