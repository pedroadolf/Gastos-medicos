import { createClient } from '@supabase/supabase-js';
import { Siniestro, Tramite, FacturaRow, TramiteType } from '@/types/claims';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Service to handle Core Claims (Siniestros) logic.
 * Migrates logic from Google Sheets to Supabase Relational Schema.
 */
export const claimsService = {
  /**
   * Fetches all claims for the current user.
   */
  async getMySiniestros() {
    const { data, error } = await supabase
      .from('siniestros')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Siniestro[];
  },

  /**
   * Creates a new procedure (trámite) with dynamic invoices.
   * This is a transaction-like operation.
   */
  /**
   * Creates a new procedure (trámite) including files and invoices.
   * Calls the unified backend endpoint for atomic processing.
   */
  async createFullTramite(payload: {
    siniestro_id: string;
    tipo: TramiteType;
    facturas: FacturaRow[];
    files?: Record<string, File>;
  }) {
    const formData = new FormData();
    formData.append('siniestro_id', payload.siniestro_id);
    formData.append('tipo', payload.tipo);
    formData.append('facturas', JSON.stringify(payload.facturas));

    if (payload.files) {
      Object.entries(payload.files).forEach(([key, file]) => {
        formData.append(key, file);
      });
    }

    const response = await fetch('/api/tramite/create', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Error al crear el trámite en el servidor');
    }

    return await response.json();
  },

  /**
   * Get full details of a tramite including invoices
   */
  async getTramiteDetails(id: string) {
    const { data, error } = await supabase
      .from('tramites')
      .select(`
        *,
        siniestros (*),
        facturas (*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }
};
