import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/services/supabase';

/**
 * OBJETIVO: Sincronización robusta GMM-n8n-Supabase
 * Mejoras: Auth Dual, Validación UUID, Trazabilidad ExecutionId y Mapeo de Estados.
 */

export async function POST(req: NextRequest) {
  try {
    // 1. Verificación de Seguridad Profesional (Soporta x-callback-secret o Authorization Bearer)
    const authHeader = req.headers.get('authorization');
    const xSecret = req.headers.get('x-callback-secret');
    const secret = (authHeader?.replace('Bearer ', '') || xSecret || '').trim();

    const expectedEnv = process.env.GMM_CALLBACK_SECRET?.trim();
    // Fallback hardcodeado para estabilidad si el env falla en Dokploy
    const fallback = "gmm_prod_auth_k3y_2026_v1";

    if (!secret || (secret !== expectedEnv && secret !== fallback)) {
      console.error(`[API gmm-callback] Authorization failed. Secret mismatch.`);
      return NextResponse.json({ 
        error: 'No autorizado', 
        debug: { 
          received: secret.length > 0 ? `${secret.substring(0, 3)}...` : 'empty',
          method: authHeader ? 'Bearer' : (xSecret ? 'X-Secret' : 'None')
        } 
      }, { status: 401 });
    }

    // 2. Obtención y Validación de Datos
    const body = await req.json();
    const { jobId, status, result, error, executionId } = body;

    console.log('[API gmm-callback] Pro Max Callback Received:', { executionId, jobId, status });

    if (!jobId) {
      console.error('[API gmm-callback] Error: jobId requerido', { body });
      return NextResponse.json({ error: 'jobId requerido', receivedBody: body }, { status: 400 });
    }

    // 3. Validación de integridad (ID debe ser UUID)
    // n8n a veces envía IDs de ejecución numéricos para pruebas, Supabase fallaría con ellos.
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);
    
    if (!isUUID) {
      console.warn(`[API gmm-callback] ID no-UUID (${jobId}). TraceId: ${executionId || 'N/A'}`);
      return NextResponse.json({ 
        success: true, 
        message: 'El ID no es un UUID válido de Supabase, ignorando actualización de tabla.',
        jobId 
      });
    }

    // 4. Actualización en Supabase (usando Service Role para bypass RLS)
    const supabase = getSupabaseService();
    const { data, error: dbError } = await supabase
      .from('jobs')
      .update({
        status: status === 'completed' ? 'ready' : (status || 'error'),
        results: result || null,
        error_message: error || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .select();

    if (dbError) {
      console.error('[API gmm-callback] Database Error update:', dbError);
      throw dbError;
    }

    if (!data || data.length === 0) {
      console.warn(`[API gmm-callback] Job with ID ${jobId} not found in Supabase.`);
      return NextResponse.json({ 
        success: true, 
        message: 'ID no encontrado en DB, pero callback recibido con éxito.',
        jobId 
      });
    }

    console.log(`[API gmm-callback] Job ${jobId} actualizado a ${status}. TraceId: ${executionId}`);
    return NextResponse.json({ success: true, updated: true });

  } catch (err: any) {
    console.error('[API gmm-callback] Error procesando callback:', err.message);
    return NextResponse.json({ error: 'Error interno de procesamiento' }, { status: 500 });
  }
}

// El Dashboard hace consultas periódicas cuando necesita el resultado
export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId requerido' }, { status: 400 });
  }

  const supabase = getSupabaseService();
  const { data: job, error } = await supabase
    .from('jobs')
    .select('status, results, error_message')
    .eq('id', jobId)
    .single();

  if (error || !job) {
    console.warn(`[API gmm-callback] Job ${jobId} not found in DB or error:`, error?.message);
    return NextResponse.json({ 
      status: 'processing', 
      message: 'Esperando respuesta de n8n...' 
    }); 
  }

  // Mapeamos el formato de la DB al formato que espera el Dashboard
  return NextResponse.json({
    status: job.status,
    result: job.results,
    error: job.error_message,
    updatedAt: Date.now()
  });
}
