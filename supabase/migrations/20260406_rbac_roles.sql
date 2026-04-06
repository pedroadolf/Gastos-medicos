-- 🔐 RBAC - Role Based Access Control
-- v1.1 - 2026-04-06

-- 1. Create Role Enum
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'operator', 'asegurado');
    END IF;
END $$;

-- 2. Create User Roles Table
-- This table maps auth.users OR emails to their respective roles.
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'asegurado',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- 3. Create a view for email-based lookups (simplifies frontend service)
CREATE OR REPLACE VIEW public.user_roles_by_email AS
SELECT email, role, user_id FROM public.user_roles;

-- 4. Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Everyone can read their own role
CREATE POLICY "Users can read own role" 
  ON public.user_roles 
  FOR SELECT 
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = email);

-- Only Admins can manage roles
CREATE POLICY "Admins can manage all roles" 
  ON public.user_roles 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Trigger to automatically sync with auth.users if available
-- NOTE: We assign 'admin' to pash.mx@gmail.com explicitly.
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, email, role)
  VALUES (
    NEW.id, 
    NEW.email,
    CASE 
      WHEN NEW.email = 'pash.mx@gmail.com' THEN 'admin'::user_role
      ELSE 'asegurado'::user_role
    END
  )
  ON CONFLICT (email) DO UPDATE SET user_id = EXCLUDED.user_id; -- Sync if already exists by email
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Pre-populate admin user
INSERT INTO public.user_roles (email, role)
VALUES ('pash.mx@gmail.com', 'admin')
ON CONFLICT (email) DO NOTHING;
