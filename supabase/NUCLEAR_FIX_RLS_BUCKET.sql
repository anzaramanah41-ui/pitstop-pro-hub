-- ============================================================================
-- APPBENK: NUCLEAR FIX - RLS + BUCKET + RELOAD
-- Copy-paste SEMUA baris ini ke Supabase SQL Editor lalu klik RUN
-- ============================================================================

-- STEP 1: Hapus semua policy lama
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'workshop_payment_accounts' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.workshop_payment_accounts', pol.policyname);
  END LOOP;
END $$;

-- STEP 2: Nonaktifkan RLS sementara (agar semua bisa akses)
ALTER TABLE public.workshop_payment_accounts DISABLE ROW LEVEL SECURITY;

-- STEP 3: Aktifkan lagi dengan policy yang benar
ALTER TABLE public.workshop_payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_payment_accounts FORCE ROW LEVEL SECURITY;

-- STEP 4: Policy: semua yang login (authenticated) bisa lakukan apapun
CREATE POLICY "qris_authenticated_full_access"
ON public.workshop_payment_accounts
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- STEP 5: Policy: anon bisa baca semua (tidak hanya is_active=true)
CREATE POLICY "qris_anon_read"
ON public.workshop_payment_accounts
FOR SELECT
TO anon
USING (true);

-- STEP 6: Buat bucket storage
DO $$
BEGIN
  INSERT INTO storage.buckets (id, name, public, file_size_limit)
  VALUES ('payment-assets', 'payment-assets', true, 10485760)
  ON CONFLICT (id) DO UPDATE SET public = true;
  RAISE NOTICE 'Bucket payment-assets berhasil dibuat/diupdate';
EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Error bucket: %', SQLERRM;
END $$;

-- STEP 7: Policy storage
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname FROM pg_policies
    WHERE tablename = 'objects' AND schemaname = 'storage'
    AND policyname LIKE 'payment_assets%'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
  END LOOP;
END $$;

CREATE POLICY "payment_assets_select" ON storage.objects
  FOR SELECT USING (bucket_id = 'payment-assets');

CREATE POLICY "payment_assets_insert" ON storage.objects
  FOR INSERT TO authenticated, anon
  WITH CHECK (bucket_id = 'payment-assets');

CREATE POLICY "payment_assets_update" ON storage.objects
  FOR UPDATE TO authenticated, anon
  USING (bucket_id = 'payment-assets');

CREATE POLICY "payment_assets_delete" ON storage.objects
  FOR DELETE TO authenticated, anon
  USING (bucket_id = 'payment-assets');

-- STEP 8: Reload schema
NOTIFY pgrst, 'reload schema';

-- Cek hasil
SELECT
  'workshop_payment_accounts' AS tabel,
  COUNT(*) AS jumlah_row,
  'OK - tabel ada' AS status
FROM public.workshop_payment_accounts;

SELECT
  id AS bucket_id,
  name AS bucket_name,
  public AS is_public
FROM storage.buckets
WHERE id = 'payment-assets';

