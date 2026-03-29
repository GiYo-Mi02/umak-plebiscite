-- ============================================================
-- UMAK PLEBISCITE — ADMIN EMAILS TABLE
-- Stores whitelisted admin email addresses in the database
-- instead of hardcoding them in the frontend code.
-- ============================================================

-- Table to store admin emails
CREATE TABLE IF NOT EXISTS public.admin_emails (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.admin_emails ENABLE ROW LEVEL SECURITY;

-- Only existing admins can read the admin list
CREATE POLICY "admin_emails_select_admin"
  ON public.admin_emails FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_emails ae
      WHERE ae.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- ============================================================
-- FUNCTION: check_is_admin()
-- SECURITY DEFINER so it can read admin_emails regardless of RLS.
-- Returns TRUE if the currently authenticated user's email
-- is in the admin_emails table.
-- ============================================================
CREATE OR REPLACE FUNCTION public.check_is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.admin_emails
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_is_admin() TO authenticated;
GRANT SELECT ON public.admin_emails TO authenticated;

-- ============================================================
-- FUNCTION: is_allowed_email(p_email TEXT)
-- Checks if an email is allowed to use the platform.
-- Returns TRUE for @umak.edu.ph OR any email in admin_emails.
-- Used by the auth callback to block unauthorized domains.
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_allowed_email(p_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow all @umak.edu.ph emails
  IF p_email ILIKE '%@umak.edu.ph' THEN
    RETURN TRUE;
  END IF;

  -- Allow whitelisted admin emails
  RETURN EXISTS (
    SELECT 1 FROM public.admin_emails WHERE email = LOWER(p_email)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_allowed_email(TEXT) TO authenticated;

-- ============================================================
-- INSERT initial admin emails
-- ============================================================
INSERT INTO public.admin_emails (email) VALUES
  ('umak.studentcongress@umak.edu.ph'),
  ('ggiojoshua2006@gmail.com')
ON CONFLICT (email) DO NOTHING;
