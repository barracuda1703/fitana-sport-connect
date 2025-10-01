-- Enable realtime for bookings table
ALTER PUBLICATION supabase_realtime ADD TABLE public.bookings;

-- Enable realtime for manual_blocks table
ALTER PUBLICATION supabase_realtime ADD TABLE public.manual_blocks;

-- Enable realtime for time_off table
ALTER PUBLICATION supabase_realtime ADD TABLE public.time_off;