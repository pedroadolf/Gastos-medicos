-- ==============================================================================
-- 🧪 GMM - SEED DATA (E2E Resilience Testing)
-- ==============================================================================

DO $$
DECLARE
    v_user_id UUID;
    v_siniestro_id UUID := '99999999-9999-9999-9999-999999999999';
BEGIN
    -- 1. Intentar obtener el primer usuario disponible
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No hay usuarios en auth.users. El seeding de tramites se omitirá.';
        RETURN;
    END IF;

    -- 2. Limpieza de datos de prueba previos (Idempotencia)
    DELETE FROM public.tramites WHERE id IN (
        '11111111-1111-1111-1111-111111111111',
        '22222222-2222-2222-2222-222222222222',
        '33333333-3333-3333-3333-333333333333',
        '44444444-4444-4444-4444-444444444444'
    );
    DELETE FROM public.siniestros WHERE id = v_siniestro_id;

    -- 3. Crear Siniestro de Prueba
    INSERT INTO public.siniestros (id, numero_siniestro, user_id, nombre_siniestro)
    VALUES (v_siniestro_id, 'SINI-TEST-E2E-001', v_user_id, 'PRUEBAS E2E RESILIENCIA');

    -- 4. Crear Escenarios de Fallo
    INSERT INTO public.tramites (id, siniestro_id, user_id, tipo, status, retry_count)
    VALUES 
    -- Scenario 1: First retry (0 -> 1)
    ('11111111-1111-1111-1111-111111111111', v_siniestro_id, v_user_id, 'reembolso', 'error', 0),
    -- Scenario 2: Last attempt (2 -> 3)
    ('22222222-2222-2222-2222-222222222222', v_siniestro_id, v_user_id, 'reembolso', 'error', 2),
    -- Scenario 3: Exhausted (Scale to Telegram)
    ('33333333-3333-3333-3333-333333333333', v_siniestro_id, v_user_id, 'reembolso', 'error', 3),
    -- Scenario 4: Permanent Error
    ('44444444-4444-4444-4444-444444444444', v_siniestro_id, v_user_id, 'reembolso', 'error', 0);

    RAISE NOTICE 'Seeding completado para el usuario %', v_user_id;
END $$;
