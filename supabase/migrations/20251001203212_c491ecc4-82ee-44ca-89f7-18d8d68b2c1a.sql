-- Fix security linter warnings

-- Fix 1: Convert SECURITY DEFINER view to SECURITY INVOKER
-- Drop the existing view
DROP VIEW IF EXISTS public.public_trainer_profiles;

-- Recreate view with security_invoker option
CREATE VIEW public.public_trainer_profiles 
WITH (security_invoker=on)
AS
SELECT 
  p.id,
  p.name,
  p.city,
  p.avatarurl,
  p.created_at
FROM public.profiles p
WHERE p.role = 'trainer';

-- Grant access to the view
GRANT SELECT ON public.public_trainer_profiles TO authenticated, anon;

-- Fix 2: Add RLS policy to api_rate_limits table
-- This table should only be accessed via the security definer function
CREATE POLICY "Rate limits are managed by system only"
ON public.api_rate_limits
FOR ALL
USING (false)
WITH CHECK (false);