-- Security fixes for profiles and invitations

-- 1. Create secure function to get limited profile data for chat participants
CREATE OR REPLACE FUNCTION public.get_limited_profile_for_chat(profile_user_id uuid)
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
    AND EXISTS (
      SELECT 1
      FROM public.chats c
      WHERE (c.client_id = auth.uid() AND c.trainer_id = profile_user_id)
         OR (c.trainer_id = auth.uid() AND c.client_id = profile_user_id)
    );
$$;

-- 2. Update profiles RLS to be more restrictive
DROP POLICY IF EXISTS "Users can view profiles appropriately" ON public.profiles;

CREATE POLICY "Users can view their own profile only"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

-- 3. Create function to get invitation status without exposing client email
CREATE OR REPLACE FUNCTION public.get_trainer_invitations()
RETURNS TABLE(
  id uuid,
  trainer_id uuid,
  client_name text,
  booking_id uuid,
  status text,
  created_at timestamptz,
  expires_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    i.id,
    i.trainer_id,
    i.client_name,
    i.booking_id,
    i.status,
    i.created_at,
    i.expires_at
  FROM public.invitations i
  WHERE i.trainer_id = auth.uid()
  ORDER BY i.created_at DESC;
$$;