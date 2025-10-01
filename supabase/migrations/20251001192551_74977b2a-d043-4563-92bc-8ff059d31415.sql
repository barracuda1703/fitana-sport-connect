-- Wyczyść wszystkie dane użytkowników i powiązane rekordy
-- UWAGA: To usunie wszystkich użytkowników i ich dane!

-- Usuń rezerwacje
DELETE FROM public.bookings;

-- Usuń wiadomości
DELETE FROM public.messages;

-- Usuń czaty
DELETE FROM public.chats;

-- Usuń zaproszenia
DELETE FROM public.invitations;

-- Usuń recenzje
DELETE FROM public.reviews;

-- Usuń bloki manualne
DELETE FROM public.manual_blocks;

-- Usuń time-off
DELETE FROM public.time_off;

-- Usuń profile trenerów
DELETE FROM public.trainers;

-- Usuń profile
DELETE FROM public.profiles;

-- Usuń użytkowników z auth (to automatycznie usunie powiązane profile przez ON DELETE CASCADE)
DELETE FROM auth.users;