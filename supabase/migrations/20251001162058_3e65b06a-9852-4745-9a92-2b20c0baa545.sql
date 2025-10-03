-- Add off_mode field to trainers table
ALTER TABLE public.trainers 
ADD COLUMN off_mode boolean DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.trainers.off_mode IS 'Quick toggle for trainers to temporarily disable their availability in urgent cases';