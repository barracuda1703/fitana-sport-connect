-- Create view for real trainer statistics
CREATE OR REPLACE VIEW public.trainer_stats_v1 AS
SELECT
  t.user_id AS trainer_id,
  ROUND(AVG(r.rating)::numeric, 1) AS rating,
  COUNT(DISTINCT r.id) AS review_count,
  COUNT(b.id) FILTER (WHERE b.status = 'completed') AS completed_trainings
FROM public.trainers t
LEFT JOIN public.reviews r ON r.trainer_id = t.user_id
LEFT JOIN public.bookings b ON b.trainer_id = t.user_id
GROUP BY t.user_id;

-- Grant access to authenticated users
GRANT SELECT ON public.trainer_stats_v1 TO authenticated;
GRANT SELECT ON public.trainer_stats_v1 TO anon;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_reviews_trainer_id ON public.reviews(trainer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_trainer_id_status ON public.bookings(trainer_id, status);