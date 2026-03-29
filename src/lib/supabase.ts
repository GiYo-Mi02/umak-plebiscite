import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[UMAK Plebiscite] Missing Supabase environment variables.\n' +
    'Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env.local file.\n' +
    'See .env.example for details.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');
