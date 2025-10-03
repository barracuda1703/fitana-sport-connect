-- Create invitations table to track training invitations sent to clients
CREATE TABLE public.invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id uuid NOT NULL,
  client_email text NOT NULL,
  client_name text,
  booking_id uuid,
  status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent', 'accepted', 'expired')),
  invitation_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- Trainers can view and manage their own invitations
CREATE POLICY "Trainers can view their invitations"
ON public.invitations
FOR SELECT
USING (auth.uid() = trainer_id);

CREATE POLICY "Trainers can create invitations"
ON public.invitations
FOR INSERT
WITH CHECK (auth.uid() = trainer_id);

CREATE POLICY "Trainers can update their invitations"
ON public.invitations
FOR UPDATE
USING (auth.uid() = trainer_id);

-- Add trigger for updated_at
CREATE TRIGGER update_invitations_updated_at
BEFORE UPDATE ON public.invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();