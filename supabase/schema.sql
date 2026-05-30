-- ============================================================
-- YÜKLÜK — Supabase SQL Şeması
-- Supabase Dashboard > SQL Editor'da çalıştırın
-- ============================================================

-- Profiller
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  iban TEXT,
  rating NUMERIC DEFAULT 0,
  rating_count INT DEFAULT 0,
  total_rentals INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profil otomatik oluştur (trigger)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', 'Kullanıcı'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Ekipman kategorileri
DO $$ BEGIN
  CREATE TYPE equipment_category AS ENUM (
    'backpack', 'tent', 'sleeping_bag', 'trekking_pole',
    'headlamp', 'camp_stove', 'camp_chair', 'water_filter', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Ekipman durumu
DO $$ BEGIN
  CREATE TYPE equipment_condition AS ENUM ('new', 'like_new', 'good', 'fair');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Ekipmanlar
CREATE TABLE IF NOT EXISTS equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category equipment_category NOT NULL,
  brand TEXT,
  condition equipment_condition DEFAULT 'good',
  daily_price NUMERIC NOT NULL CHECK (daily_price > 0),
  deposit_amount NUMERIC NOT NULL CHECK (deposit_amount >= 0),
  images TEXT[] DEFAULT '{}',
  location_city TEXT NOT NULL DEFAULT 'İstanbul',
  location_district TEXT,
  is_available BOOLEAN DEFAULT TRUE,
  specs JSONB DEFAULT '{}',
  total_rentals INT DEFAULT 0,
  rating NUMERIC DEFAULT 0,
  rating_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Kiralama durumu
DO $$ BEGIN
  CREATE TYPE rental_status AS ENUM (
    'pending', 'confirmed', 'active', 'completed', 'cancelled', 'disputed'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Kiralamalar
CREATE TABLE IF NOT EXISTS rentals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES equipment(id) NOT NULL,
  renter_id UUID REFERENCES profiles(id) NOT NULL,
  owner_id UUID REFERENCES profiles(id) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INT NOT NULL,
  daily_price NUMERIC NOT NULL,
  rental_amount NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  owner_payout NUMERIC NOT NULL,
  deposit_amount NUMERIC NOT NULL,
  status rental_status DEFAULT 'pending',
  iyzico_payment_id TEXT,
  iyzico_payment_status TEXT,
  renter_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Yorumlar
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID REFERENCES rentals(id) NOT NULL,
  reviewer_id UUID REFERENCES profiles(id) NOT NULL,
  reviewed_id UUID REFERENCES profiles(id),
  equipment_id UUID REFERENCES equipment(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  type TEXT NOT NULL CHECK (type IN ('renter_to_owner', 'owner_to_renter')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Mesajlar
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rental_id UUID REFERENCES rentals(id) NOT NULL,
  sender_id UUID REFERENCES profiles(id) NOT NULL,
  receiver_id UUID REFERENCES profiles(id) NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favoriler
CREATE TABLE IF NOT EXISTS favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, equipment_id)
);

-- Müsait olmayan tarihler
CREATE TABLE IF NOT EXISTS unavailable_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  rental_id UUID REFERENCES rentals(id) ON DELETE CASCADE,
  date DATE NOT NULL
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "profiles_public_read" ON profiles FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "profiles_own_update" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "profiles_own_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "equipment_public_read" ON equipment FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "equipment_owner_insert" ON equipment FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY IF NOT EXISTS "equipment_owner_update" ON equipment FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY IF NOT EXISTS "equipment_owner_delete" ON equipment FOR DELETE USING (auth.uid() = owner_id);

ALTER TABLE rentals ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "rentals_participants_read" ON rentals FOR SELECT USING (auth.uid() = renter_id OR auth.uid() = owner_id);
CREATE POLICY IF NOT EXISTS "rentals_renter_insert" ON rentals FOR INSERT WITH CHECK (auth.uid() = renter_id);
CREATE POLICY IF NOT EXISTS "rentals_participants_update" ON rentals FOR UPDATE USING (auth.uid() = renter_id OR auth.uid() = owner_id);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "reviews_public_read" ON reviews FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "reviews_auth_insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "messages_participants" ON messages FOR ALL USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "favorites_own" ON favorites FOR ALL USING (auth.uid() = user_id);

ALTER TABLE unavailable_dates ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "unavailable_dates_public_read" ON unavailable_dates FOR SELECT USING (true);
CREATE POLICY IF NOT EXISTS "unavailable_dates_system_insert" ON unavailable_dates FOR INSERT WITH CHECK (true);

-- ============================================================
-- SEED DATA (önce gerçek bir kullanıcı oluşturun, UUID'yi aşağıya yazın)
-- ============================================================

-- INSERT INTO equipment (owner_id, title, category, brand, condition, daily_price, deposit_amount, location_city, location_district, description, images)
-- VALUES
--   ('[USER_UUID]', 'Osprey Atmos AG 65L Sırt Çantası', 'backpack', 'Osprey', 'like_new', 350, 1000, 'İstanbul', 'Kadıköy', 'Sıfır gibi durumdadır. Nefes alan sırt sistemi ile 3 sezon kullanılmış.', '{}'),
--   ('[USER_UUID]', 'MSR Hubba Hubba NX 2 Kişilik Çadır', 'tent', 'MSR', 'good', 500, 1500, 'İstanbul', 'Beşiktaş', 'Ultralight 2 kişilik çadır.', '{}'),
--   ('[USER_UUID]', 'Sea to Summit Spark SP1 Uyku Tulumu', 'sleeping_bag', 'Sea to Summit', 'like_new', 250, 750, 'İstanbul', 'Şişli', 'Yaz mevsimi uyku tulumu.', '{}'),
--   ('[USER_UUID]', 'Black Diamond Trail Pro Trekking Direkleri', 'trekking_pole', 'Black Diamond', 'good', 150, 400, 'İstanbul', 'Üsküdar', 'Karbon fiber trekking direkleri.', '{}'),
--   ('[USER_UUID]', 'MSR PocketRocket 2 Kamp Ocağı', 'camp_stove', 'MSR', 'like_new', 120, 300, 'İstanbul', 'Kadıköy', 'Ultra hafif kamp ocağı.', '{}'),
--   ('[USER_UUID]', 'Petzl Actik Core Kafa Lambası', 'headlamp', 'Petzl', 'good', 80, 200, 'İstanbul', 'Fatih', 'USB şarjlı kafa lambası.', '{}');
