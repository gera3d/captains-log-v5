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
import { isMockStaging, isLivePreview } from './runtimeConfig';
import { mockSupabase } from './stagingMock';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const redirectTo = import.meta.env.MODE === 'development'
  ? 'http://localhost:5174'
  : import.meta.env.VITE_REDIRECT_URL || undefined;

// Staging never creates a network Supabase client or uses a copied environment.
export const supabase = isMockStaging ? mockSupabase : createClient(supabaseUrl, supabaseAnonKey, { auth: { redirectTo, ...(isLivePreview ? { storageKey: 'goodidea-live-preview-auth' } : {}) } });
