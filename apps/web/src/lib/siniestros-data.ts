// ─────────────────────────────────────────────────────────────────────────────
// DATOS DE SINIESTROS — GRUPO ASEGURADO PASH
// Fuente: Cartas de Siniestralidad MetLife — Mayo 2026
// Póliza vigente principal: 0075008 (MEDICALIFE EJECUTIVO)
// Inciso: 4 — SRGMM (Reembolso y/o Surtimiento de Medicamentos/Gastos Médicos)
//
// ⚠️  Para agregar nuevos siniestros cuando lleguen las cartas:
//     1. Elimina el objeto `{ pendiente: true }` del asegurado correspondiente
//     2. Agrega el nuevo objeto `Siniestro` con los datos de la carta
// ─────────────────────────────────────────────────────────────────────────────

export interface Siniestro {
  numero: string;
  padecimiento: string;
  poliza: string;
  inciso: number;
  suma_asegurada: number;
  total_pagado: number;
  pendiente_carta_pase: number;
  sa_disponible: number;
  deducible_aplicado: number;
  coaseguro_pct: number;
  coaseguro_aplicado: number;
  primer_gasto?: string;
  estado: 'liquidado' | 'carta_pase' | 'revision' | 'sin_movimiento' | 'pendiente_carta';
  nota?: string;
}

export interface AseguradoGrupo {
  id: string;
  nombre: string;
  parentesco: 'Titular' | 'Cónyuge' | 'Hijo' | 'Hija';
  fecha_nac: string;
  edad: number;
  siniestros: Siniestro[];
}

// ─── Poliza vigente para referencia en el header ─────────────────────────────
export const POLIZA_VIGENTE = {
  numero: '0075008',
  nombre: 'MEDICALIFE EJECUTIVO',
  contratante: 'Colgate Palmolive, S.A. de C.V.',
  asegurado_titular: 'CLAUDIA FONSECA AGUILAR',
  inciso: 4,
  vigencia_inicio: '2025-10-01',
  vigencia_fin: '2026-10-01',
};

// ─── Datos reales extraídos de Cartas de Siniestralidad MetLife — Mayo 2026 ──
export const ASEGURADOS_GRUPO: AseguradoGrupo[] = [
  // ── 1. PEDRO ADOLFO SOTO HERNÁNDEZ ────────────────────────────────────────
  {
    id: 'pedro-soto',
    nombre: 'Pedro Adolfo Soto Hernández',
    parentesco: 'Cónyuge',
    fecha_nac: '1964-12-26',
    edad: 61,
    siniestros: [
      {
        numero: '01210200485-021',
        padecimiento: 'Enfermedad Respiratoria Aguda (COVID-19)',
        poliza: '02001-2012432',
        inciso: 4,
        suma_asegurada: 3_961_725.00,
        total_pagado: 566_195.27,
        pendiente_carta_pase: 7_772.00,
        sa_disponible: 3_387_757.73,
        deducible_aplicado: 6_602.88,
        coaseguro_pct: 10,
        coaseguro_aplicado: 54_432.74,
        estado: 'carta_pase',
      },
      {
        numero: '03230261780-013',
        padecimiento: 'Diabetes Mellitus No Insulinodependiente',
        poliza: '02001-2212432',
        inciso: 4,
        suma_asegurada: 1_651_380.00,
        total_pagado: 69_236.71,
        pendiente_carta_pase: 18_841.68,
        sa_disponible: 1_150_243.93,
        deducible_aplicado: 3_885.60,
        coaseguro_pct: 10,
        coaseguro_aplicado: 10_185.60,
        primer_gasto: '06/04/2013',
        estado: 'carta_pase',
      },
      {
        numero: '01130226402-043',
        padecimiento: 'Diabetes Mellitus No Insulinodependiente',
        poliza: '02001-1212432',
        inciso: 4,
        suma_asegurada: 1_651_380.00,
        total_pagado: 69_236.71,
        pendiente_carta_pase: 18_841.68,
        sa_disponible: 1_150_243.93,
        deducible_aplicado: 3_885.60,
        coaseguro_pct: 10,
        coaseguro_aplicado: 10_185.60,
        primer_gasto: '06/04/2013',
        estado: 'carta_pase',
        nota: 'Siniestro de póliza anterior — historial continuo',
      },
      {
        numero: '01130206536-001',
        padecimiento: 'Celulitis de los Dedos de la Mano y del Pie',
        poliza: '02001-1212432',
        inciso: 4,
        suma_asegurada: 1_651_380.00,
        total_pagado: 3_811.82,
        pendiente_carta_pase: 0,
        sa_disponible: 1_647_568.18,
        deducible_aplicado: 3_885.60,
        coaseguro_pct: 10,
        coaseguro_aplicado: 423.53,
        estado: 'liquidado',
      },
      {
        numero: '01160274067-002',
        padecimiento: 'Otros Trastornos Especificados del Metabolismo',
        poliza: '02001-1612432',
        inciso: 4,
        suma_asegurada: 1_887_357.00,
        total_pagado: 0,
        pendiente_carta_pase: 0,
        sa_disponible: 1_887_357.00,
        deducible_aplicado: 0,
        coaseguro_pct: 10,
        coaseguro_aplicado: 0,
        estado: 'revision',
        nota: 'Gastos no cubiertos — solicitada información médica adicional para determinar procedencia',
      },
      {
        numero: '01210242278-003',
        padecimiento: 'Siniestro Cancelado',
        poliza: '02001-2012432',
        inciso: 4,
        suma_asegurada: 0,
        total_pagado: 0,
        pendiente_carta_pase: 0,
        sa_disponible: 0,
        deducible_aplicado: 0,
        coaseguro_pct: 10,
        coaseguro_aplicado: 0,
        estado: 'sin_movimiento',
        nota: 'Siniestro cancelado por la aseguradora y sin pagos generados.',
      },
    ],
  },

  // ── 2. CLAUDIA FONSECA AGUILAR ─────────────────────────────────────────────
  {
    id: 'claudia-fonseca',
    nombre: 'Claudia Fonseca Aguilar',
    parentesco: 'Titular',
    fecha_nac: '1969-02-10',
    edad: 57,
    siniestros: [
      {
        numero: '02250211464-002',
        padecimiento: 'Síndrome Metabólico',
        poliza: '02001-2212432',
        inciso: 4,
        suma_asegurada: 6_307_400.00,
        total_pagado: 0,
        pendiente_carta_pase: 0,
        sa_disponible: 6_307_400.00,
        deducible_aplicado: 0,
        coaseguro_pct: 10,
        coaseguro_aplicado: 0,
        estado: 'sin_movimiento',
      },
      {
        numero: '01080246894-001',
        padecimiento: 'Parto Único Espontáneo, Presentación Cefálica de Vértice',
        poliza: '02001-0612432',
        inciso: 4,
        suma_asegurada: 10_260.00,
        total_pagado: 9_264.61,
        pendiente_carta_pase: 0,
        sa_disponible: 995.39,
        deducible_aplicado: 0,
        coaseguro_pct: 10,
        coaseguro_aplicado: 0,
        estado: 'liquidado',
      },
      {
        numero: '01080201477-003',
        padecimiento: 'Parto Único Espontáneo, Sin Otra Especificación',
        poliza: '02001-0512432',
        inciso: 4,
        suma_asegurada: 10_260.00,
        total_pagado: 10_260.00,
        pendiente_carta_pase: 0,
        sa_disponible: 0,
        deducible_aplicado: 0,
        coaseguro_pct: 0,
        coaseguro_aplicado: 0,
        estado: 'liquidado',
      },
    ],
  },

  // ── 3. EMILIO SOTO FONSECA ────────────────────────────────────────────────
  {
    id: 'emilio-soto',
    nombre: 'Emilio Soto Fonseca',
    parentesco: 'Hijo',
    fecha_nac: '2008-07-24',
    edad: 17,
    siniestros: [
      {
        numero: '03230265771-003',
        padecimiento: 'Desviación del Tabique Paranasal',
        poliza: '02001-2312432',
        inciso: 4,
        suma_asegurada: 6_307_400.00,
        total_pagado: 123_642.62,
        pendiente_carta_pase: 0,
        sa_disponible: 6_183_757.38,
        deducible_aplicado: 7_884.25,
        coaseguro_pct: 10,
        coaseguro_aplicado: 13_229.47,
        estado: 'liquidado',
      },
      {
        numero: '01140225418-005',
        padecimiento: 'Gastroenteritis',
        poliza: '02001-1312432',
        inciso: 4,
        suma_asegurada: 1_715_895.00,
        total_pagado: 45_870.19,
        pendiente_carta_pase: 0,
        sa_disponible: 1_670_024.81,
        deducible_aplicado: 6_056.10,
        coaseguro_pct: 10,
        coaseguro_aplicado: 3_707.78,
        estado: 'liquidado',
      },
      {
        numero: '01100238079-001',
        padecimiento: 'Herida de Otras Partes de la Cabeza',
        poliza: '02001-0912432',
        inciso: 4,
        suma_asegurada: 200_000.00,
        total_pagado: 7_578.07,
        pendiente_carta_pase: 0,
        sa_disponible: 192_421.93,
        deducible_aplicado: 0,
        coaseguro_pct: 10,
        coaseguro_aplicado: 0,
        estado: 'liquidado',
      },
      {
        numero: '01120232644-001',
        padecimiento: 'Herida del Labio y de la Cavidad Bucal',
        poliza: '02001-1012432',
        inciso: 4,
        suma_asegurada: 269_100.00,
        total_pagado: 2_461.46,
        pendiente_carta_pase: 0,
        sa_disponible: 266_638.54,
        deducible_aplicado: 1_869.90,
        coaseguro_pct: 10,
        coaseguro_aplicado: 273.49,
        estado: 'liquidado',
      },
      {
        numero: '02250243864-002',
        padecimiento: 'Otros Trastornos del Desarrollo y Crecimiento Óseo',
        poliza: '02001-2512432',
        inciso: 4,
        suma_asegurada: 104_212_199.00,
        total_pagado: 0,
        pendiente_carta_pase: 0,
        sa_disponible: 104_212_199.00,
        deducible_aplicado: 0,
        coaseguro_pct: 10,
        coaseguro_aplicado: 0,
        estado: 'sin_movimiento',
      },
    ],
  },

  // ── 4. PEDRO SEBASTIÁN SOTO FONSECA ──────────────────────────────────────
  {
    id: 'sebastian-soto',
    nombre: 'Pedro Sebastián Soto Fonseca',
    parentesco: 'Hijo',
    fecha_nac: '2007-09-10',
    edad: 18,
    siniestros: [
      {
        numero: '01260229762-005',
        padecimiento: 'Esguince y Desgarro — Ligamento Cruzado Anterior (Rodilla)',
        poliza: '02012-0075008',
        inciso: 4,
        suma_asegurada: 108_049_334.00,
        total_pagado: 451_554.22,
        pendiente_carta_pase: 27_053.00,
        sa_disponible: 107_570_726.78,
        deducible_aplicado: 3_566.22,
        coaseguro_pct: 10,
        coaseguro_aplicado: 0,
        estado: 'carta_pase',
      },
    ],
  },
];

// ─── Helpers de cálculo ───────────────────────────────────────────────────────

export function calcularSubtotalAsegurado(asegurado: AseguradoGrupo) {
  const siniestrosReales = asegurado.siniestros.filter(s => s.estado !== 'pendiente_carta');
  return {
    total_pagado: siniestrosReales.reduce((a, s) => a + s.total_pagado, 0),
    total_pendiente: siniestrosReales.reduce((a, s) => a + s.pendiente_carta_pase, 0),
    total_deducible: siniestrosReales.reduce((a, s) => a + s.deducible_aplicado, 0),
    total_coaseguro: siniestrosReales.reduce((a, s) => a + s.coaseguro_aplicado, 0),
    count_siniestros: siniestrosReales.length,
    count_pendientes_carta: asegurado.siniestros.filter(s => s.estado === 'pendiente_carta').length,
  };
}

export function calcularTotalGrupo() {
  return ASEGURADOS_GRUPO.reduce((acc, asegurado) => {
    const sub = calcularSubtotalAsegurado(asegurado);
    return {
      total_pagado: acc.total_pagado + sub.total_pagado,
      total_pendiente: acc.total_pendiente + sub.total_pendiente,
      total_deducible: acc.total_deducible + sub.total_deducible,
      total_coaseguro: acc.total_coaseguro + sub.total_coaseguro,
      count_siniestros: acc.count_siniestros + sub.count_siniestros,
    };
  }, { total_pagado: 0, total_pendiente: 0, total_deducible: 0, total_coaseguro: 0, count_siniestros: 0 });
}
