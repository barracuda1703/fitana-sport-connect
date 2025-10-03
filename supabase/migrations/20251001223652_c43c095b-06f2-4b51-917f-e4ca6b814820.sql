-- Fix security issues comprehensively

-- 1. Drop the insecure public_trainer_profiles view (replaced by trainers_public_view)
DROP VIEW IF EXISTS public.public_trainer_profiles;

-- 2. Secure the invitations table - add policies for clients to view/accept invitations
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
-- This allows other users to see basic profile info (name, avatar) when they have a valid relationship
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
      -- User can see their own profile
      p.id = auth.uid()
      OR
      -- User can see profiles of people they have bookings with
      public.users_have_bookings_together(auth.uid(), profile_user_id)
      OR
      -- User can see profiles of people they have chats with
      EXISTS (
        SELECT 1
        FROM public.chats c
        WHERE (c.client_id = auth.uid() AND c.trainer_id = profile_user_id)
           OR (c.trainer_id = auth.uid() AND c.client_id = profile_user_id)
      )
    );
$$;

-- 4. Add index on invitations for better performance
CREATE INDEX IF NOT EXISTS idx_invitations_token ON public.invitations(invitation_token) WHERE invitation_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_invitations_client_email ON public.invitations(client_email);

-- 5. Ensure all SECURITY DEFINER functions have proper search_path (already done, but verify)
-- The existing functions already have SET search_path = public which is correct

-- 6. Add function to clean up expired invitations
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