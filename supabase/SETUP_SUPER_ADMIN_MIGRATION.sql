-- ============================================================================
-- APPBENK: FINAL HARDENED SETUP SUPER ADMIN & PLATFORM SYSTEM MIGRATION (REVISION 3)
-- ============================================================================
-- PENGUATAN KEAMANAN & INTEGRITAS DATA:
-- 1. system_logs DIKUNCI TOTAL:
--    - Anon, pelanggan, admin, owner DILARANG INSERT/SELECT/UPDATE/DELETE.
--    - Hanya super_admin yang memiliki akses penuh RLS (SELECT/INSERT/UPDATE/DELETE).
-- 2. TIKET CS ANTI-SPOOFING & INDEPENDEN DARI FRONTEND:
--    - Identitas pelapor (user_id, user_name, user_email, user_role) dipaksa dari auth.uid() & profiles.
--    - Pelanggan tidak dapat mengaku admin/owner/super_admin.
--    - bengkel_id dari frontend DIABAIKAN TOTAL. bengkel_id diturunkan dari relasi database resmi.
--    - Jika tidak ada relasi, bernilai NULL (tidak ada default palsu seperti bengkel-001).
-- 3. PERBAIKAN is_super_admin():
--    - Hanya merujuk ke public.profiles.role = 'super_admin' (database authoritative, bukan JWT metadata).
-- 4. PENGUNCIAN UPDATE & DELETE TIKET:
--    - UPDATE dan DELETE customer_service_tickets dikunci 100% hanya untuk super_admin.
--    - Pelapor hanya bisa berkomunikasi via customer_service_messages.
-- 5. VALIDASI customer_service_messages:
--    - sender_user_id dipaksa auth.uid().
--    - Non-super-admin ditolak jika mengirim sender_role = 'super_admin'.
-- 6. 100% IDEMPOTENT & TIDAK MERUSAK TABEL LAMA.
-- ============================================================================

-- 1. Tambah role super_admin ke enum public.app_role jika ada
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    BEGIN
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
  END IF;
END $$;

-- 2. Tambah kolom paket, status, owner ke tabel bengkel (tanpa merusak kolom lama)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bengkel') THEN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bengkel' AND column_name = 'paket') THEN
      ALTER TABLE public.bengkel ADD COLUMN paket text NOT NULL DEFAULT 'Basic';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bengkel' AND column_name = 'status') THEN
      ALTER TABLE public.bengkel ADD COLUMN status text NOT NULL DEFAULT 'Aktif';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bengkel' AND column_name = 'owner_nama') THEN
      ALTER TABLE public.bengkel ADD COLUMN owner_nama text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'bengkel' AND column_name = 'owner_email') THEN
      ALTER TABLE public.bengkel ADD COLUMN owner_email text;
    END IF;
  END IF;
END $$;

-- 3. Helper Otoritatif Super Admin
-- Hanya membaca dari tabel public.profiles (tidak bergantung pada JWT user_metadata)
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (
    auth.uid() IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role::text = 'super_admin'
    )
  );
$$;

-- 4. Sequence & Generator nomor tiket CS (CS-0001, CS-0002, ...)
CREATE SEQUENCE IF NOT EXISTS public.cs_ticket_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.set_cs_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := 'CS-' || LPAD(nextval('public.cs_ticket_seq')::text, 4, '0');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public;

GRANT USAGE, SELECT ON SEQUENCE public.cs_ticket_seq TO authenticated;

-- 5. Tabel customer_service_tickets
CREATE TABLE IF NOT EXISTS public.customer_service_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE,
  user_id text NOT NULL,
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_role text NOT NULL, -- 'pelanggan', 'admin', 'owner'
  bengkel_id text REFERENCES public.bengkel(id_bengkel) ON DELETE SET NULL DEFAULT NULL,
  bengkel_nama text DEFAULT NULL,
  subjek text NOT NULL,
  kategori text NOT NULL, -- 'Bug/Error', 'Pembayaran', 'Login', 'Booking', 'Maps', 'Premium', 'Lainnya'
  pesan text NOT NULL,
  status text NOT NULL DEFAULT 'Baru', -- 'Baru', 'Diproses', 'Menunggu Balasan', 'Selesai'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger auto generate ticket_number
DROP TRIGGER IF EXISTS trigger_set_cs_ticket_number ON public.customer_service_tickets;
CREATE TRIGGER trigger_set_cs_ticket_number
BEFORE INSERT ON public.customer_service_tickets
FOR EACH ROW
EXECUTE FUNCTION public.set_cs_ticket_number();

-- 6. Trigger Sanitasi & Resolusi Identitas Tiket (Anti-Spoofing & Relasi Bengkel Resmi)
CREATE OR REPLACE FUNCTION public.sanitize_and_resolve_cs_ticket()
RETURNS TRIGGER AS $$
DECLARE
  v_profile_role text := 'pelanggan';
  v_profile_name text := NULL;
  v_profile_email text := NULL;
  v_bengkel_id text := NULL;
  v_bengkel_nama text := NULL;
  v_pelanggan_id text := NULL;
BEGIN
  -- 1. Wajib login
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Akses ditolak: Anda harus login untuk membuat tiket bantuan.';
  END IF;

  -- 2. Paksa user_id mengambil dari auth.uid()
  NEW.user_id := auth.uid()::text;

  -- 3. Ambil data identitas terverifikasi dari public.profiles
  SELECT role::text, full_name, email, id_bengkel
  INTO v_profile_role, v_profile_name, v_profile_email, v_bengkel_id
  FROM public.profiles
  WHERE id = auth.uid();

  IF v_profile_email IS NULL THEN
    v_profile_email := COALESCE(auth.jwt() ->> 'email', 'pengguna@appbenk.id');
  END IF;

  IF v_profile_name IS NULL OR trim(v_profile_name) = '' THEN
    v_profile_name := split_part(v_profile_email, '@', 1);
  END IF;

  IF v_profile_role IS NULL OR v_profile_role = '' THEN
    v_profile_role := 'pelanggan';
  END IF;

  NEW.user_role := v_profile_role;
  NEW.user_name := v_profile_name;
  NEW.user_email := v_profile_email;
  NEW.status := 'Baru';

  -- 4. Tentukan relasi bengkel secara independen dari database (bukan dari input frontend)
  v_bengkel_id := NULL;

  -- a. Jika admin, ambil id_bengkel dari tabel public.admin
  IF v_profile_role = 'admin' THEN
    SELECT id_bengkel INTO v_bengkel_id
    FROM public.admin
    WHERE user_id = auth.uid()::text AND id_bengkel IS NOT NULL
    LIMIT 1;
  -- b. Jika owner, ambil id_bengkel dari tabel public.owner
  ELSIF v_profile_role = 'owner' THEN
    SELECT id_bengkel INTO v_bengkel_id
    FROM public.owner
    WHERE user_id = auth.uid()::text AND id_bengkel IS NOT NULL
    LIMIT 1;
  -- c. Jika pelanggan, cari relasi pelanggan -> booking_servis terakhir
  ELSIF v_profile_role = 'pelanggan' THEN
    SELECT id_pelanggan INTO v_pelanggan_id
    FROM public.pelanggan
    WHERE user_id = auth.uid()::text
    LIMIT 1;

    IF v_pelanggan_id IS NOT NULL THEN
      SELECT id_bengkel INTO v_bengkel_id
      FROM public.booking_servis
      WHERE id_pelanggan = v_pelanggan_id AND id_bengkel IS NOT NULL
      ORDER BY created_at DESC
      LIMIT 1;
    END IF;
  END IF;

  -- d. Jika belum ditemukan, periksa id_bengkel pada public.profiles
  IF v_bengkel_id IS NULL THEN
    SELECT id_bengkel INTO v_bengkel_id
    FROM public.profiles
    WHERE id = auth.uid() AND id_bengkel IS NOT NULL
    LIMIT 1;
  END IF;

  -- e. Lookup nama bengkel resmi dari public.bengkel
  IF v_bengkel_id IS NOT NULL AND v_bengkel_id != '' THEN
    SELECT nama_bengkel INTO v_bengkel_nama
    FROM public.bengkel
    WHERE id_bengkel = v_bengkel_id;

    IF FOUND THEN
      NEW.bengkel_id := v_bengkel_id;
      NEW.bengkel_nama := v_bengkel_nama;
    ELSE
      NEW.bengkel_id := NULL;
      NEW.bengkel_nama := NULL;
    END IF;
  ELSE
    NEW.bengkel_id := NULL;
    NEW.bengkel_nama := NULL;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_sanitize_and_resolve_cs_ticket ON public.customer_service_tickets;
CREATE TRIGGER trigger_sanitize_and_resolve_cs_ticket
BEFORE INSERT ON public.customer_service_tickets
FOR EACH ROW
EXECUTE FUNCTION public.sanitize_and_resolve_cs_ticket();

-- 7. Tabel customer_service_messages (percakapan dua arah)
CREATE TABLE IF NOT EXISTS public.customer_service_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.customer_service_tickets(id) ON DELETE CASCADE,
  sender_user_id text NOT NULL,
  sender_role text NOT NULL, -- 'pelanggan', 'admin', 'owner', 'super_admin'
  sender_name text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger validasi sender role & user_id & sender_name (anti-spoofing zero-trust)
CREATE OR REPLACE FUNCTION public.validate_cs_message_sender()
RETURNS TRIGGER AS $$
DECLARE
  v_is_super boolean := false;
  v_real_role text := 'pelanggan';
  v_real_name text := NULL;
  v_email text := NULL;
BEGIN
  -- 1. Wajib terautentikasi
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Akses ditolak: Anda harus login untuk mengirim pesan.';
  END IF;

  -- 2. Paksa sender_user_id selalu mengambil dari auth.uid()
  NEW.sender_user_id := auth.uid()::text;

  -- 3. Ambil data profil riil dari tabel public.profiles (Zero-Trust)
  SELECT role::text, full_name, email
  INTO v_real_role, v_real_name, v_email
  FROM public.profiles
  WHERE id = auth.uid();

  -- Fallback email jika di profile null
  IF v_email IS NULL THEN
    v_email := auth.jwt() ->> 'email';
  END IF;

  -- Tentukan fallback nama yang aman jika full_name kosong/null
  IF v_real_name IS NULL OR trim(v_real_name) = '' THEN
    IF v_email IS NOT NULL AND trim(v_email) != '' THEN
      v_real_name := split_part(v_email, '@', 1);
    ELSE
      v_real_name := 'Pengguna';
    END IF;
  END IF;

  -- 4. Tetapkan sender_name SELALU dari database (timpa total input frontend)
  NEW.sender_name := v_real_name;

  -- 5. Cek otorisasi super_admin secara otoritatif dari profiles
  v_is_super := public.is_super_admin();

  IF v_is_super THEN
    NEW.sender_role := 'super_admin';
  ELSE
    -- Jika bukan super_admin, larang keras mengaku sebagai super_admin
    IF NEW.sender_role = 'super_admin' THEN
      RAISE EXCEPTION 'Akses ditolak: Hanya Super Admin yang dapat menggunakan peran super_admin.';
    END IF;

    NEW.sender_role := COALESCE(v_real_role, 'pelanggan');
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_validate_cs_message_sender ON public.customer_service_messages;
CREATE TRIGGER trigger_validate_cs_message_sender
BEFORE INSERT ON public.customer_service_messages
FOR EACH ROW
EXECUTE FUNCTION public.validate_cs_message_sender();

-- 8. Tabel system_logs (Error Monitor)
CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bengkel_id text REFERENCES public.bengkel(id_bengkel) ON DELETE SET NULL DEFAULT NULL,
  bengkel_nama text DEFAULT NULL,
  module text NOT NULL, -- 'Google Maps', 'Midtrans / QRIS', 'Database', 'Auth', 'WhatsApp Gateway', 'Sistem'
  error_message text NOT NULL,
  stack_trace text,
  status text NOT NULL DEFAULT 'Open', -- 'Open', 'Investigasi', 'Selesai'
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Indeks performa
CREATE INDEX IF NOT EXISTS idx_cs_tickets_user ON public.customer_service_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_cs_tickets_status ON public.customer_service_tickets(status);
CREATE INDEX IF NOT EXISTS idx_cs_tickets_bengkel ON public.customer_service_tickets(bengkel_id);
CREATE INDEX IF NOT EXISTS idx_cs_messages_ticket ON public.customer_service_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_module ON public.system_logs(module);
CREATE INDEX IF NOT EXISTS idx_system_logs_status ON public.system_logs(status);

-- 10. Row Level Security (RLS)
ALTER TABLE public.customer_service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_service_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Cabut akses anon dari seluruh tabel Super Admin / CS
REVOKE ALL ON public.customer_service_tickets FROM anon;
REVOKE ALL ON public.customer_service_messages FROM anon;
REVOKE ALL ON public.system_logs FROM anon;

-- ============================================================================
-- POLICY: customer_service_tickets
-- ============================================================================
DROP POLICY IF EXISTS "cs_tickets_select" ON public.customer_service_tickets;
CREATE POLICY "cs_tickets_select" ON public.customer_service_tickets
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()::text
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "cs_tickets_insert" ON public.customer_service_tickets;
CREATE POLICY "cs_tickets_insert" ON public.customer_service_tickets
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid()::text
    OR public.is_super_admin()
  );

-- UPDATE HANYA UNTUK SUPER ADMIN:
-- Pelanggan/Admin/Owner TIDAK boleh mengubah status atau memodifikasi tiket setelah dibuat.
DROP POLICY IF EXISTS "cs_tickets_update" ON public.customer_service_tickets;
CREATE POLICY "cs_tickets_update" ON public.customer_service_tickets
  FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "cs_tickets_delete" ON public.customer_service_tickets;
CREATE POLICY "cs_tickets_delete" ON public.customer_service_tickets
  FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- ============================================================================
-- POLICY: customer_service_messages
-- ============================================================================
DROP POLICY IF EXISTS "cs_messages_select" ON public.customer_service_messages;
CREATE POLICY "cs_messages_select" ON public.customer_service_messages
  FOR SELECT TO authenticated
  USING (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.customer_service_tickets t
      WHERE t.id = ticket_id AND t.user_id = auth.uid()::text
    )
  );

-- INSERT PESAN: Pelapor tiket hanya boleh kirim ke tiket miliknya & dilarang mengaku super_admin
DROP POLICY IF EXISTS "cs_messages_insert" ON public.customer_service_messages;
CREATE POLICY "cs_messages_insert" ON public.customer_service_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    sender_user_id = auth.uid()::text
    AND (
      (sender_role = 'super_admin' AND public.is_super_admin())
      OR (
        sender_role != 'super_admin'
        AND EXISTS (
          SELECT 1 FROM public.customer_service_tickets t
          WHERE t.id = ticket_id AND t.user_id = auth.uid()::text
        )
      )
    )
  );

DROP POLICY IF EXISTS "cs_messages_update" ON public.customer_service_messages;
CREATE POLICY "cs_messages_update" ON public.customer_service_messages
  FOR UPDATE TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "cs_messages_delete" ON public.customer_service_messages;
CREATE POLICY "cs_messages_delete" ON public.customer_service_messages
  FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- ============================================================================
-- POLICY: system_logs (DIKUNCI KETAT HANYA UNTUK SUPER ADMIN)
-- Pengguna biasa (pelanggan/admin/owner/anon) DIBLOKIR TOTAL dari SELECT/INSERT/UPDATE/DELETE
-- ============================================================================
DROP POLICY IF EXISTS "system_logs_select" ON public.system_logs;
CREATE POLICY "system_logs_select" ON public.system_logs
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "system_logs_insert" ON public.system_logs;
CREATE POLICY "system_logs_insert" ON public.system_logs
  FOR INSERT TO authenticated
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "system_logs_update" ON public.system_logs;
CREATE POLICY "system_logs_update" ON public.system_logs
  FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "system_logs_delete" ON public.system_logs;
CREATE POLICY "system_logs_delete" ON public.system_logs
  FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- 11. Refresh API schema PostgREST
NOTIFY pgrst, 'reload schema';

SELECT 'FINAL HARDENED SETUP SUPER ADMIN & CS SELESAI' AS status;
