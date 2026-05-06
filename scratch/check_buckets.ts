import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tpyrcxnpwrekfghzgvgj.supabase.co';
const supabaseKey = 'sb_publishable_VOPLsy2ltunbjc2eINdSDw_ETr0fF05';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  if (error) {
    console.error('Error listing buckets:', error.message);
  } else {
    console.log('Available buckets:', data.map(b => b.name));
  }
}

checkBuckets();
