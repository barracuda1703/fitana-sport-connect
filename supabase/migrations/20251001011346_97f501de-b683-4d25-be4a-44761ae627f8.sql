-- Drop the foreign key constraint that prevents creating bookings for non-existent clients
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_client_id_fkey;

-- Add comment explaining the client_id can be a temporary UUID
COMMENT ON COLUMN bookings.client_id IS 'References profiles.id when client exists, or temporary UUID for invited clients';