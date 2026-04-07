import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id
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

  // 1. Validar sesión
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  // 2. Obtener el trámite (Usamos service role para asegurar acceso si es necesario, 
  // pero RLS debería permitirlo si el usuario es dueño)
  const supabaseService = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: {} }
  )

  const { data: tramite, error } = await supabaseService
    .from('tramites')
    .select('*, siniestros(user_id)')
    .eq('id', id)
    .single()

  if (error || !tramite) {
    return NextResponse.json({ error: 'Trámite no encontrado' }, { status: 404 })
  }

  // 3. Validar propiedad (Seguridad extra)
  if (tramite.siniestros.user_id !== user.id) {
    return NextResponse.json({ error: 'No tienes permiso para acceder a este archivo' }, { status: 403 })
  }

  // 4. Validar estado y URL
  if (tramite.status !== 'completed' || !tramite.url_expediente_zip) {
    return NextResponse.json({ error: 'El expediente aún no está listo para descarga' }, { status: 400 })
  }

  // 5. Generar Signed URL si es un path de storage, o redirigir si es URL completa
  let downloadUrl = tramite.url_expediente_zip

  if (!downloadUrl.startsWith('http')) {
     // Es un path en el bucket gmm-uploads
     const { data: signedData, error: signedError } = await supabaseService
        .storage
        .from('gmm-uploads')
        .createSignedUrl(downloadUrl, 60) // 1 minuto de validez

     if (signedError) {
        console.error('Error generating signed URL:', signedError)
        return NextResponse.json({ error: 'Error al generar link de descarga' }, { status: 500 })
     }
     downloadUrl = signedData.signedUrl
  }

  // 6. Redirigir al usuario al link de descarga
  return NextResponse.redirect(downloadUrl)
}
