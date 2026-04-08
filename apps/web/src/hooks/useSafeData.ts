import { useState, useCallback, useEffect } from 'react';

interface SafeDataOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  immediate?: boolean;
}

/**
 * Hook para carga de datos resiliente.
 * Maneja estados de carga, error y placeholders automáticamente.
 */
export function useSafeData<T>(
  fetcher: () => Promise<T>,
  options: SafeDataOptions<T> = {}
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      setData(result);
      options.onSuccess?.(result);
    } catch (e: any) {
      const err = e instanceof Error ? e : new Error(e.message || 'Error desconocido');
      setError(err);
      options.onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [fetcher, options]);

  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }
  }, []);

  return {
    data,
    loading,
    error,
    refresh: execute,
    // Helper para UI
    hasData: data !== null && (Array.isArray(data) ? data.length > 0 : true),
    isConfigured: error?.message !== 'Supabase configuration missing'
  };
}
