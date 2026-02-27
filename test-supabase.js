// Test Supabase connection and create tables
const { createClient } = require('@supabase/supabase-js');

// Use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
  console.error('   Add them to .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  console.log('URL:', supabaseUrl);
  
  try {
    // Test basic connection
    const { data, error } = await supabase.from('agents').select('*').limit(1);
    
    if (error && error.code === '42P01') {
      console.log('❌ Tables not created yet');
      console.log('   Run: node setup-database.js');
      return false;
    }
    
    if (error) {
      console.error('Connection error:', error);
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log('✅ Tables exist');
    return true;
  } catch (err) {
    console.error('Failed to connect:', err.message);
    return false;
  }
}

testConnection();
