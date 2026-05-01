-- ==============================================================================
-- 🏥 GMM - SCHEMA PARA REEMPLAZAR CSV DE ASEGURADOS
-- ==============================================================================

-- 🛠️ 1. TABLA: asegurados_gmm (Información personal unificada)
CREATE TABLE IF NOT EXISTS public.asegurados_gmm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombres VARCHAR(100) NOT NULL,
    apellido_paterno VARCHAR(100) NOT NULL,
    apellido_materno VARCHAR(100),
    fecha_nacimiento DATE,
    rfc VARCHAR(13),
    -- El teléfono de 10 columnas se unifica aquí con validación estricta
    celular VARCHAR(10) CHECK (celular ~ '^[0-9]{10}$'),
    telefono_fijo VARCHAR(12),
    correo_electronico VARCHAR(255),
    empresa VARCHAR(255),
    estado_nacimiento VARCHAR(100),
    pais_nacimiento VARCHAR(100),
    nacionalidad VARCHAR(100),
    ocupacion VARCHAR(255),
    calle VARCHAR(255),
    no_ext VARCHAR(50),
    no_int VARCHAR(50),
    colonia VARCHAR(255),
    cp VARCHAR(10),
    municipio VARCHAR(100),
    estado VARCHAR(100),
    ciudad VARCHAR(100),
    pais VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 🛠️ 2. TABLA: siniestros_gmm (Eventos y trámites específicos)
CREATE TABLE IF NOT EXISTS public.siniestros_gmm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_siniestro VARCHAR(50) NOT NULL,
    asegurado_id UUID NOT NULL REFERENCES public.asegurados_gmm(id) ON DELETE CASCADE,
    aseguradora VARCHAR(100) DEFAULT 'MetLife Mexico SA de CV',
    poliza VARCHAR(50),
    certificado VARCHAR(50),
    tipo_poliza VARCHAR(100),
    parentesco VARCHAR(50),
    tipo_reclamacion VARCHAR(100),
    padecimiento TEXT,
    fecha_inicio_sintomas DATE,
    fecha_primer_atencion DATE,
    fecha_intervencion DATE,
    hospital VARCHAR(255),
    banco VARCHAR(100),
    -- La CLABE de 18 columnas se unifica aquí
    clabe VARCHAR(18) CHECK (clabe ~ '^[0-9]{18}$'),
    total_reclamo DECIMAL(12,2),
    motivo_solicitud TEXT,
    observaciones TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 🛠️ 3. TABLA: facturas_gmm (Gastos Múltiples)
-- Reemplaza las 30 columnas del CSV estáticas
CREATE TABLE IF NOT EXISTS public.facturas_gmm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siniestro_id UUID NOT NULL REFERENCES public.siniestros_gmm(id) ON DELETE CASCADE,
    folio_factura VARCHAR(100) NOT NULL,
    importe DECIMAL(12,2) NOT NULL,
    concepto TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 🛡️ 4. SEGURIDAD (RLS)
ALTER TABLE public.asegurados_gmm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siniestros_gmm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facturas_gmm ENABLE ROW LEVEL SECURITY;

-- Políticas temporales para acceso desde roles autenticados (n8n/admin)
CREATE POLICY "Enable all for authenticated users on asegurados_gmm"
ON public.asegurados_gmm FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users on siniestros_gmm"
ON public.siniestros_gmm FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all for authenticated users on facturas_gmm"
ON public.facturas_gmm FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 📊 5. INDEXING
CREATE INDEX IF NOT EXISTS idx_asegurados_gmm_rfc ON public.asegurados_gmm(rfc);
CREATE INDEX IF NOT EXISTS idx_siniestros_gmm_asegurado_id ON public.siniestros_gmm(asegurado_id);
CREATE INDEX IF NOT EXISTS idx_facturas_gmm_siniestro_id ON public.facturas_gmm(siniestro_id);
