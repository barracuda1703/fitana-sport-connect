-- Fix invitation token exposure vulnerability

-- Drop the insecure public SELECT policy on invitations
DROP POLICY IF EXISTS "Invitations can be validated by token only" ON public.invitations;
DROP POLICY IF EXISTS "Anyone can validate invitation tokens" ON public.invitations;

-- The accept_invitation_by_token RPC function already handles token validation securely
-- No public SELECT policy needed - all token validation goes through the RPC function only