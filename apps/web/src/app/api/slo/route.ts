import { NextResponse } from 'next/server';
import { getSupabaseService } from '@/services/supabase';

export async function GET() {
  const supabase = getSupabaseService();
  
  // Consultar la vista de SLO que creamos en la migración
  const { data, error } = await supabase
    .from('v_ux_slo_success_rate')
    .select('success_rate')
    .limit(1)
    .single();

  if (error) {
    // Si la vista está vacía o hay error, devolvemos 1 (estable por defecto)
    return NextResponse.json({ success_rate: 1 });
  }

  return NextResponse.json(data);
}
