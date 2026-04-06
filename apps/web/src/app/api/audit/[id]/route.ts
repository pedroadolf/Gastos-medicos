import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

/**
 * 🔍 API: GET Audit Result for a specific Tramite
 */
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { 
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      }
    }
  );

  // 🔐 Check user session (optional but recommended)
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // 1. Fetch audit results with related tramite info
  const { data: audit, error } = await supabase
    .from('audit_results')
    .select('*, tramites(*, facturas(id))')
    .eq('tramite_id', params.id)
    .single();

  if (error || !audit) {
    return NextResponse.json({ error: 'No audit found' }, { status: 404 });
  }

  const tramite = audit.tramites;

  // 🧪 Helper to build visual timeline
  const buildTimeline = () => {
    return [
      { label: 'Trámite Inicializado', status: 'done' },
      { label: 'Extracción de Datos', status: (tramite.facturas?.length > 0) ? 'done' : 'in_progress' },
      { label: 'Generación de Expediente', status: (audit.score > 0) ? 'done' : 'in_progress' },
      { label: 'Auditoría de Calidad', status: (audit.score >= 90) ? 'done' : (audit.score > 0 ? 'in_progress' : 'pending') },
      { label: 'Empaquetado Final (ZIP)', status: (tramite.url_expediente_zip) ? 'done' : 'pending' },
      { label: 'Listado para Envío', status: (tramite.status === 'ready') ? 'done' : 'pending' }
    ];
  };

  // 2. Prepare payload
  const payload = {
    id: audit.id,
    score: audit.score || 0,
    status: audit.approved ? 'approved' : (audit.score > 70 ? 'pending' : 'error'),
    issues: audit.issues || [], 
    zip_url: tramite.url_expediente_zip || null,
    timeline: buildTimeline(),
    created_at: audit.created_at
  };

  return NextResponse.json(payload);
}
