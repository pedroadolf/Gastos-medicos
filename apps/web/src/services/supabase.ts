import { createClient, SupabaseClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'https://supabase.pash.uno';

function getEnvConfig() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  const finalUrl = envUrl || FALLBACK_URL;
  return { finalUrl, anonKey, serviceKey };
}

// Exportamos la URL final para diagnóstico si es necesario
export const supabaseUrl = getEnvConfig().finalUrl;

// Lazy-initialized client – avoids crashing during Next.js build
// when env vars are not yet available (e.g. Docker build stage)
let _supabase: SupabaseClient | null = null;

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabase) {
      const { finalUrl, anonKey } = getEnvConfig();
      if (!anonKey) {
        console.warn('⚠️ [WARN] Supabase credentials missing or invalid.');
      }
      _supabase = createClient(finalUrl, anonKey || 'missing-key-build-time');
    }
    return (_supabase as any)[prop];
  },
});

/**
 * Cliente con Service Role para operaciones de servidor (bypass RLS)
 * Se recomienda usar esta función siempre en API Routes.
 */
export const getSupabaseService = () => {
  const { finalUrl, anonKey, serviceKey } = getEnvConfig();
  return createClient(finalUrl, serviceKey || anonKey);
};
