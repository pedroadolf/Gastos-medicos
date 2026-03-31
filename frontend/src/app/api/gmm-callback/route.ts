import { NextRequest, NextResponse } from 'next/server';

// Almacén temporal en memoria (válido para 1 instancia)
// Si tienes múltiples réplicas, cambiar por Supabase/Redis en el futuro
const jobStore = new Map<string, JobResult>();

interface JobResult {
  status: 'processing' | 'completed' | 'failed';
  result?: any;
  error?: string;
  updatedAt: number;
}

// n8n llama este endpoint al terminar
export async function POST(req: NextRequest) {
  // Verificación de seguridad básica (Secret compartido con n8n)
  const secret = req.headers.get('x-callback-secret');
  if (process.env.GMM_CALLBACK_SECRET && secret !== process.env.GMM_CALLBACK_SECRET) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { jobId, status, result, error } = body;

    if (!jobId) {
      return NextResponse.json({ error: 'jobId requerido' }, { status: 400 });
    }

    jobStore.set(jobId, {
      status,
      result,
      error,
      updatedAt: Date.now(),
    });

    console.log(`[API gmm-callback] Status received for Job ${jobId}: ${status}`);

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

  const job = jobStore.get(jobId);

  if (!job) {
    // Si no encontramos el job, asumimos que sigue en proceso
    // (o el servidor se reinició, en cuyo caso debería manejarse con Redis)
    return NextResponse.json({ status: 'processing', message: 'Job no encontrado temporalmente o sigue en proceso' }); 
  }

  return NextResponse.json(job);
}
