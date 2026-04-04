-- 🔵 JOBS (Mejorado)
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text UNIQUE,
  status text,
  current_stage text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- 🧠 ESTADO DEL SISTEMA (state machine)
CREATE TABLE IF NOT EXISTS public.agent_state (
  job_id text PRIMARY KEY,
  current_stage text,
  status text,
  retries int DEFAULT 0,
  last_error text,
  updated_at timestamp DEFAULT now()
);

-- 🔥 LOGS (CON TRACE_ID)
CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  trace_id uuid DEFAULT gen_random_uuid(),
  job_id text,

  agent text,
  node text,
  workflow text,

  status text,
  error_type text,
  severity text,

  message text,
  fingerprint text, -- 🔥 clustering

  metadata jsonb,

  created_at timestamp DEFAULT now()
);

-- 🧪 SIMULACIONES
CREATE TABLE IF NOT EXISTS public.simulation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  test_name text,
  status text,
  issues jsonb,
  score int,
  created_at timestamp DEFAULT now()
);

-- 🤖 APRENDIZAJE (Memory Agent)
CREATE TABLE IF NOT EXISTS public.error_patterns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  error_type text,
  fingerprint text,
  solution text,
  success_rate int DEFAULT 0,
  last_used timestamp
);

-- ⚙️ AUDITOR RESULTS
CREATE TABLE IF NOT EXISTS public.audit_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_name text,
  score int,
  issues jsonb,
  approved boolean,
  created_at timestamp DEFAULT now()
);

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.error_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_results ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para el Dashboard (solo lectura para usuarios autenticados)
CREATE POLICY "Dashboard Read All" ON public.system_logs FOR SELECT USING (true);
CREATE POLICY "Dashboard Read All State" ON public.agent_state FOR SELECT USING (true);
CREATE POLICY "Dashboard Read All Audit" ON public.audit_results FOR SELECT USING (true);
