-- ==============================================================================
-- 🧱 GMM - ALERTS_LOG PRO (Observabilidad Estructurada - Phase 9)
-- Adds structured columns for actionable observability without breaking existing data.
-- Principle: Logging NEVER breaks the flow.
-- ==============================================================================

-- 1. Extend alerts_log with PRO columns (all nullable → zero-risk migration)
ALTER TABLE public.alerts_log
    ADD COLUMN IF NOT EXISTS execution_id  TEXT,
    ADD COLUMN IF NOT EXISTS error_type    TEXT,
    ADD COLUMN IF NOT EXISTS metadata      JSONB,
    ADD COLUMN IF NOT EXISTS duration_ms   INTEGER;

-- 2. Extend action enum to accept new event types
-- We use an ALTER CHECK approach to preserve existing data
ALTER TABLE public.alerts_log
    DROP CONSTRAINT IF EXISTS alerts_log_action_check;

ALTER TABLE public.alerts_log
    ADD CONSTRAINT alerts_log_action_check
    CHECK (action IN ('retry', 'escalate', 'circuit_open', 'circuit_close', 'error', 'success'));

-- 3. Performance indexes for Grafana time-series queries
CREATE INDEX IF NOT EXISTS idx_alerts_log_action       ON public.alerts_log(action);
CREATE INDEX IF NOT EXISTS idx_alerts_log_error_type   ON public.alerts_log(error_type);
CREATE INDEX IF NOT EXISTS idx_alerts_log_execution_id ON public.alerts_log(execution_id);

-- Composite index: The key for Grafana time-series (time + action grouping)
CREATE INDEX IF NOT EXISTS idx_alerts_log_time_action
    ON public.alerts_log(created_at DESC, action);

-- 4. Safe log function — the ONLY way n8n should write to alerts_log
-- This function NEVER raises exceptions; it degrades gracefully.
CREATE OR REPLACE FUNCTION public.safe_log_alert(
    p_tramite_id   TEXT    DEFAULT 'unknown',
    p_step         TEXT    DEFAULT 'system',
    p_action       TEXT    DEFAULT 'error',
    p_retry_attempt INT    DEFAULT 0,
    p_reason       TEXT    DEFAULT 'unknown',
    p_error_type   TEXT    DEFAULT 'unknown',
    p_execution_id TEXT    DEFAULT NULL,
    p_duration_ms  INTEGER DEFAULT NULL,
    p_metadata     JSONB   DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
    v_tramite_id UUID;
    v_action TEXT;
BEGIN
    -- Sanitize action to valid enum values
    v_action := CASE
        WHEN p_action IN ('retry', 'escalate', 'circuit_open', 'circuit_close', 'error', 'success')
        THEN p_action
        ELSE 'error'
    END;

    -- Safely parse tramite_id (TEXT → UUID or NULL)
    BEGIN
        v_tramite_id := p_tramite_id::UUID;
    EXCEPTION WHEN OTHERS THEN
        v_tramite_id := NULL;
    END;

    INSERT INTO public.alerts_log (
        tramite_id,
        step,
        action,
        retry_attempt,
        reason,
        error_type,
        execution_id,
        duration_ms,
        metadata,
        -- Required columns from original schema
        status,
        severity,
        created_at
    )
    VALUES (
        v_tramite_id,
        p_step,
        v_action,
        p_retry_attempt,
        p_reason,
        p_error_type,
        p_execution_id,
        p_duration_ms,
        COALESCE(p_metadata, jsonb_build_object(
            'source',    'n8n',
            'logged_at', now()
        )),
        -- status & severity default for RPC-sourced logs
        'firing',
        CASE v_action
            WHEN 'escalate'     THEN 'critical'
            WHEN 'circuit_open' THEN 'critical'
            WHEN 'error'        THEN 'warning'
            ELSE                     'info'
        END,
        now()
    )
    RETURNING id INTO v_id;

    RETURN v_id;

EXCEPTION WHEN OTHERS THEN
    -- Logging failed → record in system_logs instead and return NULL
    INSERT INTO public.system_logs (agent, node, status, error_type, message, metadata)
    VALUES ('n8n', p_step, 'error', 'log_failure', SQLERRM,
            jsonb_build_object('p_action', p_action, 'p_tramite_id', p_tramite_id))
    ON CONFLICT DO NOTHING;

    RETURN NULL;
END;
$$;

-- Grant execute to anon/service_role (needed from n8n via PostgREST)
GRANT EXECUTE ON FUNCTION public.safe_log_alert TO anon, authenticated, service_role;

-- 5. Analytical view for Grafana — avoids raw SQL in dashboards
CREATE OR REPLACE VIEW public.v_alerts_metrics AS
SELECT
    date_trunc('minute', created_at)                                                     AS time,
    action,
    error_type,
    step,
    COUNT(*)                                                                             AS event_count,
    AVG(duration_ms)                                                                     AS avg_duration_ms,
    COUNT(*) FILTER (WHERE action = 'escalate')                                          AS escalation_count,
    COUNT(*) FILTER (WHERE action = 'retry')                                             AS retry_count,
    COUNT(*) FILTER (WHERE action = 'circuit_open')                                      AS circuit_open_count,
    ROUND(
        COUNT(*) FILTER (WHERE action = 'escalate')::NUMERIC /
        NULLIF(COUNT(*), 0) * 100, 2
    )                                                                                    AS escalation_rate_pct
FROM public.alerts_log
GROUP BY 1, 2, 3, 4;

-- Grant SELECT on view
GRANT SELECT ON public.v_alerts_metrics TO anon, authenticated, service_role;

-- ==============================================================================
-- ✅ Migration complete.
-- New columns: execution_id, error_type, metadata, duration_ms
-- New function: safe_log_alert() — safe, idempotent, never crashes n8n
-- New view:     v_alerts_metrics — pre-aggregated for Grafana
-- ==============================================================================
