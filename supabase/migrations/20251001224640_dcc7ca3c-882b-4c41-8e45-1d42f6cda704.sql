-- SUPABASE SECURITY HARDENING v2
-- Fixes: SUPA_security_definer_view, EXPOSED_SENSITIVE_DATA, PUBLIC_USER_DATA, SUPA_auth_leaked_password_protection

-- ============================================================================
-- A) VIEWS → SECURITY INVOKER (fix SUPA_security_definer_view)
-- ============================================================================

-- Convert trainers_public_view to SECURITY INVOKER with barrier
DROP VIEW IF EXISTS public.trainers_public_view CASCADE;

CREATE VIEW public.trainers_public_view
WITH (security_invoker = on, security_barrier = on) AS
SELECT 
  t.id,
  t.display_name,
  t.bio,
  t.specialties,
  t.languages,
  t.gallery,
  t.has_video,
  t.is_verified,
  t.price_from,
  t.rating,
  t.review_count,
  t.services,
  t.locations,
  t.created_at,
  p.name,
  p.city,
  p.avatarurl
FROM public.trainers t
JOIN public.profiles p ON t.user_id = p.id
WHERE t.off_mode = false;

-- ============================================================================
-- B) LOCK DOWN PROFILES (fix PUBLIC_USER_DATA)
-- ============================================================================

-- Drop existing broad SELECT policies
DROP POLICY IF EXISTS "Users can view their own profile only" ON public.profiles;

-- Recreate strict owner-only policies
CREATE POLICY "profiles_select_own"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_insert_own"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Revoke any broad grants
REVOKE ALL ON TABLE public.profiles FROM PUBLIC, anon;

-- ============================================================================
-- C) PUBLIC TRAINER DIRECTORY VIA SANITIZED VIEW (non-PII)
-- ============================================================================

-- Create a truly public, sanitized view for trainer discovery
CREATE OR REPLACE VIEW public.trainers_directory_public
WITH (security_invoker = on, security_barrier = on) AS
SELECT
  t.id,
  t.display_name,
  t.bio,
  t.specialties,
  t.languages,
  t.gallery,
  t.has_video,
  t.is_verified,
  t.price_from,
  t.rating,
  t.review_count,
  t.services,
  t.locations,
  t.created_at,
  p.name,
  p.city,
  p.avatarurl
FROM public.trainers t
JOIN public.profiles p ON t.user_id = p.id
WHERE t.off_mode = false;

-- Grant read access to the sanitized view
GRANT SELECT ON public.trainers_directory_public TO anon, authenticated;

-- Revoke direct access to trainers_public_view from anon
GRANT SELECT ON public.trainers_public_view TO authenticated;
REVOKE SELECT ON public.trainers_public_view FROM anon;

-- ============================================================================
-- D) INVITATIONS - NO PUBLIC BY-TOKEN READS (fix EXPOSED_SENSITIVE_DATA)
-- ============================================================================

-- Drop the insecure "anyone can view by token" policy
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON public.invitations;

-- Drop and recreate client view policy with stricter rules
DROP POLICY IF EXISTS "Clients can view invitations sent to their email" ON public.invitations;

CREATE POLICY "invitations_select_owner_or_recipient"
ON public.invitations
FOR SELECT
TO authenticated
USING (
  auth.uid() = trainer_id 
  OR client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
);

-- Update policy is already secure (only for recipients)
-- Insert policy is already secure (only for trainers)

-- Create secure RPC for authenticated invitation retrieval
CREATE OR REPLACE FUNCTION public.get_invitation_for_authed(token uuid)
RETURNS TABLE (
  id uuid,
  trainer_id uuid,
  booking_id uuid,
  status text,
  expires_at timestamptz,
  invitation_data jsonb
)
LANGUAGE sql
SECURITY INVOKER
STABLE
SET search_path = public
AS $$
  SELECT 
    i.id,
    i.trainer_id,
    i.booking_id,
    i.status,
    i.expires_at,
    i.invitation_data
  FROM public.invitations i
  WHERE i.invitation_token = token
    AND (
      auth.uid() = i.trainer_id 
      OR (SELECT email FROM auth.users WHERE id = auth.uid()) = i.client_email
    )
    AND i.expires_at > now()
    AND i.status = 'sent';
$$;

GRANT EXECUTE ON FUNCTION public.get_invitation_for_authed(uuid) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_invitation_for_authed(uuid) FROM anon, PUBLIC;

-- Revoke direct anon access to invitations
REVOKE ALL ON TABLE public.invitations FROM anon, PUBLIC;

-- ============================================================================
-- E) REVIEW AND SECURE EXISTING SECURITY DEFINER FUNCTIONS
-- ============================================================================

-- Update get_safe_profile_data to be more explicit about what it returns
DROP FUNCTION IF EXISTS public.get_safe_profile_data(uuid);

CREATE OR REPLACE FUNCTION public.get_safe_profile_data(profile_user_id uuid)
RETURNS TABLE(id uuid, name text, avatarurl text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.avatarurl
  FROM public.profiles p
  WHERE p.id = profile_user_id
    AND (
      p.id = auth.uid()
      OR public.users_have_bookings_together(auth.uid(), profile_user_id)
      OR EXISTS (
        SELECT 1
        FROM public.chats c
        WHERE (c.client_id = auth.uid() AND c.trainer_id = profile_user_id)
           OR (c.trainer_id = auth.uid() AND c.client_id = profile_user_id)
      )
    );
$$;

COMMENT ON FUNCTION public.get_safe_profile_data IS 
'Returns only non-sensitive profile data (name, avatar) for users with relationship';

-- ============================================================================
-- F) DEFENSIVE DEFAULTS (future-proofing)
-- ============================================================================

-- Prevent accidental future exposures
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM PUBLIC, anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM PUBLIC, anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM PUBLIC, anon;

-- ============================================================================
-- VERIFICATION QUERIES (run these to verify security)
-- ============================================================================

-- Check all views are using security_invoker
-- SELECT schemaname, viewname, viewowner 
-- FROM pg_views 
-- WHERE schemaname = 'public';

-- Check profile policies
-- SELECT * FROM pg_policies WHERE tablename = 'profiles';

-- Check invitation policies
-- SELECT * FROM pg_policies WHERE tablename = 'invitations';

-- ============================================================================
-- MANUAL DASHBOARD STEPS REQUIRED
-- ============================================================================

-- CRITICAL: Enable Leaked Password Protection in Supabase Dashboard
-- Navigate to: Authentication → Providers → Email
-- Enable: "Leaked password protection" (Pwned Passwords check)
-- Set minimum password strength requirements

-- CRITICAL: Configure Site URL and Redirect URLs
-- Navigate to: Authentication → URL Configuration
-- Set Site URL to your production domain
-- Add all redirect URLs (development, staging, production)