import { getSupabaseService } from "@/services/supabase";

/**
 * 🔒 WORKFLOW ENGINE v4.0 - Enterprise Guards
 * Core logic for state machine enforcement and atomic locking.
 */

export type TramiteStatus = 'pending' | 'processing' | 'audited' | 'completed' | 'error';

/**
 * Ensures a tramite is in one of the allowed states.
 * Fails fast before expensive operations.
 */
export function assertState(status: string, allowed: TramiteStatus[]) {
  if (!allowed.includes(status as TramiteStatus)) {
    throw new Error(`ESTADO INVÁLIDO: El trámite está en '${status}', pero se requiere [${allowed.join(", ")}]`);
  }
}

/**
 * 🛡️ withLock Pattern
 * Orchestrates atomic access to a tramite.
 */
export async function withLock<T>(
  tramiteId: string, 
  owner: string, 
  fn: () => Promise<T>
): Promise<T> {
  const supabase = getSupabaseService();

  // 1. Acquire Lock
  const { data: isLocked, error: lockError } = await supabase.rpc("lock_tramite", {
    p_tramite_id: tramiteId,
    p_owner: owner
  });

  if (lockError || !isLocked) {
    throw new Error("PROCESO EN CURSO: Este trámite ya está siendo procesado por otro sistema o usuario.");
  }

  try {
    // 2. Execute business logic
    return await fn();
  } finally {
    // 3. Guaranteed Unlock
    await supabase.rpc("unlock_tramite", {
      p_tramite_id: tramiteId,
      p_owner: owner
    });
  }
}

/**
 * 🔑 Idempotency Helper
 */
export async function checkIdempotency(key: string): Promise<any | null> {
    const supabase = getSupabaseService();
    const { data } = await supabase
        .from("idempotency_keys")
        .select("response")
        .eq("key", key)
        .single();
    
    return data?.response || null;
}

export async function saveIdempotency(key: string, tramiteId: string, response: any) {
    const supabase = getSupabaseService();
    await supabase.from("idempotency_keys").insert({
        key,
        tramite_id: tramiteId,
        response
    });
}
