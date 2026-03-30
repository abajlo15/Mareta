-- ============================================================================
-- Mareta Webshop - Supabase Database Setup
-- ============================================================================
-- Ovaj SQL fajl sadrži sve potrebne naredbe za inicijalizaciju baze podataka
-- za Mareta Webshop aplikaciju u Supabase.
--
-- Upute:
-- 1. Otvori Supabase Dashboard → SQL Editor
-- 2. Kopiraj i zalijepi cijeli sadržaj ovog fajla
-- 3. Pokreni SQL (Run ili Ctrl+Enter)
-- 4. Provjeri da su sve tabele, policies i triggeri uspješno kreirani
-- ============================================================================

-- ============================================================================
-- 1. EXTENSIONS
-- ============================================================================
-- Omogućava generiranje UUID-ova za primarne ključeve

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. TABELE
-- ============================================================================

-- Products table - Proizvodi u webshopu
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  images TEXT[] DEFAULT '{}',
  category TEXT,
  stock INTEGER DEFAULT 0,
  instagram_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table - Narudžbe korisnika
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'cancelled')),
  shipping_address JSONB,
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Order items table - Stavke narudžbi
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table - Dodatni korisnički podaci
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  address JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- 3. INDEKSI
-- ============================================================================
-- Optimizacija upita za brže pretraživanje

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- ============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Omogućava RLS na svim tabelama za sigurnost podataka

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. RLS POLICIES
-- ============================================================================

-- ============================================================================
-- 5.1 Products Policies
-- ============================================================================

-- Svi mogu čitati proizvode (javno dostupno)
CREATE POLICY "Products are viewable by everyone"
  ON products FOR SELECT
  USING (true);

-- Autentificirani korisnici mogu kreirati proizvode (za admin funkcionalnost)
CREATE POLICY "Authenticated users can create products"
  ON products FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Autentificirani korisnici mogu ažurirati proizvode (za admin funkcionalnost)
CREATE POLICY "Authenticated users can update products"
  ON products FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Autentificirani korisnici mogu brisati proizvode (za admin funkcionalnost)
CREATE POLICY "Authenticated users can delete products"
  ON products FOR DELETE
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- 5.2 Orders Policies
-- ============================================================================

-- Korisnici mogu vidjeti samo svoje narudžbe
CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Korisnici mogu kreirati samo svoje narudžbe
CREATE POLICY "Users can create their own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Korisnici mogu ažurirati samo svoje narudžbe
CREATE POLICY "Users can update their own orders"
  ON orders FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5.3 Order Items Policies
-- ============================================================================

-- Korisnici mogu vidjeti samo stavke iz svojih narudžbi
CREATE POLICY "Users can view items from their own orders"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Korisnici mogu kreirati stavke samo za svoje narudžbe
CREATE POLICY "Users can create items for their own orders"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================================================
-- 5.4 User Profiles Policies
-- ============================================================================

-- Korisnici mogu vidjeti samo svoj profil
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Korisnici mogu ažurirati samo svoj profil
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Korisnici mogu kreirati samo svoj profil
CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================================
-- 6. FUNKCIJE
-- ============================================================================
-- Automatsko ažuriranje updated_at timestampa

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- ============================================================================
-- 7. TRIGGERI
-- ============================================================================
-- Automatski ažuriraju updated_at polje pri svakom UPDATE operaciji

-- Ukloni postojeće triggere ako postoje (za idempotentnost)
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;

-- Kreiraj triggere
CREATE TRIGGER update_products_updated_at 
  BEFORE UPDATE ON products
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- KRAJ SETUP-A
-- ============================================================================
-- Provjeri da su sve tabele kreirane:
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- AND table_name IN ('products', 'orders', 'order_items', 'user_profiles');
--
-- Provjeri da su sve policies kreirane:
-- SELECT tablename, policyname FROM pg_policies 
-- WHERE schemaname = 'public';
-- ============================================================================




