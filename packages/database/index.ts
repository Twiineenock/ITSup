import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials missing. Ensure .env files are configured.');
} else {
  console.log('DEBUG: Supabase Client Initialized with URL:', supabaseUrl);
}

export const supabase = createClient(supabaseUrl, supabaseKey);
