import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from "uuid";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY
);

/**
 * Registra eventos con trace_id y fingerprinting para observabilidad pro.
 */
export async function logEvent({
  job_id,
  agent,
  node,
  workflow,
  status,
  error_type,
  message,
  severity,
  metadata
}) {
  const trace_id = metadata?.trace_id || uuidv4();

  // Generar huella digital para agrupar errores similares
  const fingerprint = `${workflow}|${node}|${error_type || 'info'}`;

  const { data, error } = await supabase.from("system_logs").insert([
    {
      trace_id,
      job_id,
      agent,
      node,
      workflow,
      status,
      error_type,
      severity: severity || 'info',
      message,
      fingerprint,
      metadata: metadata || {}
    }
  ]);

  if (error) {
    console.error("❌ Error logging to Supabase:", error.message);
  }

  return trace_id;
}
