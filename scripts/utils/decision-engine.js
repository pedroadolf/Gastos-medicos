/**
 * 🧠 DECISION ENGINE: SELF-HEALING LOGIC
 * Decide la acción de recuperación basada en el tipo de error capturado.
 */

function getRecoveryAction(errorData) {
  const { error_type, status_code, node_name, retry_count = 0 } = errorData;

  const STRATEGIES = {
    RETRY: { action: 'retry', delay: 5000 * Math.pow(2, retry_count) },
    REFRESH: { action: 'refresh_auth', next: 'retry' },
    FALLBACK: { action: 'use_fallback_db', next: 'notify_admin' },
    STOP: { action: 'fail_and_log', notify: true }
  };

  // Lógica de Decisión
  if (status_code === 401) return STRATEGIES.REFRESH;
  if (status_code === 429) return { ...STRATEGIES.RETRY, delay: 60000 }; // Wait 1min
  if (status_code >= 500 && retry_count < 3) return STRATEGIES.RETRY;
  
  if (error_type === 'INVALID_INPUT' || error_type === 'CONTRACT_MISMATCH') {
    return STRATEGIES.STOP;
  }

  return STRATEGIES.FALLBACK;
}

/*
Ejemplo de Entrada (n8n Function Node):
{
  "error_type": "TIMEOUT",
  "status_code": 504,
  "node_name": "Supabase Fetch",
  "retry_count": 1
}
*/

module.exports = { getRecoveryAction };
