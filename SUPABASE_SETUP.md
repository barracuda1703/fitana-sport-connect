# Konfiguracja Supabase dla Fitana

## 1. Utwórz projekt w Supabase

1. Przejdź do [supabase.com](https://supabase.com)
2. Zaloguj się i kliknij "New Project"
3. Wybierz organizację i utwórz nowy projekt
4. Skopiuj URL projektu i klucz API

## 2. Skonfiguruj zmienne środowiskowe

Utwórz plik `.env.local` w głównym katalogu projektu:

```env
VITE_SUPABASE_URL=twoj_url_projektu
VITE_SUPABASE_ANON_KEY=twoj_klucz_anon
```

## 3. Schemat bazy danych

Wykonaj następujące zapytania SQL w edytorze SQL Supabase:

### Tabela users
```sql
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('client', 'trainer')),
  avatar_url TEXT,
  language TEXT DEFAULT 'pl',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Polityki RLS
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Tabela trainers
```sql
CREATE TABLE trainers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  surname TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  bio TEXT NOT NULL,
  disciplines TEXT[] DEFAULT '{}',
  rating DECIMAL(3,2) DEFAULT 0.00,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  subscription_status TEXT DEFAULT 'pending' CHECK (subscription_status IN ('active', 'inactive', 'pending')),
  intro_video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE trainers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Trainers can view all" ON trainers
  FOR SELECT USING (true);

CREATE POLICY "Trainers can manage own profile" ON trainers
  FOR ALL USING (auth.uid() = user_id);
```

### Tabela clients
```sql
CREATE TABLE clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  city TEXT NOT NULL,
  sports TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view all" ON clients
  FOR SELECT USING (true);

CREATE POLICY "Clients can manage own profile" ON clients
  FOR ALL USING (auth.uid() = user_id);
```

### Tabela locations
```sql
CREATE TABLE locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  coordinates JSONB NOT NULL,
  radius INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Locations are public" ON locations
  FOR SELECT USING (true);

CREATE POLICY "Trainers can manage own locations" ON locations
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trainers 
      WHERE trainers.id = locations.trainer_id 
      AND trainers.user_id = auth.uid()
    )
  );
```

### Tabela services
```sql
CREATE TABLE services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trainer_id UUID REFERENCES trainers(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'PLN',
  duration INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('online', 'gym', 'court', 'home_visit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Services are public" ON services
  FOR SELECT USING (true);

CREATE POLICY "Trainers can manage own services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM trainers 
      WHERE trainers.id = services.trainer_id 
      AND trainers.user_id = auth.uid()
    )
  );
```

### Tabela bookings
```sql
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID REFERENCES services(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'rescheduled')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = trainer_id);

CREATE POLICY "Users can manage own bookings" ON bookings
  FOR ALL USING (auth.uid() = client_id OR auth.uid() = trainer_id);
```

### Tabela reviews
```sql
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  photos TEXT[] DEFAULT '{}',
  trainer_reply JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Reviews are public" ON reviews
  FOR SELECT USING (true);

CREATE POLICY "Users can create reviews" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "Trainers can reply to reviews" ON reviews
  FOR UPDATE USING (auth.uid() = trainer_id);
```

### Tabela chats
```sql
CREATE TABLE chats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(client_id, trainer_id)
);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chats" ON chats
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = trainer_id);

CREATE POLICY "Users can create chats" ON chats
  FOR INSERT WITH CHECK (auth.uid() = client_id OR auth.uid() = trainer_id);
```

### Tabela messages
```sql
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type TEXT DEFAULT 'text' CHECK (type IN ('text', 'image', 'file', 'video_link')),
  attachments TEXT[] DEFAULT '{}',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view chat messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chats 
      WHERE chats.id = messages.chat_id 
      AND (chats.client_id = auth.uid() OR chats.trainer_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
```

## 4. Funkcje pomocnicze

```sql
-- Funkcja do aktualizacji updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggery dla updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trainers_updated_at BEFORE UPDATE ON trainers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_locations_updated_at BEFORE UPDATE ON locations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 5. Storage buckets

W sekcji Storage utwórz następujące buckety:

1. **avatars** - dla zdjęć profilowych
2. **certificates** - dla certyfikatów trenerów
3. **chat-attachments** - dla załączników w czacie
4. **trainer-videos** - dla wideo prezentacji trenerów

## 6. Konfiguracja autentykacji

W sekcji Authentication > Settings:

1. Włącz "Enable email confirmations"
2. Skonfiguruj URL przekierowania po rejestracji
3. Włącz "Enable phone confirmations" (opcjonalnie)

## 7. Testowanie

Po skonfigurowaniu, uruchom aplikację:

```bash
npm run dev
```

Aplikacja powinna działać na `http://localhost:8080` z pełną integracją Supabase.



