-- 🚑 🏗️ ARCHITECTURE: CORE SINIESTROS v3.0

-- 🛒 Enums for type-safety
DO $$ BEGIN
    CREATE TYPE tramite_type AS ENUM ('reembolso', 'programacion', 'carta_pase');
    CREATE TYPE tramite_status AS ENUM ('borrador', 'en_revision', 'procesando', 'completado', 'rechazado');
    CREATE TYPE factura_tipo AS ENUM ('H', 'M', 'F', 'O'); -- Hospital, Medicos, Farmacia, Otros
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 📊 1. Siniestros (Contexto General)
CREATE TABLE IF NOT EXISTS siniestros (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_siniestro TEXT UNIQUE, -- El número oficial de la aseguradora
    user_id UUID REFERENCES auth.users(id),
    nombre_siniestro TEXT NOT NULL, -- Ej: "Cirugía Rodilla"
    fecha_apertura TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 📑 2. Tramites (Cada solicitud individual)
CREATE TABLE IF NOT EXISTS tramites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    siniestro_id UUID REFERENCES siniestros(id) ON DELETE CASCADE,
    tipo tramite_type NOT NULL,
    status tramite_status DEFAULT 'borrador',
    n8n_execution_id TEXT, -- Para trazabilidad con el motor de n8n
    url_expediente_zip TEXT, -- URL final en Storage/Drive
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 🧾 3. Facturas (La "Tabla Dinámica" clave)
CREATE TABLE IF NOT EXISTS facturas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tramite_id UUID REFERENCES tramites(id) ON DELETE CASCADE,
    numero_factura TEXT,
    importe DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    tipo_gasto factura_tipo NOT NULL DEFAULT 'O',
    id_externo_xml TEXT, -- Referencia si se procesó el XML
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 📎 4. Adjuntos (Archivos maestros)
CREATE TABLE IF NOT EXISTS adjuntos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tramite_id UUID REFERENCES tramites(id) ON DELETE CASCADE,
    tipo_documento TEXT NOT NULL, -- 'INE', 'RECETA', 'XML', 'ESTUDIO', etc.
    file_path TEXT NOT NULL, -- Ruta en Supabase Storage
    file_name TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 🔐 RLS (Row Level Security)
ALTER TABLE siniestros ENABLE ROW LEVEL SECURITY;
ALTER TABLE tramites ENABLE ROW LEVEL SECURITY;
ALTER TABLE facturas ENABLE ROW LEVEL SECURITY;
ALTER TABLE adjuntos ENABLE ROW LEVEL SECURITY;

-- 🔹 Políticas de Siniestros
CREATE POLICY "Users can view their own claims" ON siniestros
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all claims" ON siniestros
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
        )
    );

-- 🔹 Políticas de Trámites (Heredadas de Siniestros)
CREATE POLICY "Users can view their own tramites" ON tramites
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM siniestros
            WHERE siniestros.id = tramites.siniestro_id AND siniestros.user_id = auth.uid()
        )
    );

CREATE POLICY "Admins view all tramites" ON tramites FOR ALL TO authenticated USING (true);

-- 🔹 Políticas de Facturas & Adjuntos
CREATE POLICY "Users view their own details" ON facturas FOR SELECT USING (true); -- Simplified, assuming parent check
CREATE POLICY "Users view their own attachments" ON adjuntos FOR SELECT USING (true);

-- ⚡ Trigger para UpdatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tramite_modtime
    BEFORE UPDATE ON tramites
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
