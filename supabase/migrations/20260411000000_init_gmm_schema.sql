-- ==============================================================================
-- 🏥 GMM - MASTER SCHEMA (Enterprise v4.5 PRO - FULL CONSOLIDATED)
-- Includes: Core Schema, AI/Vector, Automation Triggers, and Resilience Engine
-- ==============================================================================

-- 🛠️ 1. INFRAESTRUCTURA (EXTENSIONS & SCHEMAS)
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA public;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
        BEGIN
            CREATE EXTENSION vector SCHEMA public;
        EXCEPTION WHEN OTHERS THEN
            CREATE EXTENSION vector SCHEMA extensions;
        END;
    END IF;
END $$;

-- 🛠️ 2. DOMINIOS Y TIPOS (ENUMS)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tramite_type') THEN
        CREATE TYPE tramite_type AS ENUM ('reembolso', 'programacion', 'carta_pase');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'factura_tipo') THEN
        CREATE TYPE factura_tipo AS ENUM ('H', 'M', 'F', 'O');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tramite_status') THEN
        CREATE TYPE tramite_status AS ENUM ('pending', 'processing', 'audited', 'completed', 'error');
    END IF;
END $$;

-- 📊 3. TABLAS NÚCLEO (CORE SCHEMA)
CREATE TABLE IF NOT EXISTS public.siniestros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_siniestro TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    nombre_siniestro TEXT NOT NULL,
    descripcion TEXT,
    fecha_apertura TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.tramites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siniestro_id UUID REFERENCES public.siniestros(id) ON DELETE CASCADE,
    num_siniestro_ref TEXT, 
    user_id UUID NOT NULL REFERENCES auth.users(id),
    tipo tramite_type NOT NULL,
    status tramite_status DEFAULT 'pending',
    folio TEXT,
    aseguradora TEXT,
    paciente_nombre TEXT,
    n8n_execution_id TEXT,
    pdf_paths TEXT[] DEFAULT '{}',
    factura_paths TEXT[] DEFAULT '{}',
    anexo_paths TEXT[] DEFAULT '{}',
    url_expediente_zip TEXT,
    locked_at TIMESTAMPTZ,
    locked_by TEXT, 
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    last_error TEXT,
    last_error_code TEXT,
    last_error_metadata JSONB DEFAULT '{}',
    last_retry_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.facturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tramite_id UUID NOT NULL REFERENCES public.tramites(id) ON DELETE CASCADE,
    rfc_emisor TEXT,
    nombre_emisor TEXT,
    fecha_emision DATE,
    monto_total DECIMAL(14,2),
    moneda TEXT DEFAULT 'MXN',
    tipo factura_tipo DEFAULT 'O',
    uuid_xml TEXT, 
    url_pdf TEXT,
    url_xml TEXT,
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.audit_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tramite_id UUID NOT NULL REFERENCES public.tramites(id) ON DELETE CASCADE,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
    findings JSONB DEFAULT '[]', 
    recommendations TEXT,
    is_auto_fixable BOOLEAN DEFAULT false,
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_audit_per_tramite UNIQUE(tramite_id)
);

CREATE TABLE IF NOT EXISTS public.adjuntos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tramite_id UUID NOT NULL REFERENCES public.tramites(id) ON DELETE CASCADE,
    tipo_documento TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.workflow_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tramite_id UUID NOT NULL REFERENCES public.tramites(id) ON DELETE CASCADE,
    step TEXT NOT NULL, 
    status TEXT NOT NULL, 
    message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 🧠 4. AI & KNOWLEDGE BASE
CREATE TABLE IF NOT EXISTS public.gmm_kb (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category TEXT, 
    title TEXT,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    embedding vector(768),
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    context_type TEXT,
    content TEXT NOT NULL,
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ⚡ 5. INDEXING
CREATE INDEX IF NOT EXISTS idx_tramites_user_id ON public.tramites(user_id);
CREATE INDEX IF NOT EXISTS idx_workflow_logs_query ON public.workflow_logs (tramite_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gmm_kb_embedding ON public.gmm_kb USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 🛡️ 6. SEGURIDAD (RLS)
ALTER TABLE public.siniestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tramites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gmm_kb ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;

-- 🔐 7. FUNCIONES RPC
CREATE OR REPLACE FUNCTION public.lock_tramite(p_id UUID, p_owner TEXT)
RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE updated_rows INT;
BEGIN
    UPDATE public.tramites SET locked_at = now(), locked_by = p_owner, updated_at = now()
    WHERE id = p_id AND (locked_at IS NULL OR locked_at < now() - interval '10 minutes');
    GET DIAGNOSTICS updated_rows = ROW_COUNT;
    RETURN updated_rows > 0;
END; $$;

CREATE OR REPLACE FUNCTION public.unlock_tramite(p_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.tramites SET locked_at = NULL, locked_by = NULL, updated_at = now() WHERE id = p_id;
END; $$;

-- 🔄 8. AUTOMATION (TRIGGERS)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DO $$ 
DECLARE t text;
BEGIN
    FOR t IN (SELECT table_name FROM information_schema.columns WHERE column_name = 'updated_at' AND table_schema = 'public') 
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_update_timestamp ON public.%I', t);
        EXECUTE format('CREATE TRIGGER trigger_update_timestamp BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t);
    END LOOP;
END $$;

-- 🔵 9. JOBS & SYSTEM LOGS
CREATE TABLE IF NOT EXISTS public.jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id text UNIQUE, status text, current_stage text,
  created_at timestamp DEFAULT now(), updated_at timestamp DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id uuid DEFAULT gen_random_uuid(), job_id text, agent text, node text,
  workflow text, status text, error_type text, severity text, message text,
  metadata jsonb DEFAULT '{}'::jsonb, created_at timestamp DEFAULT now()
);

-- 🚨 10. RESILIENCE ENGINE (Circuit Breaker & Alerts)
CREATE TABLE IF NOT EXISTS public.system_health (
    id INTEGER PRIMARY KEY DEFAULT 1,
    circuit_state TEXT DEFAULT 'closed' CHECK (circuit_state IN ('closed', 'open', 'half_open')),
    failure_count INTEGER DEFAULT 0,
    threshold INTEGER DEFAULT 5,
    window_minutes INTEGER DEFAULT 5, cooldown_minutes INTEGER DEFAULT 15,
    window_start TIMESTAMPTZ DEFAULT now(), last_opened_at TIMESTAMPTZ, updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.system_health (id, circuit_state, threshold, window_minutes, cooldown_minutes)
VALUES (1, 'closed', 5, 5, 15) ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.alerts_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tramite_id UUID, step TEXT, status TEXT NOT NULL, severity TEXT NOT NULL,
    action TEXT CHECK (action IN ('retry', 'escalate', 'circuit_open', 'circuit_close')),
    retry_attempt INTEGER, reason TEXT, created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 🛠️ 11. SMART RPC
CREATE OR REPLACE FUNCTION public.handle_tramite_retry_pro(p_tramite_id UUID, p_max_retries INT DEFAULT 3)
RETURNS TABLE (
    res_should_retry BOOLEAN,
    res_current_retry_count INT,
    res_next_retry_at TIMESTAMPTZ,
    res_circuit_state TEXT,
    res_message TEXT
) AS $$
DECLARE
    v_retry_count INT; v_last_retry_at TIMESTAMPTZ; v_status public.tramite_status; v_error_type TEXT; v_circuit_state TEXT; v_failure_count INT; v_threshold INT; v_cooldown_minutes INT; v_last_opened_at TIMESTAMPTZ; v_backoff_interval INTERVAL;
BEGIN
    SELECT circuit_state, failure_count, threshold, cooldown_minutes, last_opened_at INTO v_circuit_state, v_failure_count, v_threshold, v_cooldown_minutes, v_last_opened_at FROM public.system_health WHERE id = 1 FOR UPDATE;
    IF v_circuit_state = 'open' AND (now() - v_last_opened_at) > (v_cooldown_minutes * INTERVAL '1 minute') THEN
        UPDATE public.system_health SET circuit_state = 'half_open', updated_at = now() WHERE id = 1;
        v_circuit_state := 'half_open';
    END IF;
    IF v_circuit_state = 'open' THEN RETURN QUERY SELECT FALSE, 0, CAST(NULL AS TIMESTAMPTZ), 'open', CAST('SISTEMA EN PROTECCIÓN: Circuit Breaker Global abierto.' AS TEXT); RETURN; END IF;
    SELECT retry_count, last_retry_at, status, error_type INTO v_retry_count, v_last_retry_at, v_status, v_error_type FROM public.tramites WHERE id = p_tramite_id FOR UPDATE;
    IF v_error_type = 'permanent' THEN RETURN QUERY SELECT FALSE, v_retry_count, v_last_retry_at, v_circuit_state, CAST('ERROR PERMANENTE: Reintento inviable.' AS TEXT); RETURN; END IF;
    IF v_status = 'processing' THEN RETURN QUERY SELECT FALSE, v_retry_count, v_last_retry_at, v_circuit_state, CAST('IDEMPOTENCIA ACTIVADA: Trámite ya en proceso.' AS TEXT); RETURN; END IF;
    IF v_retry_count >= p_max_retries THEN RETURN QUERY SELECT FALSE, v_retry_count, v_last_retry_at, v_circuit_state, CAST('VIDAS AGOTADAS: Escalando a humano.' AS TEXT); RETURN; END IF;
    v_backoff_interval := (INTERVAL '1 minute' * POWER(2, v_retry_count + 1)) + (INTERVAL '30 seconds' * RANDOM());
    IF v_last_retry_at IS NOT NULL AND (now() - v_last_retry_at) < v_backoff_interval THEN RETURN QUERY SELECT FALSE, v_retry_count, v_last_retry_at + v_backoff_interval, v_circuit_state, CAST('BACKOFF ACTIVO: Intento prematuro.' AS TEXT); RETURN; END IF;
    UPDATE public.tramites SET retry_count = v_retry_count + 1, last_retry_at = now(), status = 'processing', updated_at = now() WHERE id = p_tramite_id;
    RETURN QUERY SELECT TRUE, v_retry_count + 1, now(), v_circuit_state, CAST('REINTENTO AUTORIZADO: Motor relanzado.' AS TEXT);
END; $$ LANGUAGE plpgsql SECURITY DEFINER;
