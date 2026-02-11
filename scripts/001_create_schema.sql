-- =============================================
-- DataCipta Full Database Schema
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. PROFILES TABLE (extends Supabase auth.users)
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  username TEXT UNIQUE NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  points INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 2. DOCUMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL DEFAULT '',
  file_size TEXT NOT NULL DEFAULT '',
  creator TEXT NOT NULL DEFAULT '',
  co_creators TEXT[] DEFAULT '{}',
  additional_info TEXT DEFAULT '',
  document_hash TEXT NOT NULL,
  tx_hash TEXT DEFAULT '',
  block_number TEXT DEFAULT '',
  certificate_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('pending', 'verified', 'failed')),
  registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 3. TRANSACTIONS TABLE (point ledger)
-- =============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('registration', 'document', 'topup', 'adjustment', 'verification')),
  description TEXT NOT NULL DEFAULT '',
  amount INTEGER NOT NULL DEFAULT 0,
  balance_after INTEGER NOT NULL DEFAULT 0,
  reference_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 4. SYSTEM_SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 5. BANNERS TABLES (static + dynamic)
-- =============================================
CREATE TABLE IF NOT EXISTS banners_static (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  destination_url TEXT DEFAULT '',
  link_behavior TEXT NOT NULL DEFAULT 'new_tab' CHECK (link_behavior IN ('new_tab', 'same_tab')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS banners_dynamic (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  destination_url TEXT DEFAULT '',
  link_behavior TEXT NOT NULL DEFAULT 'new_tab' CHECK (link_behavior IN ('new_tab', 'same_tab')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 6. COUPONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_percent INTEGER NOT NULL DEFAULT 0 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  is_active BOOLEAN NOT NULL DEFAULT true,
  max_uses INTEGER DEFAULT NULL,
  used_count INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ DEFAULT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================
-- 7. INDEXES
-- =============================================
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_certificate_id ON documents(certificate_id);
CREATE INDEX IF NOT EXISTS idx_documents_document_hash ON documents(document_hash);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- =============================================
-- 8. DEFAULT SYSTEM SETTINGS
-- =============================================
INSERT INTO system_settings (key, value) VALUES
  ('platform_name', 'Registri Hak Cipta Polygon'),
  ('registration_bonus', '1000'),
  ('document_registration_cost', '100'),
  ('verification_cost', '10'),
  ('max_file_size_mb', '50'),
  ('point_price_idr', '1000')
ON CONFLICT (key) DO NOTHING;

-- =============================================
-- 9. ROW LEVEL SECURITY
-- =============================================

-- Profiles RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update all profiles"
  ON profiles FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Allow insert on signup"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Documents RLS
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all documents"
  ON documents FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can view document by hash for verification"
  ON documents FOR SELECT
  USING (true);

-- Transactions RLS
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions"
  ON transactions FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can insert transactions for anyone"
  ON transactions FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- System Settings RLS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read system settings"
  ON system_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can update system settings"
  ON system_settings FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Banners RLS
ALTER TABLE banners_static ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners_dynamic ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active static banners"
  ON banners_static FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage static banners"
  ON banners_static FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Anyone can view active dynamic banners"
  ON banners_dynamic FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage dynamic banners"
  ON banners_dynamic FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Coupons RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active coupons"
  ON coupons FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage coupons"
  ON coupons FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- =============================================
-- 10. TRIGGER: Auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, username, email, role, points)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username', ''),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    COALESCE((SELECT value::integer FROM system_settings WHERE key = 'registration_bonus'), 1000)
  );

  -- Create registration bonus transaction
  INSERT INTO public.transactions (user_id, type, description, amount, balance_after)
  VALUES (
    NEW.id,
    'registration',
    'Bonus pendaftaran',
    COALESCE((SELECT value::integer FROM system_settings WHERE key = 'registration_bonus'), 1000),
    COALESCE((SELECT value::integer FROM system_settings WHERE key = 'registration_bonus'), 1000)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if any
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
