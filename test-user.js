require('dotenv').config();
const fetch = require('cross-fetch');
global.fetch = fetch;
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

async function testUserCreation() {
    const supabaseUrl = 'https://iaeiiaurhafdgprvqkti.supabase.co';
    // Use service role key for admin operations
    const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZWlpYXVyaGFmZGdwcnZxa3RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Njg4MTY2MywiZXhwIjoyMDcyNDU3NjYzfQ.YjQ5NTc2M2JmNzQ0ZDQ0YmFiMjY0ZWM2MzM5NjBmYjE3';
    
    console.log('🔍 Testing user creation with service role...');
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });
    
    try {
        // Create test user data
        const testUser = {
            name: 'Test User',
            phone: '+919876543210',
            email: 'test@example.com',
            pin_hash: await bcrypt.hash('1234', 10), // Test PIN: 1234
            is_active: true,
            role: 'user'
        };
        
        console.log('\n📝 Attempting to create user:', testUser.name);
        console.log('Phone:', testUser.phone);
        console.log('Email:', testUser.email);
        
        // Try to insert the user
        const { data: newUser, error: insertError } = await supabase
            .from('users')
            .insert(testUser)
            .select()
            .single();
            
        if (insertError) {
            if (insertError.code === '23505') { // Unique constraint violation
                console.log('\n⚠️  User with this phone/email already exists');
                
                // Try to fetch the existing user
                const { data: existingUser, error: fetchError } = await supabase
                    .from('users')
                    .select('*')
                    .or(`phone.eq.${testUser.phone},email.eq.${testUser.email}`)
                    .single();
                
                if (fetchError) {
                    console.error('❌ Error fetching existing user:', fetchError.message);
                    return;
                }
                
                console.log('✅ Found existing user:', {
                    id: existingUser.id,
                    name: existingUser.name,
                    created_at: existingUser.created_at
                });
                
            } else {
                console.error('❌ Error creating user:', insertError.message);
            }
            return;
        }
        
        console.log('\n✅ User created successfully!');
        console.log('User ID:', newUser.id);
        console.log('Created at:', newUser.created_at);
        
    } catch (err) {
        console.error('❌ Test failed:', err.message);
    }
}

// Run the test
testUserCreation(); 