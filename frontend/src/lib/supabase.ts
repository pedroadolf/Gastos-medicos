import { createClient } from '@supabase/supabase-js';

const FALLBACK_URL = 'http://antigravity-supabase-da8a50-193-43-134-161.traefik.me';
const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Determinamos la URL final una sola vez
const finalUrl = (!envUrl || envUrl.includes('supabase.pash.uno')) ? FALLBACK_URL : envUrl;

if (!finalUrl || !supabaseAnonKey) {
  console.warn('⚠️ [WARN] Supabase credentials missing or invalid.');
}

// Exportamos la URL final para diagnóstico si es necesario
export const supabaseUrl = finalUrl;

// Exportamos el cliente anónimo (usado en componentes client-side si aplica)
export const supabase = createClient(finalUrl, supabaseAnonKey);

/**
 * Cliente con Service Role para operaciones de servidor (bypass RLS)
 * Se recomienda usar esta función siempre en API Routes.
 */
export const getSupabaseService = () => {
    const serviceKey = supabaseServiceKey || supabaseAnonKey;
    return createClient(finalUrl, serviceKey);
};
