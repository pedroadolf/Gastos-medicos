-- 🚨 ALERTS LOG SYSTEM (Infra & Apps)
-- Centralizes all alerts coming from Grafana/n8n/Alertmanager

CREATE TABLE IF NOT EXISTS public.alerts_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    status TEXT NOT NULL, -- e.g., 'firing', 'resolved'
    severity TEXT NOT NULL, -- e.g., 'critical', 'warning', 'info'
    payload JSONB, -- Contexto completo de Grafana
    starts_at TIMESTAMP WITH TIME ZONE,
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for performance in Dashboards
CREATE INDEX IF NOT EXISTS idx_alerts_log_status ON public.alerts_log(status);
CREATE INDEX IF NOT EXISTS idx_alerts_log_severity ON public.alerts_log(severity);
CREATE INDEX IF NOT EXISTS idx_alerts_log_created_at ON public.alerts_log(created_at DESC);

-- Enable RLS
ALTER TABLE public.alerts_log ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Unauthenticated and Authenticated can read/write alerts" 
ON public.alerts_log FOR ALL USING (true) WITH CHECK (true);

-- Enable Real-time for live Dashboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE alerts_log;
