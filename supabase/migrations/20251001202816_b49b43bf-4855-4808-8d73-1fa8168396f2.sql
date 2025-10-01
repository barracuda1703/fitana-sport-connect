-- Create a security definer function to check if two users have bookings together
CREATE OR REPLACE FUNCTION public.users_have_bookings_together(user_id_1 uuid, user_id_2 uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.bookings
    WHERE (trainer_id = user_id_1 AND client_id = user_id_2)
       OR (trainer_id = user_id_2 AND client_id = user_id_1)
  )
$$;

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create new comprehensive SELECT policy
CREATE POLICY "Users can view profiles appropriately" 
ON public.profiles 
FOR SELECT 
USING (
  -- Users can always view their own profile
  auth.uid() = id
  OR
  -- Users can view profiles of people they have bookings with
  public.users_have_bookings_together(auth.uid(), id)
);

-- Ensure other policies remain strict
-- Users should only be able to insert/update their own profiles
-- (existing policies already handle this correctly)