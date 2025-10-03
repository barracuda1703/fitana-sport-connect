-- Create secure function to get reviewer profiles (for public reviews display)
CREATE OR REPLACE FUNCTION public.get_reviewer_profiles(reviewer_ids uuid[])
RETURNS TABLE(id uuid, name text, surname text, avatarurl text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.surname,
    p.avatarurl
  FROM public.profiles p
  WHERE p.id = ANY(reviewer_ids)
    AND EXISTS (
      SELECT 1
      FROM public.reviews r
      WHERE r.client_id = p.id
    );
$$;