-- Stage 2: Conflict Prevention - Prevent double-booking at DB level

-- Function to check for booking overlaps
CREATE OR REPLACE FUNCTION public.prevent_booking_overlap()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if there's an overlapping booking for the same trainer
  IF EXISTS (
    SELECT 1 FROM public.bookings
    WHERE trainer_id = NEW.trainer_id
    AND status IN ('pending', 'confirmed')
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    AND (
      -- Check if time ranges overlap (assuming 1 hour duration)
      (NEW.scheduled_at, NEW.scheduled_at + INTERVAL '1 hour') OVERLAPS
      (scheduled_at, scheduled_at + INTERVAL '1 hour')
    )
  ) THEN
    RAISE EXCEPTION 'Booking conflict: trainer not available at this time';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for booking overlap check
DROP TRIGGER IF EXISTS booking_overlap_check ON public.bookings;
CREATE TRIGGER booking_overlap_check
  BEFORE INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_booking_overlap();