// apps/web/src/hooks/useSystemLogs.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/services/supabase';

export interface SystemLog {
  id: string;
  trace_id: string;
  job_id?: string;
  agent: string;
  node: string;
  workflow: string;
  status: string;
  severity: 'info' | 'warning' | 'error' | 'success';
  message: string;
  created_at: string;
}

export function useSystemLogs(limit = 50) {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('system_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching system logs:', error);
    } else {
      setLogs(data || []);
    }
    setLoading(false);
  }, [limit]);

  useEffect(() => {
    fetchLogs();

    const channel = supabase
      .channel('system-logs-live')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'system_logs',
        },
        (payload) => {
          setLogs((prev) => [payload.new as SystemLog, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLogs, limit]);

  return { logs, loading, refresh: fetchLogs };
}
