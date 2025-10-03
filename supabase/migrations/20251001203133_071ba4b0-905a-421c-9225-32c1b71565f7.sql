-- Phase 1: Protect sensitive profile data

-- Create a view for public trainer profiles (only safe fields)
CREATE OR REPLACE VIEW public.public_trainer_profiles AS
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

-- Create a secure function to get booking partner profile (limited fields)
CREATE OR REPLACE FUNCTION public.get_booking_partner_profile(partner_id uuid)
RETURNS TABLE (
  id uuid,
  name text,
  city text,
  avatarurl text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.name,
    p.city,
    p.avatarurl
  FROM public.profiles p
  WHERE p.id = partner_id
    AND public.users_have_bookings_together(auth.uid(), partner_id);
$$;

-- Phase 2: Secure invitations with token-based system

-- Add invitation_token column for secure access
ALTER TABLE public.invitations 
ADD COLUMN IF NOT EXISTS invitation_token uuid DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT (now() + interval '7 days');

-- Create unique index on invitation_token
CREATE UNIQUE INDEX IF NOT EXISTS invitations_token_idx ON public.invitations(invitation_token);

-- Create function to accept invitation by token (public access)
CREATE OR REPLACE FUNCTION public.accept_invitation_by_token(token uuid, user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  invitation_record public.invitations;
  result jsonb;
BEGIN
  -- Get invitation by token
  SELECT * INTO invitation_record
  FROM public.invitations
  WHERE invitation_token = token
    AND status = 'sent'
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Invalid or expired invitation');
  END IF;
  
  -- Update invitation status
  UPDATE public.invitations
  SET status = 'accepted',
      updated_at = now()
  WHERE id = invitation_record.id;
  
  -- Return success with trainer info
  RETURN jsonb_build_object(
    'success', true,
    'trainer_id', invitation_record.trainer_id,
    'booking_id', invitation_record.booking_id,
    'invitation_data', invitation_record.invitation_data
  );
END;
$$;

-- Add RLS policy for public invitation token validation
CREATE POLICY "Anyone can validate invitation tokens"
ON public.invitations
FOR SELECT
USING (status = 'sent' AND expires_at > now());

-- Phase 3: Add rate limiting table for API security
CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or user ID
  endpoint text NOT NULL,
  request_count integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

CREATE INDEX IF NOT EXISTS api_rate_limits_identifier_endpoint_idx 
ON public.api_rate_limits(identifier, endpoint, window_start);

-- Enable RLS on rate limits table
ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create function to check rate limit
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  req_identifier text,
  req_endpoint text,
  max_requests integer DEFAULT 100,
  window_minutes integer DEFAULT 60
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_count integer;
  window_start_time timestamp with time zone;
BEGIN
  window_start_time := now() - (window_minutes || ' minutes')::interval;
  
  -- Clean up old entries
  DELETE FROM public.api_rate_limits
  WHERE window_start < window_start_time;
  
  -- Get current count for this identifier and endpoint
  SELECT COALESCE(SUM(request_count), 0) INTO current_count
  FROM public.api_rate_limits
  WHERE identifier = req_identifier
    AND endpoint = req_endpoint
    AND window_start >= window_start_time;
  
  -- Check if limit exceeded
  IF current_count >= max_requests THEN
    RETURN false;
  END IF;
  
  -- Insert or update rate limit record
  INSERT INTO public.api_rate_limits (identifier, endpoint, window_start)
  VALUES (req_identifier, req_endpoint, now())
  ON CONFLICT (id) DO NOTHING;
  
  RETURN true;
END;
$$;