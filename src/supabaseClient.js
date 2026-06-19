import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas!');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '✓ configurada' : '✗ faltando');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓ configurada' : '✗ faltando');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  db: {
    schema: 'public'
  }
});

export default supabase;
