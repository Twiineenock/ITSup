import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tpyrcxnpwrekfghzgvgj.supabase.co';
const supabaseKey = 'sb_publishable_VOPLsy2ltunbjc2eINdSDw_ETr0fF05';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    if (error) {
      console.error('Connection error:', error.message);
    } else {
      console.log('Connection successful! Data:', data);
    }
  } catch (err: any) {
    console.error('Fetch failed:', err.message);
  }
}

testConnection();
