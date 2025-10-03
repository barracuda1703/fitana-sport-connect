-- Add columns to profiles table for storing user preferences in the cloud
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS pending_role text,
ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'pl',
ADD COLUMN IF NOT EXISTS geolocation_preference text;