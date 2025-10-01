-- Create secure function to get profiles for booking participants
CREATE OR REPLACE FUNCTION public.get_profiles_for_bookings(profile_ids uuid[])
RETURNS TABLE(id uuid, name text, surname text, email text, avatarurl text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.surname,
    p.email,
    p.avatarurl
  FROM public.profiles p
  WHERE p.id = ANY(profile_ids)
    AND (
      p.id = auth.uid()
      OR EXISTS (
        SELECT 1
        FROM public.bookings b
        WHERE (b.client_id = auth.uid() AND b.trainer_id = p.id)
           OR (b.trainer_id = auth.uid() AND b.client_id = p.id)
      )
    );
$$;