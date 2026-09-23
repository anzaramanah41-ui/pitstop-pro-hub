-- ============================================================================
-- APPBENK: SETUP & FIX WORKSHOP PAYMENT ACCOUNTS (QRIS & BANK TRANSFER)
-- Jalankan script SQL ini di Supabase Dashboard -> SQL Editor -> Run
-- ============================================================================

-- 1. Buat tabel public.workshop_payment_accounts jika belum ada
CREATE TABLE IF NOT EXISTS public.workshop_payment_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id text NOT NULL DEFAULT 'bengkel-001',
  id_bengkel text DEFAULT 'bengkel-001',
  account_type text NOT NULL DEFAULT 'bank_transfer',
  provider text NOT NULL DEFAULT 'MANUAL',
  provider_account_id text DEFAULT 'manual',
  bank_name text,
  account_number text,
  account_holder_name text,
  qr_image_url text,
  display_name text,
  is_active boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Pastikan seluruh kolom tersedia jika tabel sudah ada dari migrasi parsial
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workshop_payment_accounts' AND column_name = 'account_type') THEN
    ALTER TABLE public.workshop_payment_accounts ADD COLUMN account_type text NOT NULL DEFAULT 'bank_transfer';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workshop_payment_accounts' AND column_name = 'id_bengkel') THEN
    ALTER TABLE public.workshop_payment_accounts ADD COLUMN id_bengkel text DEFAULT 'bengkel-001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workshop_payment_accounts' AND column_name = 'bank_name') THEN
    ALTER TABLE public.workshop_payment_accounts ADD COLUMN bank_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workshop_payment_accounts' AND column_name = 'account_number') THEN
    ALTER TABLE public.workshop_payment_accounts ADD COLUMN account_number text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workshop_payment_accounts' AND column_name = 'account_holder_name') THEN
    ALTER TABLE public.workshop_payment_accounts ADD COLUMN account_holder_name text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workshop_payment_accounts' AND column_name = 'qr_image_url') THEN
    ALTER TABLE public.workshop_payment_accounts ADD COLUMN qr_image_url text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'workshop_payment_accounts' AND column_name = 'display_name') THEN
    ALTER TABLE public.workshop_payment_accounts ADD COLUMN display_name text;
  END IF;
END $$;

-- 3. Hapus constraint unik yang terlalu membatasi (agar bisa simpan banyak rekening/QRIS)
ALTER TABLE public.workshop_payment_accounts DROP CONSTRAINT IF EXISTS workshop_payment_accounts_workshop_id_provider_key;

-- 4. Indeks pencarian workshop
CREATE INDEX IF NOT EXISTS idx_payment_accounts_ws ON public.workshop_payment_accounts(coalesce(workshop_id, id_bengkel));
CREATE INDEX IF NOT EXISTS idx_payment_accounts_type ON public.workshop_payment_accounts(account_type);

-- 5. Aktifkan Row Level Security (RLS)
ALTER TABLE public.workshop_payment_accounts ENABLE ROW LEVEL SECURITY;

-- 6. Kebijakan RLS:
-- Pelanggan (anon / authenticated) dapat MEMBACA rekening & QRIS yang aktif
DROP POLICY IF EXISTS "payment_accounts_public_read" ON public.workshop_payment_accounts;
CREATE POLICY "payment_accounts_public_read" ON public.workshop_payment_accounts
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

-- Admin / Staff / Authenticated dapat mengelola (SELECT, INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "payment_accounts_manage_all" ON public.workshop_payment_accounts;
CREATE POLICY "payment_accounts_manage_all" ON public.workshop_payment_accounts
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- 7. Siapkan Supabase Storage Bucket untuk Bukti dan QRIS ('payment-assets')
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-assets', 'payment-assets', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Kebijakan Storage agar gambar QRIS dapat dibaca oleh publik/pelanggan
DROP POLICY IF EXISTS "payment_assets_public_read" ON storage.objects;
CREATE POLICY "payment_assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-assets');

DROP POLICY IF EXISTS "payment_assets_insert_all" ON storage.objects;
CREATE POLICY "payment_assets_insert_all" ON storage.objects
  FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'payment-assets');

DROP POLICY IF EXISTS "payment_assets_update_all" ON storage.objects;
CREATE POLICY "payment_assets_update_all" ON storage.objects
  FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'payment-assets');

-- 8. Muat ulang cache schema API Supabase
NOTIFY pgrst, 'reload schema';

