/**
 * ─── UMA Calculation Engine ──────────────────────────────────────────────────
 * Capa compartida de cálculos UMA. Usada por Server Actions y frontend.
 * NUNCA hardcodear UMA directamente en componentes — siempre usar estas funciones.
 */

/** Parámetros IMSS/INEGI para cálculo de UMA */
export const UMA_PARAMS = {
  DIAS_MES: 30.4,
  DIAS_ANIO: 364.8,
} as const;

/** Tipo que recibe la función — equivalente a una fila de `uma_config` */
export interface UMAConfig {
  year: number;
  uma_diaria: number;
  vigente_desde: string;
  fuente?: string;
}

/** Resultado calculado de una póliza (equivalente a `policies_calculadas`) */
export interface PolicyCalculada {
  id: string;
  name: string;
  numero_poliza: string;
  certificado?: string;
  contratante?: string;
  tipo_plan?: string;

  // En UMA (valores originales de BD)
  suma_asegurada_uma: number;
  deducible_uma: number;
  coaseguro_pct: number;

  // Vigencia
  vigencia_inicio: string;
  vigencia_fin: string;

  // Excesos
  excess_policy_num?: string;
  excess_deductible?: number;
  excess_coaseguro?: number;

  // Calculados
  uma_diaria: number;
  uma_year: number;
  uma_mensual: number;
  uma_anual: number;
  uma_vigente_desde?: string;
  uma_fuente?: string;
  suma_asegurada_mxn: number;
  deducible_mxn: number;
}

/**
 * Calcula todos los valores derivados de una póliza dado el valor de UMA.
 * Misma lógica que la VIEW `policies_calculadas` en Supabase.
 * Usar como fallback o para SSR cuando no hay conexión a BD.
 */
export function calcularPoliza(
  poliza: Omit<PolicyCalculada, 'uma_diaria' | 'uma_year' | 'uma_mensual' | 'uma_anual' | 'suma_asegurada_mxn' | 'deducible_mxn'>,
  uma: UMAConfig
): PolicyCalculada {
  const uma_mensual = round2(uma.uma_diaria * UMA_PARAMS.DIAS_MES);
  const uma_anual   = round2(uma.uma_diaria * UMA_PARAMS.DIAS_ANIO);

  return {
    ...poliza,
    uma_diaria:          uma.uma_diaria,
    uma_year:            uma.year,
    uma_mensual,
    uma_anual,
    uma_vigente_desde:   uma.vigente_desde,
    uma_fuente:          uma.fuente,
    suma_asegurada_mxn:  round2(poliza.suma_asegurada_uma * uma.uma_diaria),
    deducible_mxn:       round2(poliza.deducible_uma      * uma.uma_diaria),
  };
}

/** Calcula solo los valores UMA (sin póliza) */
export function calcularUMA(uma_diaria: number) {
  return {
    uma_diaria,
    uma_mensual: round2(uma_diaria * UMA_PARAMS.DIAS_MES),
    uma_anual:   round2(uma_diaria * UMA_PARAMS.DIAS_ANIO),
  };
}

/** Formatea un monto MXN con separador de miles */
export function formatMXN(amount: number): string {
  return amount.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

// ─── Fallback estático (usado si Supabase no responde) ────────────────────────
// Actualizar solo cuando el DOF publique nuevo valor.
export const UMA_FALLBACK: UMAConfig = {
  year: 2026,
  uma_diaria: 117.31,
  vigente_desde: '2026-01-01',
  fuente: 'DOF 2026-01-10 (fallback estático)',
};

export const POLIZA_FALLBACK = calcularPoliza(
  {
    id: 'fallback',
    name: 'GMM Colectiva Principal',
    numero_poliza: '2012 M0075008',
    certificado: '0000013200645',
    contratante: 'Colgate Palmolive, S.A. de C.V.',
    tipo_plan: 'MEDICALIFE EJECUTIVO',
    suma_asegurada_uma: 30298,
    deducible_uma: 2.5,
    coaseguro_pct: 10,
    vigencia_inicio: '2025-10-01',
    vigencia_fin: '2026-10-01',
    excess_policy_num: 'M172 1011',
    excess_deductible: 2_000_000,
    excess_coaseguro: 10,
  },
  UMA_FALLBACK
);
