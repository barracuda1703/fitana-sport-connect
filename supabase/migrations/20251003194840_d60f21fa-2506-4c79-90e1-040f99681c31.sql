-- Enable REPLICA IDENTITY FULL for messages table to support realtime
ALTER TABLE public.messages REPLICA IDENTITY FULL;