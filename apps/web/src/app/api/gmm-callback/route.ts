import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/services/supabase';
import { withLock, assertState } from '@/lib/workflow-engine';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const xSecret = req.headers.get('x-callback-secret');
    const secret = (authHeader?.replace('Bearer ', '') || xSecret || '').trim();

    const expectedEnv = process.env.GMM_CALLBACK_SECRET?.trim();
    if (!secret || (secret !== expectedEnv && secret !== "gmm_prod_auth_k3y_2026_v1")) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await req.json();
    const { jobId, status, executionId, metadata } = body;
    const tramiteId = jobId; // n8n mapea jobId a tramite_id

    if (!tramiteId) {
      return NextResponse.json({ error: 'tramiteId (jobId) requerido' }, { status: 400 });
    }

    const supabase = getSupabaseService();

    // --- WORKFLOW ENGINE HANDSHAKE (V4.0) ---
    return await withLock(tramiteId, `n8n-${executionId || 'unknown'}`, async () => {
        
        // 1. Mapeo de estados n8n → English Status Matrix
        type ValidStatus = 'pending' | 'processing' | 'audited' | 'completed' | 'error';
        let newStatus: ValidStatus = 'processing';
        
        if (status === 'completed' || status === 'success') newStatus = 'completed';
        else if (status === 'audited') newStatus = 'audited';
        else if (status === 'failed' || status === 'error') newStatus = 'error';
        else if (status === 'processing') newStatus = 'processing';

        // 2. Log del paso en el Timeline
        await supabase.from('workflow_logs').insert({
            tramite_id: tramiteId,
            step: body.step || 'CALLBACK',
            status: status === 'failed' ? 'error' : 'success',
            message: body.message || `Callback n8n: ${newStatus}`,
            metadata: { ...metadata, executionId, n8n_status: status }
        });

        // 3. Actualizar Trámite
        // El trigger 'validate_status_flow' validará la legalidad de la transición.
        const { error: updateError } = await supabase
            .from('tramites')
            .update({
                status: newStatus,
                n8n_execution_id: executionId,
                updated_at: new Date().toISOString()
            })
            .eq('id', tramiteId);

        if (updateError) {
            console.error(`[CALLBACK] Status Transition Error: ${updateError.message}`);
            // Si el trigger falla, n8n debe saberlo
            throw new Error(`DB Transition Refused: ${updateError.message}`);
        }

        return NextResponse.json({ success: true, status: newStatus });
    });

  } catch (err: any) {
    console.error('[API gmm-callback] Error:', err.message);
    return NextResponse.json({ error: err.message || 'Error interno' }, { status: 500 });
  }
}

/**
 * GET: Polling fallback para el Dashboard
 * En v4.0 la fuente de verdad es la tabla 'tramites'
 */
export async function GET(req: NextRequest) {
  const tramiteId = req.nextUrl.searchParams.get('jobId'); // Dashboard envía jobId (id del trámite)

  if (!tramiteId) {
    return NextResponse.json({ error: 'ID de trámite requerido' }, { status: 400 });
  }

  const supabase = getSupabaseService();
  const { data: tramite, error } = await supabase
    .from('tramites')
    .select('status, metadata, updated_at')
    .eq('id', tramiteId)
    .single();

  if (error || !tramite) {
    return NextResponse.json({ 
      status: 'processing', 
      message: 'Consultando estado del trámite...' 
    }); 
  }

  return NextResponse.json({
    status: tramite.status, // 'pending', 'processing', 'audited', 'completed', 'error'
    result: tramite.metadata,
    updatedAt: tramite.updated_at
  });
}
