-- ⚠️  UWAGA: To usunie WSZYSTKICH użytkowników i WSZYSTKIE dane!
-- Użyj tego TYLKO do testowania w środowisku developerskim!

-- Krok 1: Usuń dane z tabel (w kolejności - najpierw zależności)
DELETE FROM messages;
DELETE FROM chats;
DELETE FROM reviews;
DELETE FROM bookings;
DELETE FROM invitations;
DELETE FROM favorites;
DELETE FROM manual_blocks;
DELETE FROM time_off;
DELETE FROM trainers;
DELETE FROM profiles;

-- Krok 2: Wyczyść storage buckets (trzeba zrobić ręcznie w UI lub przez API)
-- - avatars
-- - chat-attachments  
-- - trainer-videos
-- - certificates

-- Krok 3: Usuń użytkowników z auth (trzeba zrobić ręcznie)
-- Idź do: Authentication → Users → zaznacz wszystkich → Delete

-- Alternatywnie, jeśli masz dostęp do service role key,
-- możesz użyć SQL (wymaga uprawnień SECURITY DEFINER):
-- SELECT auth.delete_user(id) FROM auth.users;
