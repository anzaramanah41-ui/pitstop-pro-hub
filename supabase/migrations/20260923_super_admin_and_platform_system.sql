-- ============================================================================
-- APPBENK: SUPER ADMIN & PLATFORM SYSTEM MIGRATION
-- Menambahkan role super_admin, sistem tier Basic/Premium,
-- Customer Service ticketing terpusat, dan system error monitoring.
-- ============================================================================

-- 1. Tambah role super_admin ke enum public.app_role jika belum ada
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

-- 2. Tambah kolom paket, status, owner ke tabel bengkel
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
CREATE TABLE IF NOT EXISTS public.customer_service_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number text UNIQUE,
  user_id text NOT NULL,
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_role text NOT NULL, -- 'pelanggan', 'admin', 'owner'
  bengkel_id text DEFAULT 'bengkel-001',
  bengkel_nama text DEFAULT 'AppBenk Workshop',
  subjek text NOT NULL,
  kategori text NOT NULL, -- 'Bug/Error', 'Pembayaran', 'Login', 'Booking', 'Maps', 'Premium', 'Lainnya'
  pesan text NOT NULL,
  status text NOT NULL DEFAULT 'Baru', -- 'Baru', 'Diproses', 'Menunggu Balasan', 'Selesai'
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS trigger_set_cs_ticket_number ON public.customer_service_tickets;
CREATE TRIGGER trigger_set_cs_ticket_number
BEFORE INSERT ON public.customer_service_tickets
FOR EACH ROW
EXECUTE FUNCTION public.set_cs_ticket_number();

-- 5. Tabel customer_service_messages (percakapan dua arah)
CREATE TABLE IF NOT EXISTS public.customer_service_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.customer_service_tickets(id) ON DELETE CASCADE,
  sender_user_id text NOT NULL,
  sender_role text NOT NULL, -- 'pelanggan', 'admin', 'owner', 'super_admin'
  sender_name text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. Tabel system_logs (Error Monitor)
CREATE TABLE IF NOT EXISTS public.system_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bengkel_id text DEFAULT 'bengkel-001',
  bengkel_nama text,
  module text NOT NULL, -- 'Google Maps', 'Midtrans / QRIS', 'Database', 'Auth', 'WhatsApp Gateway', 'Sistem'
  error_message text NOT NULL,
  stack_trace text,
  status text NOT NULL DEFAULT 'Open', -- 'Open', 'Investigasi', 'Selesai'
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Indeks performa
CREATE INDEX IF NOT EXISTS idx_cs_tickets_user ON public.customer_service_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_cs_tickets_status ON public.customer_service_tickets(status);
CREATE INDEX IF NOT EXISTS idx_cs_messages_ticket ON public.customer_service_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_module ON public.system_logs(module);
CREATE INDEX IF NOT EXISTS idx_system_logs_status ON public.system_logs(status);

-- 7. Helper RLS Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT (
    auth.uid() IS NOT NULL AND (
      EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
      OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
    )
  );
$$;

-- 8. Row Level Security (RLS)
ALTER TABLE public.customer_service_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_service_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Policy customer_service_tickets
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

DROP POLICY IF EXISTS "cs_tickets_update" ON public.customer_service_tickets;
CREATE POLICY "cs_tickets_update" ON public.customer_service_tickets
  FOR UPDATE TO authenticated
  USING (
    user_id = auth.uid()::text
    OR public.is_super_admin()
  );

-- Policy customer_service_messages
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

DROP POLICY IF EXISTS "cs_messages_insert" ON public.customer_service_messages;
CREATE POLICY "cs_messages_insert" ON public.customer_service_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_super_admin()
    OR EXISTS (
      SELECT 1 FROM public.customer_service_tickets t
      WHERE t.id = ticket_id AND t.user_id = auth.uid()::text
    )
  );

-- Policy system_logs: hanya super_admin yang dapat membaca stack trace & log
DROP POLICY IF EXISTS "system_logs_select" ON public.system_logs;
CREATE POLICY "system_logs_select" ON public.system_logs
  FOR SELECT TO authenticated
  USING (public.is_super_admin());

DROP POLICY IF EXISTS "system_logs_insert" ON public.system_logs;
CREATE POLICY "system_logs_insert" ON public.system_logs
  FOR INSERT TO authenticated, anon
  WITH CHECK (true);

DROP POLICY IF EXISTS "system_logs_update" ON public.system_logs;
CREATE POLICY "system_logs_update" ON public.system_logs
  FOR UPDATE TO authenticated
  USING (public.is_super_admin());

-- 9. Refresh API schema
NOTIFY pgrst, 'reload schema';
