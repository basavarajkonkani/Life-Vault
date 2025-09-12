const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  try {
    console.log('Checking trading_accounts schema...');

    const { data, error } = await supabase
      .from('trading_accounts')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error:', error);
    } else {
      console.log('Schema check result:', data);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkSchema();
