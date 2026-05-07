-- ==============================================================================
-- MIGRACIÓN: Agregar columnas financieras para orquestación MCP (Fase 3A)
-- Fecha: 2026-05-07
-- ==============================================================================

-- 1. Agregar el vínculo de póliza a siniestros para relacionarlos con policies
ALTER TABLE public.siniestros ADD COLUMN IF NOT EXISTS numero_poliza TEXT;

-- Popular datos previos si existe siniestros_gmm (Opcional pero recomendado si hay datos legacy)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'siniestros_gmm') THEN
        UPDATE public.siniestros s
        SET numero_poliza = sg.poliza
        FROM public.siniestros_gmm sg
        WHERE s.numero_siniestro = sg.numero_siniestro AND s.numero_poliza IS NULL;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_siniestros_numero_poliza ON public.siniestros(numero_poliza);


-- 2. Agregar columnas de resolución granular a facturas
ALTER TABLE public.facturas ADD COLUMN IF NOT EXISTS monto_reembolsado DECIMAL(14,2);
ALTER TABLE public.facturas ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pendiente';


-- 3. Agregar total consolidado a tramites
ALTER TABLE public.tramites ADD COLUMN IF NOT EXISTS monto_total_aprobado DECIMAL(14,2);
