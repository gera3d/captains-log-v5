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

export const supabase = createClient(supabaseUrl, supabaseAnonKey);