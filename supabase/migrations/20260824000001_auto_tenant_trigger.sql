-- Migration: Auto-create tenant + user record on new auth.users signup
-- Trigger runs AFTER INSERT on auth.users with superuser security definer privileges.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant_id UUID;
  company TEXT;
  base_slug TEXT;
  final_slug TEXT;
BEGIN
  -- 1. Extract or generate company name
  company := COALESCE(
    NULLIF(TRIM(NEW.raw_user_meta_data->>'company_name'), ''),
    split_part(NEW.email, '@', 1) || '''s Business'
  );

  -- 2. Generate a clean URL-friendly unique slug for the tenant
  base_slug := lower(regexp_replace(company, '[^a-zA-Z0-9]+', '-', 'g'));
  base_slug := trim(both '-' from base_slug);
  IF base_slug = '' THEN
    base_slug := 'tenant';
  END IF;
  final_slug := base_slug || '-' || substring(replace(gen_random_uuid()::text, '-', ''), 1, 8);

  -- 3. Create the Tenant (including required NOT NULL slug and default track)
  INSERT INTO public.tenants (name, slug, track)
  VALUES (company, final_slug, 'trades')
  RETURNING id INTO new_tenant_id;

  -- 4. Create the public.users mapping record
  INSERT INTO public.users (id, tenant_id, role, display_name, is_active)
  VALUES (
    NEW.id,
    new_tenant_id,
    'admin',
    company,
    true
  );

  -- 5. Update auth.users app_metadata with tenant_id and role for JWT claims
  UPDATE auth.users
  SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) ||
    jsonb_build_object('tenant_id', new_tenant_id, 'role', 'admin')
  WHERE id = NEW.id;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log error if any and re-raise so GoTrue reports the exact issue
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RAISE;
END;
$$;

-- Trigger: fire AFTER INSERT on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
