
-- Explicitly set SECURITY INVOKER on all views to resolve scanner warning
-- This ensures views execute with the querying user's permissions, not the view creator's
-- Views don't need RLS policies - they inherit from the underlying tables

-- Recreate trainer_stats_v1 with explicit SECURITY INVOKER
CREATE OR REPLACE VIEW public.trainer_stats_v1
WITH (security_invoker = true)
AS
SELECT 
  t.user_id AS trainer_id,
  ROUND(AVG(r.rating), 1) AS rating,
  COUNT(DISTINCT r.id) AS review_count,
  COUNT(b.id) FILTER (WHERE b.status = 'completed') AS completed_trainings
FROM trainers t
LEFT JOIN reviews r ON r.trainer_id = t.user_id
LEFT JOIN bookings b ON b.trainer_id = t.user_id
GROUP BY t.user_id;

-- Recreate trainers_directory_public with explicit SECURITY INVOKER
CREATE OR REPLACE VIEW public.trainers_directory_public
WITH (security_invoker = true)
AS
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
FROM trainers t
JOIN profiles p ON t.user_id = p.id
WHERE t.off_mode = false;

-- Recreate trainers_public_view with explicit SECURITY INVOKER
CREATE OR REPLACE VIEW public.trainers_public_view
WITH (security_invoker = true)
AS
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
FROM trainers t
JOIN profiles p ON t.user_id = p.id
WHERE t.off_mode = false;

COMMENT ON VIEW public.trainer_stats_v1 IS 'Aggregate statistics for trainers - uses SECURITY INVOKER for proper RLS enforcement';
COMMENT ON VIEW public.trainers_directory_public IS 'Public directory of active trainers - uses SECURITY INVOKER for proper RLS enforcement';
COMMENT ON VIEW public.trainers_public_view IS 'Public view of active trainers - uses SECURITY INVOKER for proper RLS enforcement';
