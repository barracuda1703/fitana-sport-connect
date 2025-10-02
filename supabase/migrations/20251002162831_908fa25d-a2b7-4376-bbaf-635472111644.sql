-- Problem 1: Remove gallery column from trainers table
ALTER TABLE public.trainers DROP COLUMN IF EXISTS gallery CASCADE;

-- Problem 2: Update views to include avatarurl (without gallery column)
CREATE OR REPLACE VIEW public.trainers_directory_public
WITH (security_invoker = true)
AS
SELECT 
  t.id,
  t.display_name,
  t.bio,
  t.specialties,
  t.languages,
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

CREATE OR REPLACE VIEW public.trainers_public_view
WITH (security_invoker = true)
AS
SELECT 
  t.id,
  t.display_name,
  t.bio,
  t.specialties,
  t.languages,
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

-- Problem 5: Create RPC function for available slots
CREATE OR REPLACE FUNCTION public.get_trainer_available_slots(
  p_trainer_id UUID,
  p_duration_min INT DEFAULT 60,
  p_window_start TIMESTAMPTZ DEFAULT NOW(),
  p_window_end TIMESTAMPTZ DEFAULT NOW() + INTERVAL '8 weeks',
  p_timezone TEXT DEFAULT 'Europe/Warsaw'
)
RETURNS TABLE (
  slot_start TIMESTAMPTZ,
  slot_end TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_trainer_tz TEXT;
  v_current_date DATE;
  v_end_date DATE;
BEGIN
  -- Get trainer timezone from settings (fallback to parameter)
  SELECT COALESCE(settings->>'timezone', p_timezone)
  INTO v_trainer_tz
  FROM trainers
  WHERE user_id = p_trainer_id;
  
  v_trainer_tz := COALESCE(v_trainer_tz, p_timezone);
  
  -- Convert window to trainer's timezone
  v_current_date := (p_window_start AT TIME ZONE v_trainer_tz)::DATE;
  v_end_date := (p_window_end AT TIME ZONE v_trainer_tz)::DATE;
  
  RETURN QUERY
  WITH RECURSIVE dates AS (
    SELECT v_current_date AS check_date
    UNION ALL
    SELECT (check_date + INTERVAL '1 day')::DATE
    FROM dates
    WHERE check_date < v_end_date
  ),
  expanded_availability AS (
    SELECT 
      d.check_date,
      EXTRACT(DOW FROM d.check_date)::INT AS day_of_week,
      (avail_slot->>'startTime')::TIME AS start_time,
      (avail_slot->>'endTime')::TIME AS end_time
    FROM dates d
    CROSS JOIN LATERAL (
      SELECT jsonb_array_elements(availability) AS avail_slot
      FROM trainers
      WHERE user_id = p_trainer_id
    ) avail_data
    WHERE (avail_slot->>'enabled')::BOOLEAN = true
      AND (avail_slot->>'day')::INT = EXTRACT(DOW FROM d.check_date)::INT
  ),
  time_slots AS (
    SELECT 
      ea.check_date,
      ea.start_time,
      ea.end_time,
      generate_series(
        (ea.check_date + ea.start_time),
        (ea.check_date + ea.end_time - (p_duration_min || ' minutes')::INTERVAL),
        (p_duration_min || ' minutes')::INTERVAL
      ) AS slot_timestamp
    FROM expanded_availability ea
  )
  SELECT DISTINCT
    (ts.slot_timestamp AT TIME ZONE v_trainer_tz) AS slot_start,
    (ts.slot_timestamp + (p_duration_min || ' minutes')::INTERVAL AT TIME ZONE v_trainer_tz) AS slot_end
  FROM time_slots ts
  WHERE 
    (ts.slot_timestamp AT TIME ZONE v_trainer_tz) > NOW()
    AND NOT EXISTS (
      SELECT 1 FROM time_off
      WHERE trainer_id = p_trainer_id
        AND (ts.slot_timestamp AT TIME ZONE v_trainer_tz) >= start_date
        AND (ts.slot_timestamp AT TIME ZONE v_trainer_tz) < end_date
    )
    AND NOT EXISTS (
      SELECT 1 FROM bookings
      WHERE trainer_id = p_trainer_id
        AND status IN ('pending', 'confirmed', 'reschedule_pending')
        AND scheduled_at = (ts.slot_timestamp AT TIME ZONE v_trainer_tz)
    )
    AND NOT EXISTS (
      SELECT 1 FROM manual_blocks
      WHERE trainer_id = p_trainer_id
        AND date = ts.check_date
        AND ts.start_time >= start_time
        AND ts.start_time < end_time
    )
  ORDER BY slot_start
  LIMIT 50;
END;
$$;