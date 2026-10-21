/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_BETA_MODE?: string;
  readonly VITE_BETA_WAITLIST_URL?: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
