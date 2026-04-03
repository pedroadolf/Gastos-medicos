import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseService } from '@/services/supabase';

// n8n llama este endpoint al terminar
export async function POST(req: NextRequest) {
  // Verificación de seguridad básica (Secret compartido con n8n)
  const secret = req.headers.get('x-callback-secret')?.trim();
  const expected = process.env.GMM_CALLBACK_SECRET?.trim();

  if (expected && secret !== expected) {
    console.error(`[API gmm-callback] Authorization failed. Secret length: ${secret?.length || 0}, Expected length: ${expected.length}`);
    return NextResponse.json({ 
      error: 'No autorizado', 
      debug: { 
        receivedLen: secret?.length || 0,
        expectedLen: expected.length,
        isDiff: secret !== expected
      } 
    }, { status: 401 });
  }

  try {
    const body = await req.json();
    console.log('[API gmm-callback] Incoming callback:', JSON.stringify(body, null, 2));

    const { jobId, status, result, error } = body;

    if (!jobId) {
      console.error('[API gmm-callback] Error: jobId not found in body');
      return NextResponse.json({ error: 'jobId requerido' }, { status: 400 });
    }

    // Persistencia en Supabase (usando Service Role para bypass RLS)
    const supabase = getSupabaseService();
    const { error: dbError } = await supabase
      .from('jobs')
      .update({
        status: status === 'completed' ? 'completed' : (status || 'processing'),
        results: result,
        error_message: error,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (dbError) {
      console.error('[API gmm-callback] Database Error update:', dbError);
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

