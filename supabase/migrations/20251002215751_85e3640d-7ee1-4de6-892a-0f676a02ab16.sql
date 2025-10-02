-- Enable Supabase Realtime for messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Ensure messages table has REPLICA IDENTITY FULL for complete row data in realtime events
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Verify realtime is enabled (no-op if already enabled)
-- This ensures postgres_changes events deliver complete row data