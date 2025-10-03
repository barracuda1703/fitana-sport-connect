-- Add bio column to profiles table for client bios
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;

COMMENT ON COLUMN public.profiles.bio IS 'User biography/description';
