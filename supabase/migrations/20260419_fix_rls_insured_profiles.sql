-- ==============================================================================
-- 🏥 GMM - FIX INSURED PROFILES (NextAuth Compatibility & RLS)
-- ==============================================================================

-- 1. Drop the foreign key constraint on auth.users since NextAuth users may not be there
DO $$ 
DECLARE 
    fk_name TEXT;
BEGIN
    SELECT constraint_name INTO fk_name
    FROM information_schema.table_constraints
    WHERE table_name = 'insured_profiles' 
      AND constraint_type = 'FOREIGN KEY'
      AND table_schema = 'public'
    LIMIT 1;
    
    IF fk_name IS NOT NULL THEN
        EXECUTE 'ALTER TABLE public.insured_profiles DROP CONSTRAINT ' || quote_ident(fk_name);
    END IF;
END $$;

-- 2. Drop the specific policies so we can reshape their conditions gracefully
DROP POLICY IF EXISTS "Users can view own insured profiles" ON public.insured_profiles;
DROP POLICY IF EXISTS "Users can insert own insured profiles" ON public.insured_profiles;
DROP POLICY IF EXISTS "Users can update own insured profiles" ON public.insured_profiles;

-- 3. Change user_id to TEXT to support NextAuth emails or identifiers
ALTER TABLE public.insured_profiles ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 4. Re-enable Server-Action / NextAuth Secure RLS Policy
-- Since direct client-side requests from a browser with NextAuth won't carry a valid Supabase JWT by default, 
-- we allow authenticated service_role requests or requests that carry a custom JWT matches.
-- In our case, the frontend uses Server Actions with the Service Key, so RLS is naturally bypassed for those.
-- This ensures the pure anon client cannot arbitrarily access other people's data.

CREATE POLICY "Allow server actions and verified requests"
ON public.insured_profiles FOR ALL
USING (
   auth.role() = 'service_role' OR auth.uid()::text = user_id
)
WITH CHECK (
   auth.role() = 'service_role' OR auth.uid()::text = user_id
);

