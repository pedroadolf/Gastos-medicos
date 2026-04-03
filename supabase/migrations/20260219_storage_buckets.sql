-- Creación del bucket gmm-uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('gmm-uploads', 'gmm-uploads', false)
ON CONFLICT (id) DO NOTHING;

-- Configuracion de políticas de seguridad para el bucket de Supabase Storage (RLS)

-- 1. Permitir la inserción de archivos (subida) a usuarios autenticados
-- Puede ajustarse a TO public si la web app maneja la seguridad mediante tokens intermedios/webhooks anónimos
CREATE POLICY "Users upload own files"
ON storage.objects FOR INSERT 
TO public -- Cambiar a "authenticated" si se dispone de login estricto
WITH CHECK (bucket_id = 'gmm-uploads');

-- 2. Permitir a usuarios autenticados / anónimos leer los archivos 
-- (Necesario si el n8n o la interfaz frontend debe acceder a ver el documento posteriormente vía Signed URL)
CREATE POLICY "Users can view files"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gmm-uploads');

-- 3. Permitir eliminación si el usuario requiere borrar archivos erróneos (Opcional, según política GMM)
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO public
USING (bucket_id = 'gmm-uploads');
