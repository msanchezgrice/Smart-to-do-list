import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Environment variables:', {
  url: supabaseUrl,
  key: supabaseAnonKey?.substring(0, 10) + '...',
  fullKeyLength: supabaseAnonKey?.length,
  isDefined: {
    url: typeof supabaseUrl !== 'undefined',
    key: typeof supabaseAnonKey !== 'undefined'
  }
});

if (!supabaseUrl) throw new Error('Missing env.VITE_SUPABASE_URL');
if (!supabaseAnonKey) throw new Error('Missing env.VITE_SUPABASE_ANON_KEY');

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true,
    storage: window.localStorage
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey,
      'Authorization': `Bearer ${supabaseAnonKey}`
    }
  }
}); 