-- ==============================================================================
-- 🏥 GMM - SMART RETRY ENGINE (Atomic, Proactive, Backoff)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_tramite_retry(
    p_tramite_id UUID,
    p_max_retries INT DEFAULT 3
)
RETURNS TABLE (
    should_retry BOOLEAN,
    current_retry_count INT,
    next_retry_at TIMESTAMPTZ,
    message TEXT
) AS $$
DECLARE
    v_retry_count INT;
    v_last_retry_at TIMESTAMPTZ;
    v_status public.tramite_status;
    v_backoff_interval INTERVAL;
BEGIN
    -- 1. Atomic row lock
    SELECT retry_count, last_retry_at, status 
    INTO v_retry_count, v_last_retry_at, v_status
    FROM public.tramites 
    WHERE id = p_tramite_id 
    FOR UPDATE;

    -- 2. Idempotency Check (Don't retry if already processing)
    IF v_status = 'processing' THEN
        RETURN QUERY SELECT FALSE, v_retry_count, v_last_retry_at, 'Trámite ya en procesamiento (Idempotencia).';
        RETURN;
    END IF;

    -- 3. Max Retries Check
    IF v_retry_count >= p_max_retries THEN
        RETURN QUERY SELECT FALSE, v_retry_count, v_last_retry_at, 'Límite de reintentos alcanzado (Max 3).';
        RETURN;
    END IF;

    -- 4. Progressive Backoff with Jitter
    -- Formula: 1 min * 2^(retry_count + 1) + 0..30s jitter
    -- Attempt 1 (after 1st fail): ~2 min
    -- Attempt 2 (after 2nd fail): ~4 min
    -- Attempt 3 (after 3rd fail): ~8 min
    v_backoff_interval := (INTERVAL '1 minute' * POWER(2, v_retry_count + 1)) 
                          + (INTERVAL '30 seconds' * RANDOM());

    IF v_last_retry_at IS NOT NULL AND (now() - v_last_retry_at) < v_backoff_interval THEN
        RETURN QUERY SELECT FALSE, v_retry_count, v_last_retry_at + v_backoff_interval, 'Backoff progresivo activo. Favor esperar.';
        RETURN;
    END IF;

    -- 5. Atomic Update & Lock
    UPDATE public.tramites
    SET 
        retry_count = retry_count + 1,
        last_retry_at = now(),
        status = 'processing', -- Lock the record while the retry is in progress
        updated_at = now()
    WHERE id = p_tramite_id;

    RETURN QUERY SELECT TRUE, v_retry_count + 1, now(), 'Reintento autorizado y bloqueado para ejecución.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.handle_tramite_retry IS 'Maneja la lógica atómica de reintentos con backoff progresivo y jitter para el sistema GMM.';
