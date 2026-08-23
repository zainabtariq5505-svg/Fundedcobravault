import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  const { data, error } = await supabase.from('affiliates').select('id').limit(1);
  if (error) {
    console.error('Error connecting to database:', error);
  } else {
    console.log('Successfully connected! Data:', data);
  }
}

testConnection();
