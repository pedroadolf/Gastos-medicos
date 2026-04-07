// apps/web/src/hooks/useTramites.ts
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Tramite {
  id: string;
  folio: string;
  tipo_tramite: string;
  aseguradora: string;
  paciente_nombre: string;
  estado: any;
  score?: number;
  issues?: any[];
  observaciones?: string;
  created_at: string;
  updated_at: string;
  zip_url?: string;
  adjuntos: any[];
  facturas: any[];
  retry_count?: number;
  last_error?: string;
  last_retry_at?: string;
}

export function useTramites() {
  const [tramites, setTramites] = useState<Tramite[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  const fetchTramites = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error: sbError } = await supabase
        .from('tramites')
        .select(`
          *,
          siniestros(numero_siniestro, nombre_siniestro, user_id),
          audit_results(score, issues, approved, observaciones),
          adjuntos(id, tipo_documento, file_name, file_path),
          facturas(id, importe, tipo_gasto, numero_factura)
        `)
        .order('created_at', { ascending: false });
      
      if (sbError) throw sbError;
      
      if (data) {
        // Transform logic to match UI expectations
        const formatted: Tramite[] = data.map((t: any) => {
           const audit = t.audit_results?.[0] || {};
           const siniestro = t.siniestros || {};
           
           return {
             id: t.id,
             folio: siniestro.numero_siniestro || 'SIN-FOLIO',
             tipo_tramite: t.tipo,
             aseguradora: 'MetLife', // Default placeholder
             paciente_nombre: siniestro.nombre_siniestro || 'Paciente',
             estado: t.status,
             score: audit.score || 0,
             observaciones: audit.observaciones,
             created_at: t.created_at,
             updated_at: t.updated_at,
             zip_url: t.url_expediente_zip,
             adjuntos: t.adjuntos || [],
             facturas: t.facturas || [],
             retry_count: t.retry_count || 0,
             last_error: t.last_error,
             last_retry_at: t.last_retry_at
           };
        });

        setTramites(formatted);
      }
    } catch (e) {
      console.error("Error fetching tramites", e);
      setError(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTramites();

    // ⚡ Realtime Subscription
    const channel = supabase
      .channel('tramites_realtime_hook')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tramites' },
        () => {
          fetchTramites();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTramites]);

  return {
    tramites,
    loading,
    error,
    refetch: fetchTramites,
  };
}

export function useTramite(id: string) {
  const [tramite, setTramite] = useState<Tramite | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTramite = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tramites')
        .select(`
          *,
          siniestros(numero_siniestro, nombre_siniestro, user_id),
          audit_results(score, issues, approved, observaciones),
          adjuntos(id, tipo_documento, file_name, file_path),
          facturas(id, importe, tipo_gasto, numero_factura)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        const audit = data.audit_results?.[0] || {};
        const siniestro = data.siniestros || {};
        
        setTramite({
          id: data.id,
          folio: siniestro.numero_siniestro || 'SIN-FOLIO',
          tipo_tramite: data.tipo,
          aseguradora: 'MetLife',
          paciente_nombre: siniestro.nombre_siniestro || 'Paciente',
          estado: data.status,
          score: audit.score || 0,
          issues: audit.issues || [],
          observaciones: audit.observaciones,
          created_at: data.created_at,
          updated_at: data.updated_at,
          zip_url: data.url_expediente_zip,
          adjuntos: data.adjuntos || [],
          facturas: data.facturas || [],
          retry_count: data.retry_count || 0,
          last_error: data.last_error,
          last_retry_at: data.last_retry_at
        });
      }
    } catch (e) {
      console.error("Error fetching single tramite", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id || id === 'loading') return;
    
    fetchTramite();

    const channel = supabase
      .channel(`tramite_${id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tramites', filter: `id=eq.${id}` },
        () => fetchTramite()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [id]);

  return { tramite, isLoading: loading, refetch: fetchTramite };
}
