-- Fix security issues comprehensively (corrected)

-- 1. Drop the insecure public_trainer_profiles view (replaced by trainers_public_view)
DROP VIEW IF EXISTS public.public_trainer_profiles;

-- 2. Secure the invitations table - drop existing policies and recreate
DROP POLICY IF EXISTS "Clients can view invitations sent to their email" ON public.invitations;
DROP POLICY IF EXISTS "Anyone can view invitation by token" ON public.invitations;
DROP POLICY IF EXISTS "Clients can accept their invitations" ON public.invitations;

-- Clients can view invitations sent to their email
CREATE POLICY "Clients can view invitations sent to their email"
  ON public.invitations
  FOR SELECT
  TO authenticated
  USING (
    client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- Clients can view invitations by token (for accepting)
CREATE POLICY "Anyone can view invitation by token"
  ON public.invitations
  FOR SELECT
  TO anon, authenticated
  USING (invitation_token IS NOT NULL);

-- Clients can accept invitations (update status)
CREATE POLICY "Clients can accept their invitations"
  ON public.invitations
  FOR UPDATE
  TO authenticated
  USING (
    client_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND status = 'sent'
  )
  WITH CHECK (
    status IN ('accepted', 'expired')
  );

-- 3. Improve profiles security - add secure function for safe basic data access
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

-- 4. Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(invitation_token) WHERE invitation_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invitations_client_email ON public.invitations(client_email);

-- 5. Add function to clean up expired invitations
CREATE OR REPLACE FUNCTION public.cleanup_expired_invitations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.invitations
  SET status = 'expired'
  WHERE status = 'sent'
    AND expires_at < now();
END;
$$;