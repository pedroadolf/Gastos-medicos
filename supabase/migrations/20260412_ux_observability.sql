-- ==============================================================================
-- 🔔 GMM - FASE 10 UX MASTERY (Notificaciones y Logs PRO)
-- Normalización de logs para Grafana y Sistema de Notificaciones Real-Time
-- ==============================================================================

-- 1. Normalización del Log (Agregar payload y trace_id sugeridos)
ALTER TABLE public.alerts_log
    ADD COLUMN IF NOT EXISTS payload   JSONB DEFAULT '{}'::jsonb,
    ADD COLUMN IF NOT EXISTS trace_id  TEXT,
    ADD COLUMN IF NOT EXISTS service   TEXT DEFAULT 'n8n';

-- Re-crear safe_log_alert para aceptar formato JSON universal (JSON estruturado como pidió el Senior)
CREATE OR REPLACE FUNCTION public.safe_log_alert_json(
    p_log_data JSONB
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_id UUID;
    v_level TEXT;
    v_action TEXT;
    v_message TEXT;
BEGIN
    v_level := COALESCE(p_log_data->>'level', 'error');
    v_action := COALESCE(p_log_data->>'event', 'unknown_event');
    v_message := COALESCE(p_log_data->>'message', '');

    INSERT INTO public.alerts_log (
        title,
        tramite_id,
        step,
        action,
        error_type,
        execution_id,
        trace_id,
        service,
        duration_ms,
        metadata,
        payload,
        status,
        severity,
        reason,
        created_at
    )
    VALUES (
        COALESCE(p_log_data->>'title', 'GMM Alert: ' || upper(v_action)),
        (p_log_data->>'tramite_id')::UUID,
        COALESCE(p_log_data->>'step', 'system'),
        CASE WHEN v_action IN ('retry', 'escalate', 'circuit_open', 'circuit_close', 'error', 'success') THEN v_action ELSE 'error' END,
        COALESCE(p_log_data->>'error_code', 'unknown'),
        p_log_data->>'execution_id',
        COALESCE(p_log_data->>'trace_id', gen_random_uuid()::text),
        COALESCE(p_log_data->>'service', 'n8n'),
        (p_log_data->>'latency_ms')::INTEGER,
        COALESCE(p_log_data->'metadata', '{}'::jsonb),
        COALESCE(p_log_data->'payload', '{}'::jsonb),
        'firing',
        CASE WHEN v_level = 'error' THEN 'warning' ELSE 'info' END,
        v_message,
        now()
    )
    RETURNING id INTO v_id;

    RETURN v_id;
EXCEPTION WHEN OTHERS THEN
    RETURN NULL;
END;
$$;

GRANT EXECUTE ON FUNCTION public.safe_log_alert_json TO anon, authenticated, service_role;


-- 2. Sistema de Notificaciones (La Campana)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT, -- Puede ser auth.uid() u otro id
    tramite_id UUID REFERENCES public.tramites(id) ON DELETE CASCADE,
    type TEXT CHECK (type IN ('success', 'warning', 'error', 'info')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index para vistas rápidas del panel de notificaciones
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- Habilitar Realtime para notificaciones
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- 3. Auto-Remediación UX: Trigger de Log a Notificación
CREATE OR REPLACE FUNCTION public.on_critical_error_notify()
RETURNS TRIGGER AS $$
BEGIN
    -- Solo notificar errores críticos/escalados a UX
    IF NEW.severity = 'critical' OR NEW.action = 'escalate' THEN
        INSERT INTO public.notifications (
            user_id,
            tramite_id,
            type,
            title,
            message,
            metadata
        )
        VALUES (
            -- Asumimos que podemos rastrear el usuario a través del tramite
            (SELECT user_id FROM public.tramites WHERE id = NEW.tramite_id LIMIT 1),
            NEW.tramite_id,
            'error',
            'Algo falló en tu trámite',
            'Lo estamos revisando automáticamente. Puedes intentar de nuevo más tarde.',
            jsonb_build_object('log_id', NEW.id, 'step', NEW.step)
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_critical_error_notify ON public.alerts_log;
CREATE TRIGGER trigger_critical_error_notify
    AFTER INSERT ON public.alerts_log
    FOR EACH ROW
    EXECUTE FUNCTION public.on_critical_error_notify();

-- ==============================================================================
-- 📈 4. VISTAS ANALÍTICAS PARA GRAFANA (UX SLOs)
-- Convirtiendo datos de notificaciones en KPIs de negocio y percepción de usuario
-- ==============================================================================

-- Panel 1: Success Rate (SLI = Tasa de éxito percibido)
-- ¿A cuántos usuarios NO les falló el sistema en el último periodo?
CREATE OR REPLACE VIEW public.v_ux_slo_success_rate AS
SELECT 
    date_trunc('minute', created_at) AS time,
    1 - (
        COUNT(*) FILTER (WHERE type = 'error')::FLOAT 
        / 
        NULLIF(COUNT(*), 0)
    ) AS success_rate
FROM public.notifications
GROUP BY time
ORDER BY time DESC;

-- Panel 2: UX Degradation Alerts (Tasa de error en los últimos 5 mins > 5%)
CREATE OR REPLACE VIEW public.v_ux_alerts_active AS
SELECT 
    (
        COUNT(*) FILTER (WHERE type = 'error')::FLOAT 
        / 
        NULLIF(COUNT(*), 0)
    ) AS error_rate,
    COUNT(*) as total_events
FROM public.notifications
WHERE created_at > now() - interval '5 minutes';

-- Panel 3: Top Workflows Rotos (Priorización de deuda técnica)
CREATE OR REPLACE VIEW public.v_ux_top_broken_workflows AS
SELECT 
    COALESCE(metadata->>'workflow_id', 'unknown_workflow') AS workflow,
    COUNT(*) FILTER (WHERE type = 'error') AS frontend_ux_errors
FROM public.notifications
GROUP BY workflow
ORDER BY frontend_ux_errors DESC
LIMIT 10;

-- Permitir lectura de las vistas
GRANT SELECT ON public.v_ux_slo_success_rate TO anon, authenticated, service_role;
GRANT SELECT ON public.v_ux_alerts_active TO anon, authenticated, service_role;
GRANT SELECT ON public.v_ux_top_broken_workflows TO anon, authenticated, service_role;

