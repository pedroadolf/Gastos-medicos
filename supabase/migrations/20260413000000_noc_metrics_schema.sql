-- ==============================================================================
-- 📊 GMM - NOC COMMAND CENTER & SRE METRICS SCHEMA (V5.0 PRO)
-- Implements: Event-Driven Distributed State, Idempotency, Time Boundaries
-- ==============================================================================

-- 🛠️ 1. ENUMS EXTENDIDOS (State Machine y Constantes)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'execution_state') THEN
        CREATE TYPE execution_state AS ENUM ('queued', 'processing', 'success', 'error', 'timeout', 'retrying', 'cancelled');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'error_severity') THEN
        CREATE TYPE error_severity AS ENUM ('none', 'low', 'medium', 'high', 'critical');
    END IF;
END $$;

-- 📊 2. TABLA: WORKFLOW EXECUTIONS (Global Health & Tracking)
CREATE TABLE IF NOT EXISTS public.workflow_executions (
    -- Idempotency & Identity
    execution_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    correlation_id UUID NOT NULL, -- Generalmente el tramite_id
    idempotency_key TEXT UNIQUE NOT NULL, -- Previene duplicaciones (hash o ID origen)
    
    -- Routing & Versioning
    workflow_name TEXT NOT NULL,
    workflow_version TEXT NOT NULL DEFAULT 'v1.0',
    ai_model TEXT,
    source TEXT DEFAULT 'n8n-webhook',
    
    -- State Machine
    status execution_state DEFAULT 'queued',
    current_step TEXT DEFAULT 'init',
    error_type TEXT,
    error_severity error_severity DEFAULT 'none',
    
    -- Time Boundaries (Timeouts & SLA)
    start_time TIMESTAMPTZ DEFAULT now(),
    end_time TIMESTAMPTZ,
    timeout_at TIMESTAMPTZ, -- Límite de tiempo para detectar 'stuck'
    duration_ms INTEGER,
    
    -- Context
    input_payload JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 📊 3. TABLA: WORKFLOW STEPS (Bottleneck Analyzer & Step Latency)
CREATE TABLE IF NOT EXISTS public.workflow_steps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID NOT NULL REFERENCES public.workflow_executions(execution_id) ON DELETE CASCADE,
    step_name TEXT NOT NULL,
    status execution_state NOT NULL,
    
    start_time TIMESTAMPTZ DEFAULT now(),
    end_time TIMESTAMPTZ,
    duration_ms INTEGER,
    
    -- Contrato de evento estructurado
    event_payload JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 📊 4. TABLA: SYSTEM EVENTS (Auto-healing, Alerts, and Audits)
CREATE TABLE IF NOT EXISTS public.system_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL, -- Ejemplo: 'workflow.step.completed', 'system.retry.triggered'
    severity error_severity DEFAULT 'low',
    execution_id UUID REFERENCES public.workflow_executions(execution_id) ON DELETE SET NULL,
    
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    
    timestamp TIMESTAMPTZ DEFAULT now()
);

-- ⚡ 5. PERFORMANCE: ÍNDICES (CRÍTICO PARA GRAFANA REAL-TIME)
-- Ejecuciones
CREATE INDEX IF NOT EXISTS idx_exec_start_time ON workflow_executions(start_time DESC);
CREATE INDEX IF NOT EXISTS idx_exec_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_exec_correlation ON workflow_executions(correlation_id);
-- Pasos
CREATE INDEX IF NOT EXISTS idx_steps_execution_id ON workflow_steps(execution_id);
CREATE INDEX IF NOT EXISTS idx_steps_name ON workflow_steps(step_name);
-- Eventos
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON system_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_events_type ON system_events(event_type);

-- 🛡️ 6. SEGURIDAD (RLS) - BYPASS PARA LOS MOTORES
ALTER TABLE public.workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;

-- Allow everything for authenticated service_role (Backend / n8n)
CREATE POLICY "Service Role All Access Executions" ON public.workflow_executions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Steps" ON public.workflow_steps FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Service Role All Access Events" ON public.system_events FOR ALL USING (true) WITH CHECK (true);

-- 🔄 7. TRIGGERS (Auto Updated_At)
DO $$ 
DECLARE t text;
BEGIN
    FOR t IN (SELECT unnest(ARRAY['workflow_executions'])) 
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS trigger_update_timestamp_noc ON public.%I', t);
        EXECUTE format('CREATE TRIGGER trigger_update_timestamp_noc BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column()', t);
    END LOOP;
END $$;
