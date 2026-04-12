-- ==============================================================================
-- 🛡️ GMM - ENTERPRISE RESILIENCE INFRASTRUCTURE (Phase 8 PRO Final)
-- ==============================================================================

-- 1. Global System Health Monitor (Circuit Breaker)
CREATE TABLE IF NOT EXISTS public.system_health (
    id INTEGER PRIMARY KEY DEFAULT 1,
    circuit_state TEXT DEFAULT 'closed' CHECK (circuit_state IN ('closed', 'open', 'half_open')),
    failure_count INTEGER DEFAULT 0,
    threshold INTEGER DEFAULT 5,
    window_minutes INTEGER DEFAULT 5,
    cooldown_minutes INTEGER DEFAULT 15,
    window_start TIMESTAMPTZ DEFAULT now(),
    last_opened_at TIMESTAMPTZ,
    last_closed_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Initialize the breaker if it doesn't exist
INSERT INTO public.system_health (id, circuit_state, threshold, window_minutes, cooldown_minutes)
VALUES (1, 'closed', 5, 5, 15)
ON CONFLICT (id) DO NOTHING;

-- 2. Enhanced Alerts Log (SRE Metrics)
CREATE TABLE IF NOT EXISTS public.alerts_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tramite_id UUID,
    step TEXT,
    action TEXT CHECK (action IN ('retry', 'escalate', 'circuit_open', 'circuit_close')),
    retry_attempt INTEGER,
    reason TEXT,
    severity TEXT DEFAULT 'info',
    payload JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. The Master Atomic Function (handle_tramite_retry_pro)
CREATE OR REPLACE FUNCTION public.handle_tramite_retry_pro(
    p_tramite_id UUID,
    p_max_retries INT DEFAULT 3
)
RETURNS TABLE (
    should_retry BOOLEAN,
    current_retry_count INT,
    next_retry_at TIMESTAMPTZ,
    circuit_state TEXT,
    message TEXT
) AS $$
DECLARE
    v_retry_count INT;
    v_last_retry_at TIMESTAMPTZ;
    v_status public.tramite_status;
    v_error_type TEXT;
    v_circuit_state TEXT;
    v_failure_count INT;
    v_threshold INT;
    v_cooldown_minutes INT;
    v_last_opened_at TIMESTAMPTZ;
    v_backoff_interval INTERVAL;
BEGIN
    -- [A] Global Circuit Breaker Check
    SELECT circuit_state, failure_count, threshold, cooldown_minutes, last_opened_at
    INTO v_circuit_state, v_failure_count, v_threshold, v_cooldown_minutes, v_last_opened_at
    FROM public.system_health 
    WHERE id = 1 
    FOR UPDATE;

    -- Auto-recovery logic (Open -> Half-Open after cooldown)
    IF v_circuit_state = 'open' AND (now() - v_last_opened_at) > (v_cooldown_minutes * INTERVAL '1 minute') THEN
        UPDATE public.system_health 
        SET circuit_state = 'half_open', updated_at = now() 
        WHERE id = 1;
        v_circuit_state := 'half_open';
    END IF;

    IF v_circuit_state = 'open' THEN
        RETURN QUERY SELECT FALSE, 0, NULL, 'open', 'SISTEMA EN PROTECCIÓN: Circuit Breaker Global abierto.';
        RETURN;
    END IF;

    -- [B] Atomic lock of the specific tramite
    SELECT retry_count, last_retry_at, status, error_type 
    INTO v_retry_count, v_last_retry_at, v_status, v_error_type
    FROM public.tramites 
    WHERE id = p_tramite_id 
    FOR UPDATE;

    -- [C] Logical Validations
    IF v_error_type = 'permanent' THEN
        RETURN QUERY SELECT FALSE, v_retry_count, v_last_retry_at, v_circuit_state, 'ERROR PERMANENTE: Reintento inviable.';
        RETURN;
    END IF;

    IF v_status = 'processing' THEN
        RETURN QUERY SELECT FALSE, v_retry_count, v_last_retry_at, v_circuit_state, 'IDEMPOTENCIA ACTIVADA: Trámite ya en proceso.';
        RETURN;
    END IF;

    IF v_retry_count >= p_max_retries THEN
        RETURN QUERY SELECT FALSE, v_retry_count, v_last_retry_at, v_circuit_state, 'VIDAS AGOTADAS: Escalando a humano.';
        RETURN;
    END IF;

    -- [D] Progressive Backoff + Jitter
    -- Final Formula: (1m * 2^retry) + (30s * jitter)
    v_backoff_interval := (INTERVAL '1 minute' * POWER(2, v_retry_count + 1)) 
                          + (INTERVAL '30 seconds' * RANDOM());

    IF v_last_retry_at IS NOT NULL AND (now() - v_last_retry_at) < v_backoff_interval THEN
        RETURN QUERY SELECT FALSE, v_retry_count, v_last_retry_at + v_backoff_interval, v_circuit_state, 'BACKOFF ACTIVO: Intento prematuro.';
        RETURN;
    END IF;

    -- [E] The Strike (Atomic Commit)
    UPDATE public.tramites
    SET 
        retry_count = v_retry_count + 1,
        last_retry_at = now(),
        status = 'processing',
        updated_at = now()
    WHERE id = p_tramite_id;

    RETURN QUERY SELECT TRUE, v_retry_count + 1, now(), v_circuit_state, 'REINTENTO AUTORIZADO: Motor relanzado.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Global Health Increment Function (Call when error occurs)
CREATE OR REPLACE FUNCTION public.increment_global_failures()
RETURNS TEXT AS $$
DECLARE
    v_failure_count INT;
    v_threshold INT;
    v_window_minutes INT;
    v_window_start TIMESTAMPTZ;
BEGIN
    SELECT failure_count, threshold, window_minutes, window_start
    INTO v_failure_count, v_threshold, v_window_minutes, v_window_start
    FROM public.system_health WHERE id = 1 FOR UPDATE;

    -- Reset window if expired
    IF (now() - v_window_start) > (v_window_minutes * INTERVAL '1 minute') THEN
        v_failure_count := 0;
        v_window_start := now();
    END IF;

    v_failure_count := v_failure_count + 1;

    IF v_failure_count >= v_threshold THEN
        UPDATE public.system_health 
        SET circuit_state = 'open', 
            last_opened_at = now(),
            failure_count = v_failure_count,
            updated_at = now()
        WHERE id = 1;
        RETURN 'circuit_opened';
    END IF;

    UPDATE public.system_health 
    SET failure_count = v_failure_count, 
        window_start = v_window_start,
        updated_at = now() 
    WHERE id = 1;
    
    RETURN 'failure_recorded';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
