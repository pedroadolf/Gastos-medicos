'use server';

import { getServerSession } from 'next-auth/next';
import { authOptions } from '../api/auth/[...nextauth]/route';
import { getSupabaseService } from '@/services/supabase';
import {
  calcularPoliza,
  UMA_FALLBACK,
  POLIZA_FALLBACK,
  type PolicyCalculada,
  type UMAConfig,
} from '@/lib/uma';

/**
 * Obtiene la UMA vigente para un año dado.
 * Si no hay registro en BD, retorna el fallback estático.
 */
export async function getUMAConfig(year?: number): Promise<UMAConfig> {
  const supabase = getSupabaseService();
  const targetYear = year ?? new Date().getFullYear();

  const { data, error } = await supabase
    .from('uma_config')
    .select('year, uma_diaria, vigente_desde, fuente')
    .eq('year', targetYear)
    .single();

  if (error || !data) {
    console.warn(`[UMA] No se encontró UMA para ${targetYear}, usando fallback estático.`);
    return UMA_FALLBACK;
  }

  return {
    year: data.year,
    uma_diaria: Number(data.uma_diaria),
    vigente_desde: data.vigente_desde,
    fuente: data.fuente,
  };
}

/**
 * Obtiene todas las pólizas calculadas desde la view `policies_calculadas`.
 * Fallback: datos estáticos calculados con `lib/uma.ts`.
 */
export async function getPoliciesCalculadas(): Promise<PolicyCalculada[]> {
  const supabase = getSupabaseService();

  const { data, error } = await supabase
    .from('policies_calculadas')
    .select('*')
    .order('vigencia_inicio', { ascending: false });

  if (error || !data || data.length === 0) {
    console.warn('[Policies] View policies_calculadas no disponible, usando fallback.', error?.message);
    return [POLIZA_FALLBACK];
  }

  return data.map((row: any) => ({
    id:                  row.id,
    name:                row.name,
    numero_poliza:       row.numero_poliza,
    certificado:         row.certificado,
    contratante:         row.contratante,
    tipo_plan:           row.tipo_plan,
    suma_asegurada_uma:  Number(row.suma_asegurada_uma),
    deducible_uma:       Number(row.deducible_uma),
    coaseguro_pct:       Number(row.coaseguro_pct),
    vigencia_inicio:     row.vigencia_inicio,
    vigencia_fin:        row.vigencia_fin,
    excess_policy_num:   row.excess_policy_num,
    excess_deductible:   row.excess_deductible ? Number(row.excess_deductible) : undefined,
    excess_coaseguro:    row.excess_coaseguro  ? Number(row.excess_coaseguro)  : undefined,
    uma_diaria:          Number(row.uma_diaria),
    uma_year:            Number(row.uma_year),
    uma_mensual:         Number(row.uma_mensual),
    uma_anual:           Number(row.uma_anual),
    uma_vigente_desde:   row.uma_vigente_desde,
    uma_fuente:          row.uma_fuente,
    suma_asegurada_mxn:  Number(row.suma_asegurada_mxn),
    deducible_mxn:       Number(row.deducible_mxn),
  }));
}

/**
 * Admin: inserta o actualiza el valor de UMA para un año.
 * Requiere sesión activa. Solo inserta — nunca sobreescribe históricos de otros años.
 */
export async function upsertUMAConfig(
  year: number,
  uma_diaria: number,
  vigente_desde: string,
  fuente: string = 'DOF'
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error('No autenticado');

  // Validaciones básicas
  if (year < 2020 || year > 2100) throw new Error('Año inválido');
  if (uma_diaria <= 0 || uma_diaria > 100_000) throw new Error('UMA inválida');

  const supabase = getSupabaseService();

  const { error } = await supabase
    .from('uma_config')
    .upsert({ year, uma_diaria, vigente_desde, fuente }, { onConflict: 'year' });

  if (error) throw new Error(`Error al guardar UMA: ${error.message}`);
  return { ok: true, year, uma_diaria };
}
