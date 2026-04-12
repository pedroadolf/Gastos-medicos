// apps/web/src/hooks/useAlerts.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';

export interface AlertLog {
  id: string;
  title: string;
  status: 'firing' | 'resolved';
  severity: 'critical' | 'warning' | 'info';
  payload: any;
  starts_at: string;
  ends_at?: string;
  created_at: string;
}

export function useAlerts(limit = 20) {
  const [alerts, setAlerts] = useState<AlertLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('alerts_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('⚠️ [OBSERVABILITY] Alertas no disponibles aún:', error.message);
        setAlerts([]);
      } else {
        setAlerts(data || []);
      }
    } catch (err) {
      console.error('❌ [OBSERVABILITY] Error crítico al consultar alertas:', err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchAlerts();

    const channel = supabase
      .channel('alerts-live')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts_log',
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAlerts((prev) => [payload.new as AlertLog, ...prev].slice(0, limit));
          } else if (payload.eventType === 'UPDATE') {
            setAlerts((prev) =>
              prev.map((a) => (a.id === payload.new.id ? (payload.new as AlertLog) : a))
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchAlerts, limit]);

  return { alerts, loading, refresh: fetchAlerts };
}
