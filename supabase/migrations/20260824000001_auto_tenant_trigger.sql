-- Migration: Auto-create tenant + user record on new auth.users signup
-- This trigger runs with superuser privileges inside Postgres,
-- so it doesn't need SUPABASE_SERVICE_ROLE_KEY.

-- Function: handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant_id UUID;
  company TEXT;
BEGIN
  -- Extract company name from user metadata, or derive from email
  company := COALESCE(
    NEW.raw_user_meta_data->>'company_name',
    split_part(NEW.email, '@', 1) || '''s Business'
  );

  -- 1. Create tenant
  INSERT INTO tenants (name)
  VALUES (company)
  RETURNING id INTO new_tenant_id;

  -- 2. Create public.users record
  INSERT INTO users (id, email, tenant_id, role)
  VALUES (NEW.id, NEW.email, new_tenant_id, 'admin');

  -- 3. Set app_metadata so JWT contains tenant_id and role
  NEW.raw_app_meta_data := COALESCE(NEW.raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object('tenant_id', new_tenant_id, 'role', 'admin');

  RETURN NEW;
END;
$$;

-- Trigger: fire BEFORE INSERT on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
