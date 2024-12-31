import { createClient } from '@supabase/supabase-js';

if (!import.meta.env.VITE_SUPABASE_URL) throw new Error('Missing env.VITE_SUPABASE_URL');
if (!import.meta.env.VITE_SUPABASE_ANON_KEY) throw new Error('Missing env.VITE_SUPABASE_ANON_KEY');

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  {
    auth: {
      flowType: 'pkce',
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
      storage: localStorage
    }
  }
); 