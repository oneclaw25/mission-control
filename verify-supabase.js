const { createClient } = require('@supabase/supabase-js');

// Use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables:');
  console.error('   NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required');
  console.error('   Add them to .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupDatabase() {
  console.log('🚀 Setting up Mission Control database...\n');

  try {
    // Test connection by trying to query agents
    console.log('1️⃣ Testing connection...');
    const { data: existingAgents, error: checkError } = await supabase
      .from('agents')
      .select('*')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      console.log('   ℹ️  Tables do not exist yet');
      console.log('   📋 Please run the SQL in Supabase SQL Editor');
      console.log('\n   📄 SQL file location:');
      console.log('   ~/workspace/mission-control/supabase/schema.sql');
      return false;
    }

    if (checkError) {
      console.error('   ❌ Connection error:', checkError.message);
      return false;
    }

    console.log('   ✅ Connection successful');
    console.log('   ✅ Tables exist');

    // Check row counts
    console.log('\n2️⃣ Checking table status...');
    const tables = ['agents', 'tasks', 'content_items', 'business_metrics', 'time_entries'];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ⚠️  ${table}: error - ${error.message}`);
      } else {
        console.log(`   ✅ ${table}: ${count} rows`);
      }
    }

    console.log('\n✅ Database verification complete!');
    return true;

  } catch (err: any) {
    console.error('\n❌ Error:', err.message);
    return false;
  }
}

setupDatabase();
