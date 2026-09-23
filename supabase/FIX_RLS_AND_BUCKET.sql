-- ============================================================================
-- APPBENK: FIX RLS + BUAT BUCKET PAYMENT-ASSETS
-- Jalankan di Supabase Dashboard -> SQL Editor -> Run
-- ============================================================================

-- 1. FIX RLS: Hapus policy lama yang salah
DROP POLICY IF EXISTS "payment_accounts_public_read" ON public.workshop_payment_accounts;
DROP POLICY IF EXISTS "payment_accounts_manage_all" ON public.workshop_payment_accounts;

-- 2. Buat policy baru yang benar:
-- Semua user yang sudah login (authenticated) bisa SELECT, INSERT, UPDATE
CREATE POLICY "payment_accounts_authenticated_all" ON public.workshop_payment_accounts
  FOR ALL TO authenticated
  USING (true)
  WITH CHECK (true);

-- anon (belum login) hanya bisa baca data aktif
CREATE POLICY "payment_accounts_anon_read" ON public.workshop_payment_accounts
  FOR SELECT TO anon
  USING (is_active = true);

-- 3. Buat bucket storage payment-assets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'payment-assets',
  'payment-assets',
  true,
  10485760,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 10485760;

-- 4. Policy storage: siapa saja bisa baca file (gambar QRIS publik)
DROP POLICY IF EXISTS "payment_assets_public_read" ON storage.objects;
CREATE POLICY "payment_assets_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-assets');

-- 5. Policy storage: user login bisa upload
DROP POLICY IF EXISTS "payment_assets_authenticated_upload" ON storage.objects;
CREATE POLICY "payment_assets_authenticated_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'payment-assets');

-- 6. Policy storage: user login bisa update/replace file
DROP POLICY IF EXISTS "payment_assets_authenticated_update" ON storage.objects;
CREATE POLICY "payment_assets_authenticated_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'payment-assets');

-- 7. Policy storage: user login bisa delete file
DROP POLICY IF EXISTS "payment_assets_authenticated_delete" ON storage.objects;
CREATE POLICY "payment_assets_authenticated_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'payment-assets');

-- 8. Reload schema cache
NOTIFY pgrst, 'reload schema';

SELECT 'FIX SELESAI! Cek tabel dan bucket sudah siap.' AS status;

