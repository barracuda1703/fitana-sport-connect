-- Ensure RLS is enabled on invitations table
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them with explicit security
DROP POLICY IF EXISTS "Trainers can create invitations" ON public.invitations;
DROP POLICY IF EXISTS "Trainers can view their invitations" ON public.invitations;
DROP POLICY IF EXISTS "Trainers can update their invitations" ON public.invitations;

-- Recreate policies with explicit authentication and authorization checks
-- Only authenticated trainers can create invitations with their own trainer_id
CREATE POLICY "Trainers can create invitations"
ON public.invitations
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = trainer_id);

-- Only authenticated trainers can view their own invitations
CREATE POLICY "Trainers can view their invitations"
ON public.invitations
FOR SELECT
TO authenticated
USING (auth.uid() = trainer_id);

-- Only authenticated trainers can update their own invitations
CREATE POLICY "Trainers can update their invitations"
ON public.invitations
FOR UPDATE
TO authenticated
USING (auth.uid() = trainer_id)
WITH CHECK (auth.uid() = trainer_id);

-- Only authenticated trainers can delete their own invitations
CREATE POLICY "Trainers can delete their invitations"
ON public.invitations
FOR DELETE
TO authenticated
USING (auth.uid() = trainer_id);

-- Add comment documenting the security requirement
COMMENT ON TABLE public.invitations IS 'Contains sensitive client email addresses. Access is restricted to authenticated trainers who own the invitation only.';