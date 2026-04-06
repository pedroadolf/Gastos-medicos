import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/**
 * 📂 GET: LISTADO DE TRÁMITES (SaaS Dashboard)
 * Provides an orchestrated view of all claims for the current user.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const filter = searchParams.get('filter') || 'all'
  const search = searchParams.get('search') || ''

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  // 🔐 Auth Session (Required)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'No autorizado' }, { status: 401 })

  // 🔎 QUERY BUILDER
  let query = supabase
    .from('tramites')
    .select(`
      *,
      audit_results!left(score, findings, status)
    `)
    .order('created_at', { ascending: false })

  // 🧹 Filtros de negocio
  if (filter === 'reembolso') query = query.eq('tipo', 'reembolso')
  if (filter === 'pendiente') query = query.eq('status', 'pending')
  if (filter === 'completado') query = query.eq('status', 'completed')
  
  if (search) {
    query = query.ilike('id', `%${search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('❌ Error fetching tramites:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }

  // 🧠 Map data to include audit_score and status directly for easier consumption
  const formatted = (data || []).map((t: any) => {
    // Get the most recent audit result score
    const auditRes = t.audit_results?.[0] || {}
    return {
      ...t,
      score: auditRes.score || 0,
      audit_status: auditRes.status || 'not_audited'
    }
  })

  return Response.json(formatted)
}
