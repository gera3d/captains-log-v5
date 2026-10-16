// =========================
// TODO[progress-md][P1][DB]
// - Design `voice_notes` table schema
// - Write SQL migration file
// - Apply migration via Supabase CLI
// - Enable RLS on `voice_notes`
// - Create RLS policy: user can access own notes
// - (Optional) Create RLS policy for shared notes
// - Test RLS policies via Supabase dashboard
// - [Browser Test] Verify data access control
// =========================
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Determine the redirect URL based on environment
const redirectTo = import.meta.env.MODE === 'development' 
  ? 'http://localhost:5174' // Development URL with correct port 5174
  : import.meta.env.VITE_REDIRECT_URL || undefined; // Production URL from env var

if (import.meta.env.MODE === 'development') {
  console.log('[Supabase] URL:', supabaseUrl);
  console.log('[Supabase] Anon Key:', supabaseAnonKey ? supabaseAnonKey.slice(0, 8) + '...' : 'undefined');
  console.log('[Supabase] Redirect URL:', redirectTo);
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    redirectTo
  }
});