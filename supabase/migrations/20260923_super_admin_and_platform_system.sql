-- ============================================================================
-- APPBENK: HARDENED SETUP SUPER ADMIN & PLATFORM SYSTEM MIGRATION (REVISION 2)
-- Keamanan diperketat:
-- 1. UPDATE cs_tickets dikunci hanya untuk super_admin (pelanggan/admin/owner tidak bisa ubah status/identitas).
-- 2. system_logs ditutup dari anon, hanya authenticated dengan validasi ketat, baca hanya super_admin.
-- 3. sender_role divalidasi via trigger & RLS (tidak bisa spoof 'super_admin').
-- 4. bengkel_id otomatis di-resolve dari relasi asli (profiles/admin/owner/booking), default NULL (bukan fake bengkel-001).
-- 5. 100% Idempotent dan TIDAK merusak data tabel lama.
-- ============================================================================

-- 1. Tambah role super_admin ke enum public.app_role jika ada
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    BEGIN
      ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END IF;
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

-- 3. Sequence & Generator nomor tiket CS (CS-0001, CS-0002, ...)
CREATE SEQUENCE IF NOT EXISTS public.cs_ticket_seq START WITH 1;

CREATE OR REPLACE FUNCTION public.set_cs_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL OR NEW.ticket_number = '' THEN
    NEW.ticket_number := 'CS-' || LPAD(nextval('public.cs_ticket_seq')::text, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Tabel customer_service_tickets
-- bengkel_id merujuk ke tabel bengkel resmi atau NULL jika tidak terkait bengkel tertentu
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

-- 5. Trigger helper: Otomatis mencari bengkel_id asli jika tidak diisi atau jika validasi nama bengkel
CREATE OR REPLACE FUNCTION public.resolve_ticket_bengkel()
RETURNS TRIGGER AS $$
DECLARE
  v_bengkel_id text := NULL;
  v_bengkel_nama text := NULL;
BEGIN
  -- Pastikan user_id sesuai dengan auth user jika authenticated
  IF auth.uid() IS NOT NULL THEN
    NEW.user_id := auth.uid()::text;
  END IF;

  -- 1. Jika bengkel_id sudah diberikan, cari nama bengkelnya dari database
  IF NEW.bengkel_id IS NOT NULL AND NEW.bengkel_id != '' THEN
    SELECT nama_bengkel INTO v_bengkel_nama FROM public.bengkel WHERE id_bengkel = NEW.bengkel_id;
    IF FOUND THEN
      NEW.bengkel_nama := v_bengkel_nama;
      RETURN NEW;
    ELSE
      -- Jika bengkel_id yang dikirim tidak valid di tabel bengkel, ubah jadi NULL
      NEW.bengkel_id := NULL;
      NEW.bengkel_nama := NULL;
    END IF;
  END IF;

  -- 2. Jika bengkel_id masih NULL, deteksi dari profile atau riwayat user
  IF auth.uid() IS NOT NULL THEN
    -- Cari dari profiles
    SELECT id_bengkel INTO v_bengkel_id FROM public.profiles WHERE id = auth.uid() AND id_bengkel IS NOT NULL LIMIT 1;
    
    -- Jika belum ada, cari dari tabel admin
    IF v_bengkel_id IS NULL THEN
      SELECT id_bengkel INTO v_bengkel_id FROM public.admin WHERE user_id = auth.uid()::text AND id_bengkel IS NOT NULL LIMIT 1;
    END IF;

    -- Jika belum ada, cari dari tabel owner
    IF v_bengkel_id IS NULL THEN
      SELECT id_bengkel INTO v_bengkel_id FROM public.owner WHERE user_id = auth.uid()::text AND id_bengkel IS NOT NULL LIMIT 1;
    END IF;

    -- Jika belum ada dan user adalah pelanggan, cari bengkel dari servis terakhirnya
    IF v_bengkel_id IS NULL THEN
      SELECT bs.id_bengkel INTO v_bengkel_id
      FROM public.booking_servis bs
      JOIN public.pelanggan p ON p.id_pelanggan = bs.id_pelanggan
      WHERE p.user_id = auth.uid()::text AND bs.id_bengkel IS NOT NULL
      ORDER BY bs.created_at DESC LIMIT 1;
    END IF;

    -- Jika ditemukan relasi bengkel sebenarnya, ambil nama bengkelnya
    IF v_bengkel_id IS NOT NULL THEN
      SELECT nama_bengkel INTO v_bengkel_nama FROM public.bengkel WHERE id_bengkel = v_bengkel_id;
      NEW.bengkel_id := v_bengkel_id;
      NEW.bengkel_nama := v_bengkel_nama;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_resolve_ticket_bengkel ON public.customer_service_tickets;
CREATE TRIGGER trigger_resolve_ticket_bengkel
BEFORE INSERT ON public.customer_service_tickets
FOR EACH ROW
EXECUTE FUNCTION public.resolve_ticket_bengkel();

-- 6. Tabel customer_service_messages (percakapan dua arah)
CREATE TABLE IF NOT EXISTS public.customer_service_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.customer_service_tickets(id) ON DELETE CASCADE,
  sender_user_id text NOT NULL,
  sender_role text NOT NULL, -- 'pelanggan', 'admin', 'owner', 'super_admin'
  sender_name text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger validasi sender role & user_id (anti-spoofing)
CREATE OR REPLACE FUNCTION public.validate_cs_message_sender()
RETURNS TRIGGER AS $$
DECLARE
  v_is_super boolean := false;
  v_real_role text := 'pelanggan';
  v_real_name text := NULL;
BEGIN
  -- Selalu paksa sender_user_id adalah auth.uid() jika authenticated
  IF auth.uid() IS NOT NULL THEN
    NEW.sender_user_id := auth.uid()::text;
    
    -- Cek apakah user adalah super_admin
    v_is_super := public.is_super_admin();

    IF v_is_super THEN
      NEW.sender_role := 'super_admin';
    ELSE
      -- Jika bukan super_admin, larang keras mengaku sebagai super_admin
      IF NEW.sender_role = 'super_admin' THEN
        RAISE EXCEPTION 'Akses ditolak: Hanya Super Admin yang dapat menggunakan peran super_admin.';
      END IF;

      -- Ambil role asli dari tabel profiles
      SELECT role, full_name INTO v_real_role, v_real_name FROM public.profiles WHERE id = auth.uid();
      IF FOUND AND v_real_role IS NOT NULL THEN
        NEW.sender_role := v_real_role;
      ELSE
        NEW.sender_role := 'pelanggan';
      END IF;
    END IF;

    IF v_real_name IS NOT NULL AND (NEW.sender_name IS NULL OR NEW.sender_name = '') THEN
      NEW.sender_name := v_real_name;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Tabel system_logs (Error Monitor)
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

-- 8. Indeks performa
CREATE INDEX IF NOT EXISTS idx_cs_tickets_user ON public.customer_service_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_cs_tickets_status ON public.customer_service_tickets(status);
CREATE INDEX IF NOT EXISTS idx_cs_tickets_bengkel ON public.customer_service_tickets(bengkel_id);
CREATE INDEX IF NOT EXISTS idx_cs_messages_ticket ON public.customer_service_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_module ON public.system_logs(module);
CREATE INDEX IF NOT EXISTS idx_system_logs_status ON public.system_logs(status);

-- 9. Helper RLS Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (
    auth.uid() IS NOT NULL AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
      OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    )
  );
$$;

-- Pasang trigger validasi pesan setelah helper is_super_admin siap
DROP TRIGGER IF EXISTS trigger_validate_cs_message_sender ON public.customer_service_messages;
CREATE TRIGGER trigger_validate_cs_message_sender
BEFORE INSERT ON public.customer_service_messages
FOR EACH ROW
EXECUTE FUNCTION public.validate_cs_message_sender();

-- 10. Row Level Security (RLS)
ALTER TABLE public.customer_service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_service_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Cabut akses publik anon dari system_logs
REVOKE ALL ON public.system_logs FROM anon;

-- POLICY: customer_service_tickets
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
-- Komunikasi lanjutan dilakukan via customer_service_messages.
DROP POLICY IF EXISTS "cs_tickets_update" ON public.customer_service_tickets;
CREATE POLICY "cs_tickets_update" ON public.customer_service_tickets
  FOR UPDATE TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "cs_tickets_delete" ON public.customer_service_tickets;
CREATE POLICY "cs_tickets_delete" ON public.customer_service_tickets
  FOR DELETE TO authenticated
  USING (public.is_super_admin());

-- POLICY: customer_service_messages
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

-- INSERT PESAN: Pelapor tiket hanya boleh kirim ke tiket miliknya & tidak boleh mengaku super_admin
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

-- POLICY: system_logs
-- Hanya Super Admin yang boleh membaca stack trace dan log error
DROP POLICY IF EXISTS "system_logs_select" ON public.system_logs;
CREATE POLICY "system_logs_select" ON public.system_logs
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

-- INSERT LOG HANYA DARI AUTHENTICATED USER dengan validasi panjang teks & status default
DROP POLICY IF EXISTS "system_logs_insert" ON public.system_logs;
CREATE POLICY "system_logs_insert" ON public.system_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    char_length(module) BETWEEN 2 AND 50
    AND char_length(error_message) BETWEEN 2 AND 2000
    AND status = 'Open'
  );

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

SELECT 'HARDENED SETUP SUPER ADMIN & CS SELESAI' AS status;
