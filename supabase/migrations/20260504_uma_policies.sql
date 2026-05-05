-- =============================================================================
-- MIGRACIÓN: Sistema UMA versionado + Pólizas indexadas por UMA
-- Proyecto: GMM - Gastos Médicos Mayores
-- Fecha: 2026-05-04
-- =============================================================================

-- ─── Extensiones ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- =============================================================================
-- 1. UMA_CONFIG — Histórico versionado por año
--    ⚠️ NUNCA sobreescribir un año. Insertar uno nuevo cada enero.
-- =============================================================================
create table if not exists uma_config (
  id           uuid primary key default uuid_generate_v4(),
  year         int unique not null,
  uma_diaria   numeric(10,4) not null,
  vigente_desde date not null,
  fuente       text default 'DOF',         -- Diario Oficial de la Federación
  created_at   timestamp default now()
);

create index if not exists idx_uma_year on uma_config(year);

comment on table uma_config is
  'Valor histórico de la UMA publicada en el DOF. Un registro por año. No sobreescribir.';

-- =============================================================================
-- 2. POLICIES — Valores almacenados en UMA (nunca en pesos)
--    Esto garantiza que al cambiar la UMA, todo recalcula automáticamente.
-- =============================================================================
create table if not exists policies (
  id                  uuid primary key default uuid_generate_v4(),
  name                text not null,
  numero_poliza       text,
  certificado         text,
  contratante         text,
  tipo_plan           text,

  -- Coberturas expresadas en UMA (NO pesos)
  suma_asegurada_uma  numeric(12,4) not null,
  deducible_uma       numeric(12,4) not null,
  coaseguro_pct       numeric(5,2) not null default 10,

  -- Para calcular: usa UMA del año de vigencia_inicio
  vigencia_inicio     date not null,
  vigencia_fin        date not null,

  -- Póliza de excesos asociada (opcional)
  excess_policy_num   text,
  excess_deductible   numeric(15,2),   -- Deducible de excesos (en pesos, es fijo)
  excess_coaseguro    numeric(5,2),

  created_at          timestamp default now()
);

create index if not exists idx_policies_vigencia on policies(vigencia_inicio, vigencia_fin);

comment on table policies is
  'Pólizas con coberturas en UMA. Al unirse con uma_config, los valores MXN se calculan automáticamente.';

-- =============================================================================
-- 3. SYSTEM_CONFIG — Parámetros globales (días, reglas de cálculo)
-- =============================================================================
create table if not exists system_config (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamp default now()
);

comment on table system_config is
  'Configuración global del sistema. Cambiar aquí afecta todos los cálculos.';

-- =============================================================================
-- 4. DATOS INICIALES
-- =============================================================================

-- UMA 2026 (DOF enero 2026)
insert into uma_config (year, uma_diaria, vigente_desde, fuente)
values (2026, 117.31, '2026-01-01', 'DOF 2026-01-10')
on conflict (year) do nothing;

-- Parámetros IMSS/INEGI para cálculo de UMA mensual/anual
insert into system_config (key, value)
values (
  'uma_params',
  '{
    "dias_mes_promedio": 30.4,
    "dias_anio": 364.8
  }'::jsonb
)
on conflict (key) do nothing;

-- Póliza Principal (GMM Colectiva MetLife - Claudia Fonseca)
-- NOTA: deducible_uma = 2.5 según póliza (2.5 × $117.31 = $293.27 MXN)
insert into policies (
  name, numero_poliza, certificado, contratante, tipo_plan,
  suma_asegurada_uma, deducible_uma, coaseguro_pct,
  vigencia_inicio, vigencia_fin,
  excess_policy_num, excess_deductible, excess_coaseguro
)
values (
  'GMM Colectiva Principal',
  '2012 M0075008',
  '0000013200645',
  'Colgate Palmolive, S.A. de C.V.',
  'MEDICALIFE EJECUTIVO',
  30298.00,   -- UMA (→ $3,554,258.38 MXN con UMA 2026)
  2.50,       -- UMA (→ $293.27 MXN con UMA 2026)
  10.00,
  '2025-10-01',
  '2026-10-01',
  'M172 1011',
  2000000.00,  -- Deducible excesos en pesos (fijo, no indexado a UMA)
  10.00
)
on conflict do nothing;

-- =============================================================================
-- 5. FUNCIÓN: obtener UMA correcta por fecha de vigencia
--    ❌ NO usa "la última UMA siempre"
--    ✅ Usa la UMA correspondiente al año de inicio de la póliza
-- =============================================================================
create or replace function get_uma_by_date(input_date date)
returns numeric as $$
  select uma_diaria
  from uma_config
  where year = extract(year from input_date)::int
  limit 1;
$$ language sql stable;

-- =============================================================================
-- 6. VIEW: POLICIES_CALCULADAS
--    Frontend consume ESTA view — zero cálculos en frontend
-- =============================================================================
create or replace view policies_calculadas as
select
  p.*,

  -- UMA base de esta póliza
  u.uma_diaria,
  u.year as uma_year,
  u.vigente_desde as uma_vigente_desde,
  u.fuente as uma_fuente,

  -- Valores calculados en MXN
  round(p.suma_asegurada_uma * u.uma_diaria, 2)  as suma_asegurada_mxn,
  round(p.deducible_uma      * u.uma_diaria, 2)  as deducible_mxn,

  -- UMA mensual y anual (usando parámetros de system_config)
  round(u.uma_diaria * (sc.value->>'dias_mes_promedio')::numeric, 2) as uma_mensual,
  round(u.uma_diaria * (sc.value->>'dias_anio')::numeric,         2) as uma_anual

from policies p
join uma_config u
  on u.year = extract(year from p.vigencia_inicio)::int
join system_config sc
  on sc.key = 'uma_params';

comment on view policies_calculadas is
  'Vista calculada: pólizas con todos los valores en MXN derivados de la UMA vigente al año de inicio.';

-- =============================================================================
-- 7. Para 2027 (ejemplo de actualización anual — solo este INSERT)
-- =============================================================================
-- insert into uma_config (year, uma_diaria, vigente_desde, fuente)
-- values (2027, NUEVO_VALOR_DOF, '2027-01-01', 'DOF 2027-01-XX');
-- → Todo se recalcula automáticamente. Sin tocar código.
