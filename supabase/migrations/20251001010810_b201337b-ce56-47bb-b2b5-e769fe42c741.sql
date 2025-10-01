-- Drop old policy that only allowed clients to create bookings
DROP POLICY IF EXISTS "Clients can create bookings" ON public.bookings;

-- Create new policy that allows both clients and trainers to create bookings
CREATE POLICY "Users can create bookings" ON public.bookings
FOR INSERT 
WITH CHECK (
  (auth.uid() = client_id) OR (auth.uid() = trainer_id)
);