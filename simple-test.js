require('dotenv').config();
const fetch = require('cross-fetch');
global.fetch = fetch;
const { createClient } = require('@supabase/supabase-js');

async function testConnection() {
    const supabaseUrl = 'https://iaeiiaurhafdgprvqkti.supabase.co';
    const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZWlpYXVyaGFmZGdwcnZxa3RpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4ODE2NjMsImV4cCI6MjA3MjQ1NzY2M30.1os-X1irK-gmU7N8vdK121v-EIYJtos5goA4Gk0QMsQ';
    
    console.log('Testing connection to:', supabaseUrl);
    console.log('Using anon key:', supabaseKey.substring(0, 10) + '...');
    
    const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
    
    try {
        const { data, error } = await supabase
            .from('users')
            .select('count')
            .limit(1);
            
        if (error) {
            console.error('Error:', error.message);
            return;
        }
        
        console.log('Connection successful!');
        console.log('Response:', data);
        
    } catch (err) {
        console.error('Connection failed:', err.message);
    }
}

testConnection(); 