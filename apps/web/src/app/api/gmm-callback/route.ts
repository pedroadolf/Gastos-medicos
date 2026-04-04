import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/services/supabase';

// n8n llama este endpoint al terminar
export async function POST(req: NextRequest) {
  // Verificación de seguridad básica (Secret compartido con n8n)
  const secret = req.headers.get('x-callback-secret')?.trim();
  const expectedEnv = process.env.GMM_CALLBACK_SECRET?.trim();
  // Fallback hardcodeado para estabilidad si el env falla en Dokploy
  const fallback = "gmm_prod_auth_k3y_2026_v1";

  if (secret !== expectedEnv && secret !== fallback) {
    console.error(`[API gmm-callback] Authorization failed. Secret mismatch.`);
    return NextResponse.json({ 
      error: 'No autorizado', 
      debug: { 
        receivedLen: secret?.length || 0,
        expectedEnvLen: expectedEnv?.length || 0,
        isDiff: true
      } 
    }, { status: 401 });
  }

  try {
    const body = await req.json();
    
    console.log('[API gmm-callback] Incoming callback request:', {
      headers: Object.fromEntries(req.headers.entries()),
      body
    });

    const { jobId, status, result, error } = body;

    if (!jobId) {
      console.error('[API gmm-callback] Error: jobId not found in body. Received:', body);
      return NextResponse.json({ 
        error: 'jobId requerido',
        receivedBody: body 
      }, { status: 400 });
    }

    // Persistencia en Supabase (usando Service Role para bypass RLS)
    const supabase = getSupabaseService();
    
    // Si el jobId no es un UUID válido (ej: es un id de ejecución de n8n), 
    // lo registramos pero no fallará el endpoint, para poder ver qué está pasando.
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId);
    
    if (!isUUID) {
      console.warn(`[API gmm-callback] jobId ${jobId} is not a valid UUID. It might be an n8n execution ID.`);
    }

    const { error: dbError, data } = await supabase
      .from('jobs')
      .update({
        status: status === 'completed' ? 'ready' : (status === 'error' ? 'error' : status),
        result: result || error || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .select();

    if (dbError) {
      console.error('[API gmm-callback] Database Error update:', dbError);
      return NextResponse.json({ 
        error: 'Error al actualizar base de datos', 
        details: dbError,
        jobId 
      }, { status: 500 });
    }

    if (!data || data.length === 0) {
      console.warn(`[API gmm-callback] Job with ID ${jobId} not found in Supabase.`);
      return NextResponse.json({ 
        success: true, 
        message: 'Job ID no encontrado en Supabase, pero callback recibido',
        jobId 
      });
    }

    console.log(`[API gmm-callback] Status updated in DB for Job ${jobId}: ${status}`);

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[API gmm-callback] Error procesando body:', err);
    return NextResponse.json({ error: 'Body inválido o error interno' }, { status: 500 });
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
    updatedAt: Date.now() // Mock para compatibilidad
  });
}

