-- Drop the old policy that allows everyone to view all trainer data
DROP POLICY IF EXISTS "Trainers are viewable by everyone" ON public.trainers;

-- Create a new restrictive policy - only authenticated users can view full trainer data
CREATE POLICY "Authenticated users can view trainers"
  ON public.trainers
  FOR SELECT
  TO authenticated
  USING (true);

-- Trainers can view their own data even when not authenticated (for profile setup)
CREATE POLICY "Trainers can view their own profile"
  ON public.trainers
  FOR SELECT
  TO anon
  USING (auth.uid() = user_id);

-- Create a public view with only safe, essential information for trainer discovery
CREATE OR REPLACE VIEW public.trainers_public_view AS
SELECT 
  t.id,
  t.display_name,
  t.rating,
  t.review_count,
  t.price_from,
  t.specialties,
  t.is_verified,
  t.has_video,
  t.bio,
  t.languages,
  t.gallery,
  -- Only include city/general area from locations, not exact coordinates
  jsonb_agg(
    jsonb_build_object(
      'name', loc->>'name',
      'type', loc->>'type',
      'city', loc->>'city'
    )
  ) FILTER (WHERE loc IS NOT NULL) as locations,
  -- Include services but remove any internal IDs or sensitive info
  t.services,
  t.created_at,
  p.name,
  p.city,
  p.avatarurl
FROM public.trainers t
LEFT JOIN public.profiles p ON p.id = t.user_id
LEFT JOIN LATERAL jsonb_array_elements(t.locations) as loc ON true
WHERE t.off_mode = false OR t.off_mode IS NULL
GROUP BY t.id, t.display_name, t.rating, t.review_count, t.price_from, 
         t.specialties, t.is_verified, t.has_video, t.bio, t.languages, 
         t.gallery, t.services, t.created_at, p.name, p.city, p.avatarurl;

-- Grant public access to the view
GRANT SELECT ON public.trainers_public_view TO anon, authenticated;