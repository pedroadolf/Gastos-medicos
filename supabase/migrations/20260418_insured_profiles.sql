-- ==============================================================================
-- 🏥 GMM - INSURED PROFILES (Personalization & Photos)
-- ==============================================================================

-- 🛠️ 1. TABLA DE PERFILES DE ASEGURADOS
CREATE TABLE IF NOT EXISTS public.insured_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    photo_url TEXT,
    role TEXT,
    age INTEGER,
    metadata JSONB DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT unique_patient_per_user UNIQUE(user_id, patient_name)
);

-- 🛡️ 2. SEGURIDAD (RLS)
ALTER TABLE public.insured_profiles ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios solo pueden ver los perfiles asociados a su user_id
CREATE POLICY "Users can view own insured profiles"
ON public.insured_profiles FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Política: Los usuarios solo pueden insertar perfiles para su propio user_id
CREATE POLICY "Users can insert own insured profiles"
ON public.insured_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Política: Los usuarios solo pueden actualizar sus propios perfiles
CREATE POLICY "Users can update own insured profiles"
ON public.insured_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 🔄 3. AUTOMATION (TRIGGER PARA UPDATED_AT)
CREATE TRIGGER trigger_update_timestamp_insured_profiles
BEFORE UPDATE ON public.insured_profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 📊 4. INDEXING
CREATE INDEX IF NOT EXISTS idx_insured_profiles_user_id ON public.insured_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_insured_profiles_patient_name ON public.insured_profiles(patient_name);
