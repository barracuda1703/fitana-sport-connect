-- Allow authenticated users to read public trainer profile data (avatar, name, city)
CREATE POLICY "trainers_public_data_select" ON public.profiles
FOR SELECT 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.trainers 
    WHERE trainers.user_id = profiles.id
  )
);