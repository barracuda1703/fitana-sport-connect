-- Add favorite_sport column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS favorite_sport TEXT;