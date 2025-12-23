/// <reference types="vite/client" />

// we need to declare custom env variables here
// see: https://vite.dev/guide/env-and-mode#env-variables-and-modes
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_PUBLIC_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
