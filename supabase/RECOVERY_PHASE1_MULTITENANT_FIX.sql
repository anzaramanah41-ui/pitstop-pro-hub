-- ============================================================================
-- APPBENK: RECOVERY & EXECUTION SCRIPT FOR PHASE 1 MULTI-TENANT ARCHITECTURE
-- File: supabase/RECOVERY_PHASE1_MULTITENANT_FIX.sql
-- Tujuan:
-- 1. Menyelesaikan pembuatan tabel Phase 1 yang belum terbuat di Supabase:
--    - workshops
--    - workshop_members
--    - workshop_payment_accounts
--    - notification_logs
--    - stok_opname
-- 2. Memperbaiki bug Foreign Key yang sebelumnya menggagalkan migrasi:
--    - Memastikan backfill ke auth.users hanya menyertakan user yang valid
-- 3. Menambahkan kolom workshop_id & id_bengkel pada seluruh tabel operasional
-- 4. Memasang trigger dual-column synchronization
-- 5. Mengaktifkan Row Level Security (RLS) dan security helper functions
--
-- JAMINAN KEAMANAN:
-- - Tidak ada DROP TABLE
-- - Tidak ada TRUNCATE
-- - Tidak ada data existing yang dihapus
-- - 100% Idempotent (aman dijalankan berulang kali)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. TABEL: workshops (Multi-Tenant Workshop / Bengkel Entity)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workshops (
  id text PRIMARY KEY,
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  phone text,
  email text,
  address text,
  province text,
  city text,
  district text,
  postal_code text,
  latitude double precision,
  longitude double precision,
  google_place_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_workshops_code ON public.workshops(code);
CREATE INDEX IF NOT EXISTS idx_workshops_owner ON public.workshops(owner_id);

-- Backfill workshops dari tabel bengkel eksisting
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bengkel') THEN
    INSERT INTO public.workshops (id, name, code, phone, address, created_at, updated_at)
    SELECT
      id_bengkel,
      nama_bengkel,
      UPPER(REPLACE(id_bengkel, '-', '_')),
      no_telepon,
      alamat,
      created_at,
      updated_at
    FROM public.bengkel
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      phone = EXCLUDED.phone,
      address = EXCLUDED.address;
  END IF;
END $$;

-- Pastikan minimal 2 workshop default tersedia untuk multi-tenant
INSERT INTO public.workshops (id, name, code, phone, email, address, city, created_at, updated_at)
VALUES
  ('bengkel-001', 'AppBenk Motor Pusat', 'BGL-001', '021-5550101', 'pusat@appbenk.com', 'Jl. Merdeka No. 45, Jakarta', 'Jakarta Pusat', now(), now()),
  ('bengkel-002', 'AppBenk Motor Cabang Bekasi', 'BGL-002', '021-5550202', 'bekasi@appbenk.com', 'Jl. Pemuda No. 12, Bekasi', 'Bekasi', now(), now())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  code = EXCLUDED.code,
  phone = EXCLUDED.phone,
  address = EXCLUDED.address;

-- Hubungkan owner ke workshop HANYA JIKA user_id benar-benar terdaftar di auth.users
-- (Mencegah foreign key constraint violation pada data legacy/dummy)
UPDATE public.workshops w
SET owner_id = o.user_id
FROM public.owner o
WHERE (o.id_bengkel = w.id OR (o.id_bengkel IS NULL AND w.id = 'bengkel-001'))
  AND w.owner_id IS NULL
  AND o.user_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = o.user_id);


-- ============================================================================
-- 2. TABEL: workshop_members (Relasi Membership & Role User pada Workshop)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workshop_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id text NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (UPPER(role) IN ('OWNER', 'ADMIN', 'MECHANIC', 'CUSTOMER')),
  status text NOT NULL DEFAULT 'ACTIVE',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workshop_id, user_id, role)
);

CREATE INDEX IF NOT EXISTS idx_workshop_members_user ON public.workshop_members(user_id);
CREATE INDEX IF NOT EXISTS idx_workshop_members_workshop ON public.workshop_members(workshop_id);
CREATE INDEX IF NOT EXISTS idx_workshop_members_role ON public.workshop_members(role);

-- Backfill data membership dari tabel owner (Hanya yang valid di auth.users)
INSERT INTO public.workshop_members (workshop_id, user_id, role, status)
SELECT
  COALESCE(o.id_bengkel, 'bengkel-001'),
  o.user_id,
  'OWNER',
  'ACTIVE'
FROM public.owner o
WHERE o.user_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = o.user_id)
ON CONFLICT (workshop_id, user_id, role) DO NOTHING;

-- Backfill data membership dari tabel admin (Hanya yang valid di auth.users)
INSERT INTO public.workshop_members (workshop_id, user_id, role, status)
SELECT
  COALESCE(a.id_bengkel, 'bengkel-001'),
  a.user_id,
  'ADMIN',
  'ACTIVE'
FROM public.admin a
WHERE a.user_id IS NOT NULL
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = a.user_id)
ON CONFLICT (workshop_id, user_id, role) DO NOTHING;

-- Backfill data membership dari tabel profiles (Hanya yang valid di auth.users)
INSERT INTO public.workshop_members (workshop_id, user_id, role, status)
SELECT
  COALESCE(p.id_bengkel, 'bengkel-001'),
  p.id,
  UPPER(p.role),
  'ACTIVE'
FROM public.profiles p
WHERE UPPER(p.role) IN ('OWNER', 'ADMIN')
  AND EXISTS (SELECT 1 FROM auth.users u WHERE u.id = p.id)
ON CONFLICT (workshop_id, user_id, role) DO NOTHING;


-- ============================================================================
-- 3. TABEL: workshop_payment_accounts (Multi-Account Payment Gateway)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.workshop_payment_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id text NOT NULL REFERENCES public.workshops(id) ON DELETE CASCADE,
  provider text NOT NULL DEFAULT 'XENDIT',
  provider_account_id text NOT NULL,
  status text NOT NULL DEFAULT 'active',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(workshop_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_payment_accounts_workshop ON public.workshop_payment_accounts(workshop_id);


-- ============================================================================
-- 4. TABEL: notification_logs (Multi-Channel Notification Audit Log)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workshop_id text REFERENCES public.workshops(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  channel text NOT NULL CHECK (channel IN ('EMAIL', 'WHATSAPP', 'IN_APP')),
  type text NOT NULL,
  recipient text NOT NULL,
  subject text,
  message text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  provider text,
  provider_message_id text,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_workshop ON public.notification_logs(workshop_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_user ON public.notification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_channel ON public.notification_logs(channel);


-- ============================================================================
-- 5. TABEL: stok_opname (Manajemen Stok Opname Fisik Bengkel)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.stok_opname (
  id_stok_opname text PRIMARY KEY,
  workshop_id text REFERENCES public.workshops(id) ON DELETE CASCADE DEFAULT 'bengkel-001',
  id_bengkel text DEFAULT 'bengkel-001',
  tanggal date NOT NULL DEFAULT current_date,
  keterangan text,
  total_item integer NOT NULL DEFAULT 0,
  selisih_total integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stok_opname_workshop ON public.stok_opname(workshop_id);


-- ============================================================================
-- 6. FUNCTION & TRIGGER: SINKRONISASI DUAL-COLUMN (workshop_id <-> id_bengkel)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.fn_sync_workshop_bengkel_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.workshop_id IS NULL AND NEW.id_bengkel IS NOT NULL THEN
    NEW.workshop_id := NEW.id_bengkel;
  ELSIF NEW.id_bengkel IS NULL AND NEW.workshop_id IS NOT NULL THEN
    NEW.id_bengkel := NEW.workshop_id;
  END IF;

  -- Default fallback ke bengkel-001 jika keduanya kosong
  IF NEW.workshop_id IS NULL AND NEW.id_bengkel IS NULL THEN
    NEW.workshop_id := 'bengkel-001';
    NEW.id_bengkel := 'bengkel-001';
  END IF;

  RETURN NEW;
END;
$$;


-- ============================================================================
-- 7. PENAMBAHAN KOLOM WORKSHOP_ID & ID_BENGKEL PADA TABEL OPERASIONAL
-- ============================================================================
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'profiles',
    'pelanggan',
    'kendaraan',
    'mekanik',
    'booking_servis',
    'servis',
    'detail_servis',
    'pembayaran',
    'sparepart',
    'penggunaan_sparepart',
    'pembelian_sparepart',
    'riwayat_stok',
    'retur_sparepart',
    'supplier',
    'admin',
    'owner',
    'stok_opname'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = t) THEN
      -- 1. Tambah kolom workshop_id jika belum ada
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t AND column_name = 'workshop_id') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN workshop_id text REFERENCES public.workshops(id) ON DELETE SET NULL;', t);
      END IF;

      -- 2. Tambah kolom id_bengkel jika belum ada
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t AND column_name = 'id_bengkel') THEN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN id_bengkel text;', t);
      END IF;

      -- 3. Pasang trigger sinkronisasi dual-column
      EXECUTE format('DROP TRIGGER IF EXISTS trg_sync_workshop_bengkel ON public.%I;', t);
      EXECUTE format('CREATE TRIGGER trg_sync_workshop_bengkel BEFORE INSERT OR UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.fn_sync_workshop_bengkel_id();', t);

      -- 4. Buat index workshop_id
      EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I(workshop_id);', 'idx_' || t || '_workshop', t);
    END IF;
  END LOOP;
END $$;


-- ============================================================================
-- 8. BACKFILL EXISTING OPERATIONAL DATA (PRESERVE ALL DATA)
-- ============================================================================

-- Backfill profiles
UPDATE public.profiles
SET workshop_id = COALESCE(id_bengkel, 'bengkel-001'),
    id_bengkel = COALESCE(id_bengkel, 'bengkel-001')
WHERE workshop_id IS NULL;

-- Backfill pelanggan
UPDATE public.pelanggan
SET workshop_id = COALESCE(id_bengkel, 'bengkel-001'),
    id_bengkel = COALESCE(id_bengkel, 'bengkel-001')
WHERE workshop_id IS NULL;

-- Backfill kendaraan
UPDATE public.kendaraan k
SET workshop_id = COALESCE(k.id_bengkel, p.workshop_id, 'bengkel-001'),
    id_bengkel = COALESCE(k.id_bengkel, p.id_bengkel, 'bengkel-001')
FROM public.pelanggan p
WHERE k.id_pelanggan = p.id_pelanggan
  AND k.workshop_id IS NULL;

UPDATE public.kendaraan
SET workshop_id = 'bengkel-001', id_bengkel = 'bengkel-001'
WHERE workshop_id IS NULL;

-- Backfill booking_servis
UPDATE public.booking_servis
SET workshop_id = COALESCE(id_bengkel, 'bengkel-001'),
    id_bengkel = COALESCE(id_bengkel, 'bengkel-001')
WHERE workshop_id IS NULL;

-- Backfill servis
UPDATE public.servis
SET workshop_id = COALESCE(id_bengkel, 'bengkel-001'),
    id_bengkel = COALESCE(id_bengkel, 'bengkel-001')
WHERE workshop_id IS NULL;

-- Backfill detail_servis
UPDATE public.detail_servis ds
SET workshop_id = COALESCE(ds.id_bengkel, s.workshop_id, 'bengkel-001'),
    id_bengkel = COALESCE(ds.id_bengkel, s.id_bengkel, 'bengkel-001')
FROM public.servis s
WHERE ds.id_servis = s.id_servis
  AND ds.workshop_id IS NULL;

-- Backfill pembayaran
UPDATE public.pembayaran p
SET workshop_id = COALESCE(p.id_bengkel, s.workshop_id, 'bengkel-001'),
    id_bengkel = COALESCE(p.id_bengkel, s.id_bengkel, 'bengkel-001')
FROM public.servis s
WHERE p.id_servis = s.id_servis
  AND p.workshop_id IS NULL;

UPDATE public.pembayaran
SET workshop_id = 'bengkel-001', id_bengkel = 'bengkel-001'
WHERE workshop_id IS NULL;

-- Backfill sparepart
UPDATE public.sparepart
SET workshop_id = COALESCE(id_bengkel, 'bengkel-001'),
    id_bengkel = COALESCE(id_bengkel, 'bengkel-001')
WHERE workshop_id IS NULL;

-- Backfill penggunaan_sparepart
UPDATE public.penggunaan_sparepart ps
SET workshop_id = COALESCE(ps.id_bengkel, s.workshop_id, 'bengkel-001'),
    id_bengkel = COALESCE(ps.id_bengkel, s.id_bengkel, 'bengkel-001')
FROM public.servis s
WHERE ps.id_servis = s.id_servis
  AND ps.workshop_id IS NULL;

-- Backfill pembelian_sparepart
UPDATE public.pembelian_sparepart
SET workshop_id = COALESCE(id_bengkel, 'bengkel-001'),
    id_bengkel = COALESCE(id_bengkel, 'bengkel-001')
WHERE workshop_id IS NULL;

-- Backfill riwayat_stok
UPDATE public.riwayat_stok
SET workshop_id = COALESCE(id_bengkel, 'bengkel-001'),
    id_bengkel = COALESCE(id_bengkel, 'bengkel-001')
WHERE workshop_id IS NULL;

-- Backfill retur_sparepart
UPDATE public.retur_sparepart
SET workshop_id = COALESCE(id_bengkel, 'bengkel-001'),
    id_bengkel = COALESCE(id_bengkel, 'bengkel-001')
WHERE workshop_id IS NULL;

-- Backfill supplier
UPDATE public.supplier
SET workshop_id = COALESCE(id_bengkel, 'bengkel-001'),
    id_bengkel = COALESCE(id_bengkel, 'bengkel-001')
WHERE workshop_id IS NULL;

-- Backfill mekanik
UPDATE public.mekanik
SET workshop_id = COALESCE(id_bengkel, 'bengkel-001'),
    id_bengkel = COALESCE(id_bengkel, 'bengkel-001')
WHERE workshop_id IS NULL;

-- Backfill admin & owner
UPDATE public.admin
SET workshop_id = COALESCE(id_bengkel, 'bengkel-001'),
    id_bengkel = COALESCE(id_bengkel, 'bengkel-001')
WHERE workshop_id IS NULL;

UPDATE public.owner
SET workshop_id = COALESCE(id_bengkel, 'bengkel-001'),
    id_bengkel = COALESCE(id_bengkel, 'bengkel-001')
WHERE workshop_id IS NULL;


-- ============================================================================
-- 9. SECURITY DEFINER HELPER FUNCTIONS UNTUK RLS MULTI-TENANT
-- ============================================================================

-- 1. Daftar workshop_id yang diakses oleh user yang sedang login
CREATE OR REPLACE FUNCTION public.current_user_workshops()
RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT wm.workshop_id
  FROM public.workshop_members wm
  WHERE wm.user_id = auth.uid()
  UNION
  SELECT w.id
  FROM public.workshops w
  WHERE w.owner_id = auth.uid();
$$;

-- 2. Periksa apakah user memiliki role tertentu pada workshop
CREATE OR REPLACE FUNCTION public.user_has_workshop_role(target_workshop_id text, allowed_roles text[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workshop_members wm
    WHERE wm.user_id = auth.uid()
      AND wm.workshop_id = target_workshop_id
      AND UPPER(wm.role) = ANY(ARRAY(SELECT UPPER(unnest(allowed_roles))))
  ) OR EXISTS (
    SELECT 1 FROM public.workshops w
    WHERE w.id = target_workshop_id
      AND w.owner_id = auth.uid()
      AND 'OWNER' = ANY(ARRAY(SELECT UPPER(unnest(allowed_roles))))
  );
$$;

-- 3. Periksa apakah user adalah staff (OWNER, ADMIN, atau MECHANIC) pada workshop
CREATE OR REPLACE FUNCTION public.is_workshop_staff(target_workshop_id text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.user_has_workshop_role(target_workshop_id, ARRAY['OWNER', 'ADMIN', 'MECHANIC']);
$$;

-- 4. Periksa apakah user adalah OWNER pada workshop
CREATE OR REPLACE FUNCTION public.is_workshop_owner(target_workshop_id text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.user_has_workshop_role(target_workshop_id, ARRAY['OWNER']);
$$;

-- 5. Daftar id_pelanggan milik user yang sedang login
CREATE OR REPLACE FUNCTION public.current_pelanggan_ids()
RETURNS SETOF text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id_pelanggan
  FROM public.pelanggan p
  WHERE p.user_id = auth.uid();
$$;


-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_payment_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pelanggan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kendaraan ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mekanik ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_servis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detail_servis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pembayaran ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sparepart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.penggunaan_sparepart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pembelian_sparepart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.riwayat_stok ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stok_opname ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.retur_sparepart ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supplier ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.owner ENABLE ROW LEVEL SECURITY;

-- Bersihkan policy lama agar tidak duplikat
DO $$
DECLARE
  t text;
  pol record;
  all_tables text[] := ARRAY[
    'workshops', 'workshop_members', 'workshop_payment_accounts', 'notification_logs',
    'profiles', 'pelanggan', 'kendaraan', 'mekanik', 'booking_servis', 'servis',
    'detail_servis', 'pembayaran', 'sparepart', 'penggunaan_sparepart',
    'pembelian_sparepart', 'riwayat_stok', 'stok_opname', 'retur_sparepart',
    'supplier', 'admin', 'owner'
  ];
BEGIN
  FOREACH t IN ARRAY all_tables LOOP
    IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = t) THEN
      FOR pol IN SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I;', pol.policyname, t);
      END LOOP;
    END IF;
  END LOOP;
END $$;

-- A. Policy: workshops
CREATE POLICY "workshops_select" ON public.workshops
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "workshops_owner_update" ON public.workshops
  FOR UPDATE TO authenticated
  USING (public.is_workshop_owner(id))
  WITH CHECK (public.is_workshop_owner(id));

-- B. Policy: workshop_members
CREATE POLICY "members_select" ON public.workshop_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_workshop_staff(workshop_id));

CREATE POLICY "members_owner_manage" ON public.workshop_members
  FOR ALL TO authenticated
  USING (public.is_workshop_owner(workshop_id))
  WITH CHECK (public.is_workshop_owner(workshop_id));

-- C. Policy: profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT TO authenticated, anon
  USING (id = auth.uid() OR public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- D. Policy: pelanggan
CREATE POLICY "pelanggan_select" ON public.pelanggan
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "pelanggan_update" ON public.pelanggan
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid() OR public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)))
  WITH CHECK (user_id = auth.uid() OR public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "pelanggan_insert" ON public.pelanggan
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

-- E. Policy: kendaraan
CREATE POLICY "kendaraan_select" ON public.kendaraan
  FOR SELECT TO authenticated
  USING (
    id_pelanggan IN (SELECT public.current_pelanggan_ids())
    OR public.is_workshop_staff(COALESCE(workshop_id, id_bengkel))
  );

CREATE POLICY "kendaraan_insert" ON public.kendaraan
  FOR INSERT TO authenticated
  WITH CHECK (
    id_pelanggan IN (SELECT public.current_pelanggan_ids())
    OR public.is_workshop_staff(COALESCE(workshop_id, id_bengkel))
  );

CREATE POLICY "kendaraan_update" ON public.kendaraan
  FOR UPDATE TO authenticated
  USING (
    id_pelanggan IN (SELECT public.current_pelanggan_ids())
    OR public.is_workshop_staff(COALESCE(workshop_id, id_bengkel))
  );

-- F. Policy: booking_servis
CREATE POLICY "booking_select" ON public.booking_servis
  FOR SELECT TO authenticated
  USING (
    id_pelanggan IN (SELECT public.current_pelanggan_ids())
    OR public.is_workshop_staff(COALESCE(workshop_id, id_bengkel))
  );

CREATE POLICY "booking_insert" ON public.booking_servis
  FOR INSERT TO authenticated
  WITH CHECK (
    id_pelanggan IN (SELECT public.current_pelanggan_ids())
    OR public.is_workshop_staff(COALESCE(workshop_id, id_bengkel))
  );

CREATE POLICY "booking_update" ON public.booking_servis
  FOR UPDATE TO authenticated
  USING (
    id_pelanggan IN (SELECT public.current_pelanggan_ids())
    OR public.is_workshop_staff(COALESCE(workshop_id, id_bengkel))
  );

-- G. Policy: servis & detail_servis
CREATE POLICY "servis_select" ON public.servis
  FOR SELECT TO authenticated
  USING (
    id_pelanggan IN (SELECT public.current_pelanggan_ids())
    OR public.is_workshop_staff(COALESCE(workshop_id, id_bengkel))
  );

CREATE POLICY "servis_manage" ON public.servis
  FOR ALL TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)))
  WITH CHECK (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "detail_servis_select" ON public.detail_servis
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.servis s
      WHERE s.id_servis = public.detail_servis.id_servis
        AND (s.id_pelanggan IN (SELECT public.current_pelanggan_ids()) OR public.is_workshop_staff(COALESCE(s.workshop_id, s.id_bengkel)))
    )
  );

CREATE POLICY "detail_servis_manage" ON public.detail_servis
  FOR ALL TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)))
  WITH CHECK (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

-- H. Policy: pembayaran
CREATE POLICY "pembayaran_select" ON public.pembayaran
  FOR SELECT TO authenticated
  USING (
    id_pelanggan IN (SELECT public.current_pelanggan_ids())
    OR public.is_workshop_staff(COALESCE(workshop_id, id_bengkel))
  );

CREATE POLICY "pembayaran_manage" ON public.pembayaran
  FOR ALL TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)))
  WITH CHECK (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

-- I. Policy: sparepart & stok
CREATE POLICY "sparepart_select" ON public.sparepart
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "sparepart_manage" ON public.sparepart
  FOR ALL TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)))
  WITH CHECK (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "penggunaan_sparepart_select" ON public.penggunaan_sparepart
  FOR SELECT TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "penggunaan_sparepart_manage" ON public.penggunaan_sparepart
  FOR ALL TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)))
  WITH CHECK (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "pembelian_sparepart_select" ON public.pembelian_sparepart
  FOR SELECT TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "pembelian_sparepart_manage" ON public.pembelian_sparepart
  FOR ALL TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)))
  WITH CHECK (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "riwayat_stok_select" ON public.riwayat_stok
  FOR SELECT TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "riwayat_stok_manage" ON public.riwayat_stok
  FOR ALL TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)))
  WITH CHECK (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "stok_opname_select" ON public.stok_opname
  FOR SELECT TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "stok_opname_manage" ON public.stok_opname
  FOR ALL TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)))
  WITH CHECK (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "retur_sparepart_select" ON public.retur_sparepart
  FOR SELECT TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "retur_sparepart_manage" ON public.retur_sparepart
  FOR ALL TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)))
  WITH CHECK (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

-- J. Policy: mekanik & supplier
CREATE POLICY "mekanik_select" ON public.mekanik
  FOR SELECT TO authenticated, anon
  USING (true);

CREATE POLICY "mekanik_manage" ON public.mekanik
  FOR ALL TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)))
  WITH CHECK (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "supplier_select" ON public.supplier
  FOR SELECT TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "supplier_manage" ON public.supplier
  FOR ALL TO authenticated
  USING (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)))
  WITH CHECK (public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

-- K. Policy: admin & owner
CREATE POLICY "admin_select" ON public.admin
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_workshop_staff(COALESCE(workshop_id, id_bengkel)));

CREATE POLICY "owner_select" ON public.owner
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_workshop_owner(COALESCE(workshop_id, id_bengkel)));

-- L. Policy: workshop_payment_accounts & notification_logs
CREATE POLICY "payment_accounts_manage" ON public.workshop_payment_accounts
  FOR ALL TO authenticated
  USING (public.is_workshop_owner(workshop_id))
  WITH CHECK (public.is_workshop_owner(workshop_id));

CREATE POLICY "notification_logs_select" ON public.notification_logs
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_workshop_staff(workshop_id));
