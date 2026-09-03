-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin','pelanggan','owner');

-- ============ TIMESTAMP HELPER ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  role public.app_role NOT NULL DEFAULT 'pelanggan',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT, INSERT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','owner'));
$$;

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "self assign pelanggan only" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND role = 'pelanggan');

CREATE POLICY "read own profile or staff" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "insert own profile" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "update own profile" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ============ CUSTOMERS ============
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid UNIQUE REFERENCES public.profiles(id) ON DELETE SET NULL,
  nama text NOT NULL,
  email text NOT NULL DEFAULT '',
  telepon text NOT NULL DEFAULT '',
  alamat text NOT NULL DEFAULT '',
  kendaraan text NOT NULL DEFAULT '',
  plat text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.customers TO authenticated;
GRANT ALL ON public.customers TO service_role;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.owns_customer(_customer_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.customers WHERE id = _customer_id AND profile_id = auth.uid());
$$;

CREATE POLICY "customers staff all" ON public.customers FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "customers read own" ON public.customers FOR SELECT TO authenticated
  USING (profile_id = auth.uid());
CREATE POLICY "customers claim own" ON public.customers FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());
CREATE POLICY "customers update own" ON public.customers FOR UPDATE TO authenticated
  USING (profile_id = auth.uid()) WITH CHECK (profile_id = auth.uid());

-- ============ VEHICLES ============
CREATE TABLE public.vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  merk text NOT NULL,
  tipe text NOT NULL,
  tahun integer NOT NULL DEFAULT 2020,
  plat text NOT NULL DEFAULT '',
  kilometer integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.vehicles TO authenticated;
GRANT ALL ON public.vehicles TO service_role;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_vehicles_updated BEFORE UPDATE ON public.vehicles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "vehicles staff all" ON public.vehicles FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "vehicles own all" ON public.vehicles FOR ALL TO authenticated
  USING (public.owns_customer(customer_id)) WITH CHECK (public.owns_customer(customer_id));

-- ============ SPAREPARTS ============
CREATE TABLE public.spareparts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nama text NOT NULL,
  harga integer NOT NULL DEFAULT 0,
  stok integer NOT NULL DEFAULT 0,
  satuan text NOT NULL DEFAULT 'Pcs',
  stok_minimum integer NOT NULL DEFAULT 0,
  terpakai integer NOT NULL DEFAULT 0,
  deskripsi text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.spareparts TO authenticated;
GRANT ALL ON public.spareparts TO service_role;
ALTER TABLE public.spareparts ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_spareparts_updated BEFORE UPDATE ON public.spareparts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "spareparts read all" ON public.spareparts FOR SELECT TO authenticated USING (true);
CREATE POLICY "spareparts staff write" ON public.spareparts FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ BOOKINGS ============
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor text NOT NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  pelanggan_nama text NOT NULL DEFAULT '',
  kendaraan text NOT NULL DEFAULT '',
  plat text NOT NULL DEFAULT '',
  jenis text NOT NULL DEFAULT '',
  keluhan text NOT NULL DEFAULT '',
  tanggal date NOT NULL DEFAULT current_date,
  waktu text NOT NULL DEFAULT '',
  catatan text NOT NULL DEFAULT '',
  mekanik_diinginkan text,
  mekanik_ditugaskan text,
  alasan_tolak text,
  status text NOT NULL DEFAULT 'Menunggu Konfirmasi',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bookings TO authenticated;
GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_bookings_updated BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "bookings staff all" ON public.bookings FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "bookings read own" ON public.bookings FOR SELECT TO authenticated
  USING (public.owns_customer(customer_id));
CREATE POLICY "bookings insert own" ON public.bookings FOR INSERT TO authenticated
  WITH CHECK (public.owns_customer(customer_id));

-- ============ SERVICE ORDERS ============
CREATE TABLE public.service_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor text NOT NULL,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  vehicle_id uuid REFERENCES public.vehicles(id) ON DELETE SET NULL,
  pelanggan_nama text NOT NULL DEFAULT '',
  kendaraan text NOT NULL DEFAULT '',
  plat text NOT NULL DEFAULT '',
  jenis text NOT NULL DEFAULT '',
  keluhan text NOT NULL DEFAULT '',
  pekerjaan text NOT NULL DEFAULT '',
  mekanik text NOT NULL DEFAULT '',
  tanggal date NOT NULL DEFAULT current_date,
  status text NOT NULL DEFAULT 'Menunggu',
  catatan text NOT NULL DEFAULT '',
  hasil_pemeriksaan text,
  estimasi_waktu text,
  sparepart_ringkas text NOT NULL DEFAULT '',
  biaya_jasa integer NOT NULL DEFAULT 0,
  biaya_part integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  no_transaksi text NOT NULL DEFAULT '',
  metode_bayar text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_orders TO authenticated;
GRANT ALL ON public.service_orders TO service_role;
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_service_orders_updated BEFORE UPDATE ON public.service_orders
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "services staff all" ON public.service_orders FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "services read own" ON public.service_orders FOR SELECT TO authenticated
  USING (public.owns_customer(customer_id));
CREATE POLICY "services pay own" ON public.service_orders FOR UPDATE TO authenticated
  USING (public.owns_customer(customer_id)) WITH CHECK (public.owns_customer(customer_id));

CREATE OR REPLACE FUNCTION public.owns_service(_service_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.service_orders s
    JOIN public.customers c ON c.id = s.customer_id
    WHERE s.id = _service_id AND c.profile_id = auth.uid()
  );
$$;

-- ============ SERVICE ITEMS ============
CREATE TABLE public.service_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
  sparepart_id uuid REFERENCES public.spareparts(id) ON DELETE SET NULL,
  nama text NOT NULL DEFAULT '',
  harga integer NOT NULL DEFAULT 0,
  jumlah integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_items TO authenticated;
GRANT ALL ON public.service_items TO service_role;
ALTER TABLE public.service_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items staff all" ON public.service_items FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "items read own" ON public.service_items FOR SELECT TO authenticated
  USING (public.owns_service(service_id));

-- ============ SERVICE ESTIMATES ============
CREATE TABLE public.service_estimates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL UNIQUE REFERENCES public.service_orders(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES public.bookings(id) ON DELETE SET NULL,
  biaya_jasa integer NOT NULL DEFAULT 0,
  biaya_sparepart integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Menunggu Konfirmasi',
  catatan text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_estimates TO authenticated;
GRANT ALL ON public.service_estimates TO service_role;
ALTER TABLE public.service_estimates ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_service_estimates_updated BEFORE UPDATE ON public.service_estimates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "estimates staff all" ON public.service_estimates FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "estimates read own" ON public.service_estimates FOR SELECT TO authenticated
  USING (public.owns_service(service_id));
CREATE POLICY "estimates confirm own" ON public.service_estimates FOR UPDATE TO authenticated
  USING (public.owns_service(service_id)) WITH CHECK (public.owns_service(service_id));

-- ============ PAYMENTS ============
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid REFERENCES public.service_orders(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  no_transaksi text NOT NULL DEFAULT '',
  jumlah integer NOT NULL DEFAULT 0,
  metode text NOT NULL DEFAULT 'Cash',
  status text NOT NULL DEFAULT 'Belum Lunas',
  bukti_url text,
  tanggal_bayar date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payments TO authenticated;
GRANT ALL ON public.payments TO service_role;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_payments_updated BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "payments staff all" ON public.payments FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "payments read own" ON public.payments FOR SELECT TO authenticated
  USING (public.owns_customer(customer_id));
CREATE POLICY "payments insert own" ON public.payments FOR INSERT TO authenticated
  WITH CHECK (public.owns_customer(customer_id));
CREATE POLICY "payments update own" ON public.payments FOR UPDATE TO authenticated
  USING (public.owns_customer(customer_id)) WITH CHECK (public.owns_customer(customer_id));

-- ============ STOCK MOVEMENTS ============
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sparepart_id uuid NOT NULL REFERENCES public.spareparts(id) ON DELETE CASCADE,
  jenis text NOT NULL,
  jumlah integer NOT NULL DEFAULT 0,
  tanggal date NOT NULL DEFAULT current_date,
  keterangan text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "stock read all" ON public.stock_movements FOR SELECT TO authenticated USING (true);
CREATE POLICY "stock staff write" ON public.stock_movements FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ SPAREPART PURCHASES ============
CREATE TABLE public.sparepart_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor text NOT NULL,
  sparepart_id uuid NOT NULL REFERENCES public.spareparts(id) ON DELETE CASCADE,
  supplier text NOT NULL DEFAULT '',
  tanggal date NOT NULL DEFAULT current_date,
  jumlah integer NOT NULL DEFAULT 0,
  harga integer NOT NULL DEFAULT 0,
  total integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'Diterima',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sparepart_purchases TO authenticated;
GRANT ALL ON public.sparepart_purchases TO service_role;
ALTER TABLE public.sparepart_purchases ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_purchases_updated BEFORE UPDATE ON public.sparepart_purchases
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "purchases read all" ON public.sparepart_purchases FOR SELECT TO authenticated USING (true);
CREATE POLICY "purchases staff write" ON public.sparepart_purchases FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ SPAREPART USAGES ============
CREATE TABLE public.sparepart_usages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sparepart_id uuid NOT NULL REFERENCES public.spareparts(id) ON DELETE CASCADE,
  service_id uuid REFERENCES public.service_orders(id) ON DELETE SET NULL,
  service_nomor text NOT NULL DEFAULT '',
  tanggal date NOT NULL DEFAULT current_date,
  jumlah integer NOT NULL DEFAULT 0,
  mekanik text NOT NULL DEFAULT '',
  keterangan text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sparepart_usages TO authenticated;
GRANT ALL ON public.sparepart_usages TO service_role;
ALTER TABLE public.sparepart_usages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "usages read all" ON public.sparepart_usages FOR SELECT TO authenticated USING (true);
CREATE POLICY "usages staff write" ON public.sparepart_usages FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ============ SUPPORT TICKETS ============
CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nomor text NOT NULL,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  pengirim text NOT NULL DEFAULT '',
  peran text NOT NULL DEFAULT '',
  subjek text NOT NULL DEFAULT '',
  kategori text NOT NULL DEFAULT '',
  pesan text NOT NULL DEFAULT '',
  tanggal date NOT NULL DEFAULT current_date,
  status text NOT NULL DEFAULT 'Menunggu',
  balasan text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_tickets_updated BEFORE UPDATE ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE POLICY "tickets staff all" ON public.support_tickets FOR ALL TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "tickets read own" ON public.support_tickets FOR SELECT TO authenticated
  USING (profile_id = auth.uid());
CREATE POLICY "tickets insert own" ON public.support_tickets FOR INSERT TO authenticated
  WITH CHECK (profile_id = auth.uid());

-- ============ SEED DATA ============
INSERT INTO public.customers (id, nama, email, telepon, alamat, kendaraan, plat) VALUES
 ('11111111-0000-4000-8000-000000000001','Budi Santoso','budi@mail.test','0812-3344-5566','Jl. Merdeka No. 12, Bandung','Honda Beat 2019','D 1234 ABC'),
 ('11111111-0000-4000-8000-000000000002','Siti Rahmawati','siti@mail.test','0857-1122-9090','Jl. Cihampelas No. 7, Bandung','Yamaha NMAX 2021','D 5521 KJ'),
 ('11111111-0000-4000-8000-000000000003','Agus Prasetyo','agus@mail.test','0813-7788-4455','Jl. Sudirman No. 88, Cimahi','Toyota Avanza 2017','D 9087 PL'),
 ('11111111-0000-4000-8000-000000000004','Dewi Lestari','dewi@mail.test','0895-2211-3344','Jl. Pasteur No. 45, Bandung','Honda Vario 160','D 3311 QW'),
 ('11111111-0000-4000-8000-000000000005','Rizky Ramadhan','rizky@mail.test','0821-9911-2233','Jl. Buah Batu No. 21, Bandung','Suzuki Satria FU','D 7742 ZX'),
 ('11111111-0000-4000-8000-000000000006','Hendra Wijaya','hendra@mail.test','0877-6655-1010','Jl. Kopo No. 90, Bandung','Daihatsu Xenia 2015','D 6120 MN');

INSERT INTO public.vehicles (id, customer_id, merk, tipe, tahun, plat, kilometer) VALUES
 ('22222222-0000-4000-8000-000000000001','11111111-0000-4000-8000-000000000001','Honda','Beat',2019,'D 1234 ABC',41200),
 ('22222222-0000-4000-8000-000000000002','11111111-0000-4000-8000-000000000001','Honda','PCX',2022,'D 8890 GH',15600),
 ('22222222-0000-4000-8000-000000000003','11111111-0000-4000-8000-000000000002','Yamaha','NMAX',2021,'D 5521 KJ',28750),
 ('22222222-0000-4000-8000-000000000004','11111111-0000-4000-8000-000000000003','Toyota','Avanza',2017,'D 9087 PL',98400),
 ('22222222-0000-4000-8000-000000000005','11111111-0000-4000-8000-000000000004','Honda','Vario 160',2023,'D 3311 QW',9200),
 ('22222222-0000-4000-8000-000000000006','11111111-0000-4000-8000-000000000005','Suzuki','Satria FU',2018,'D 7742 ZX',52100),
 ('22222222-0000-4000-8000-000000000007','11111111-0000-4000-8000-000000000006','Daihatsu','Xenia',2015,'D 6120 MN',132500);

INSERT INTO public.spareparts (id, nama, harga, stok, satuan, stok_minimum, terpakai) VALUES
 ('33333333-0000-4000-8000-000000000001','Oli Mesin AHM MPX 0.8L',48000,34,'Botol',10,22),
 ('33333333-0000-4000-8000-000000000002','Busi NGK CPR9EA',27000,18,'Pcs',8,14),
 ('33333333-0000-4000-8000-000000000003','Kampas Rem Depan NMAX',95000,6,'Set',6,9),
 ('33333333-0000-4000-8000-000000000004','Filter Udara Beat',62000,0,'Pcs',5,12),
 ('33333333-0000-4000-8000-000000000005','Aki GS Astra NS40',610000,4,'Unit',3,3),
 ('33333333-0000-4000-8000-000000000006','Ban Luar IRC 80/90-14',215000,11,'Pcs',4,7),
 ('33333333-0000-4000-8000-000000000007','Link Stabilizer Avanza',175000,8,'Pcs',4,5),
 ('33333333-0000-4000-8000-000000000008','Freon R134a',120000,15,'Tabung',5,10);

INSERT INTO public.service_orders (id, nomor, customer_id, vehicle_id, pelanggan_nama, kendaraan, plat, jenis, keluhan, pekerjaan, mekanik, tanggal, status, catatan, sparepart_ringkas, biaya_jasa, biaya_part, total, no_transaksi, metode_bayar) VALUES
 ('44444444-0000-4000-8000-000000000148','SRV-2026-0148','11111111-0000-4000-8000-000000000001','22222222-0000-4000-8000-000000000001','Budi Santoso','Honda Beat 2019','D 1234 ABC','Servis Ringan','Mesin kasar saat langsam','Servis ringan + ganti busi','Joko','2026-08-18','Diproses','Disarankan ganti filter udara bulan depan','Busi NGK CPR9EA x1, Oli Mesin AHM MPX 0.8L x1',70000,75000,145000,'TRX-2026-0148',NULL),
 ('44444444-0000-4000-8000-000000000147','SRV-2026-0147','11111111-0000-4000-8000-000000000002','22222222-0000-4000-8000-000000000003','Siti Rahmawati','Yamaha NMAX 2021','D 5521 KJ','Perbaikan Rem','Rem depan kurang pakem','Ganti kampas rem depan','Dedi','2026-08-18','Menunggu','','Kampas Rem Depan NMAX x1',60000,95000,155000,'TRX-2026-0147',NULL),
 ('44444444-0000-4000-8000-000000000146','SRV-2026-0146','11111111-0000-4000-8000-000000000001','22222222-0000-4000-8000-000000000001','Budi Santoso','Honda Beat 2019','D 1234 ABC','Ganti Oli','Ganti oli rutin bulanan','Ganti oli mesin','Joko','2026-08-12','Menunggu Pembayaran','','Oli Mesin AHM MPX 0.8L x1',25000,48000,73000,'TRX-2026-0146',NULL),
 ('44444444-0000-4000-8000-000000000145','SRV-2026-0145','11111111-0000-4000-8000-000000000003','22222222-0000-4000-8000-000000000004','Agus Prasetyo','Toyota Avanza 2017','D 9087 PL','Kaki-kaki','Bunyi pada kaki-kaki','Ganti link stabilizer','Rudi','2026-08-17','Selesai Dibayar','Sudah test drive, aman','Link Stabilizer Avanza x2',130000,350000,480000,'TRX-2026-0145','Transfer Bank'),
 ('44444444-0000-4000-8000-000000000144','SRV-2026-0144','11111111-0000-4000-8000-000000000001','22222222-0000-4000-8000-000000000001','Budi Santoso','Honda Beat 2019','D 1234 ABC','Servis Ringan','Rantai kendur dan berisik','Setel & lumasi rantai','Dedi','2026-07-28','Selesai Dibayar','Rantai mulai aus','',35000,20000,55000,'TRX-2026-0144','Cash'),
 ('44444444-0000-4000-8000-000000000143','SRV-2026-0143','11111111-0000-4000-8000-000000000006','22222222-0000-4000-8000-000000000007','Hendra Wijaya','Daihatsu Xenia 2015','D 6120 MN','Servis AC','AC kurang dingin','Servis AC + isi freon','Rudi','2026-08-14','Selesai Dibayar','','Freon R134a x1',230000,120000,350000,'TRX-2026-0143','Cash'),
 ('44444444-0000-4000-8000-000000000121','SRV-2025-0121','11111111-0000-4000-8000-000000000001','22222222-0000-4000-8000-000000000001','Budi Santoso','Honda Beat 2019','D 1234 ABC','Servis Besar','Tarikan berat','Overhaul ringan mesin','Joko','2025-11-09','Selesai Dibayar','','Busi NGK CPR9EA x2',250000,54000,304000,'TRX-2025-0121','Cash'),
 ('44444444-0000-4000-8000-000000000118','SRV-2025-0118','11111111-0000-4000-8000-000000000002','22222222-0000-4000-8000-000000000003','Siti Rahmawati','Yamaha NMAX 2021','D 5521 KJ','Ganti Oli','Servis rutin','Ganti oli mesin','Bayu','2025-06-21','Selesai Dibayar','','Oli Mesin AHM MPX 0.8L x1',30000,48000,78000,'TRX-2025-0118','QRIS');

INSERT INTO public.service_items (service_id, sparepart_id, nama, harga, jumlah) VALUES
 ('44444444-0000-4000-8000-000000000148','33333333-0000-4000-8000-000000000002','Busi NGK CPR9EA',27000,1),
 ('44444444-0000-4000-8000-000000000148','33333333-0000-4000-8000-000000000001','Oli Mesin AHM MPX 0.8L',48000,1),
 ('44444444-0000-4000-8000-000000000147','33333333-0000-4000-8000-000000000003','Kampas Rem Depan NMAX',95000,1),
 ('44444444-0000-4000-8000-000000000146','33333333-0000-4000-8000-000000000001','Oli Mesin AHM MPX 0.8L',48000,1),
 ('44444444-0000-4000-8000-000000000145','33333333-0000-4000-8000-000000000007','Link Stabilizer Avanza',175000,2),
 ('44444444-0000-4000-8000-000000000143','33333333-0000-4000-8000-000000000008','Freon R134a',120000,1),
 ('44444444-0000-4000-8000-000000000121','33333333-0000-4000-8000-000000000002','Busi NGK CPR9EA',27000,2),
 ('44444444-0000-4000-8000-000000000118','33333333-0000-4000-8000-000000000001','Oli Mesin AHM MPX 0.8L',48000,1);

INSERT INTO public.service_estimates (service_id, biaya_jasa, biaya_sparepart, total, status, catatan) VALUES
 ('44444444-0000-4000-8000-000000000148',70000,75000,145000,'Disetujui','Estimasi disetujui pelanggan'),
 ('44444444-0000-4000-8000-000000000147',60000,95000,155000,'Menunggu Konfirmasi',''),
 ('44444444-0000-4000-8000-000000000146',25000,48000,73000,'Disetujui','');

INSERT INTO public.bookings (nomor, customer_id, vehicle_id, pelanggan_nama, kendaraan, plat, jenis, keluhan, tanggal, waktu, catatan, mekanik_diinginkan, mekanik_ditugaskan, alasan_tolak, status) VALUES
 ('BK-2026-0032','11111111-0000-4000-8000-000000000001','22222222-0000-4000-8000-000000000001','Budi Santoso','Honda Beat 2019','D 1234 ABC','Servis Besar','Tarikan berat & boros bensin','2026-08-20','09:00','Mohon dikerjakan pagi','Joko',NULL,NULL,'Menunggu Konfirmasi'),
 ('BK-2026-0031','11111111-0000-4000-8000-000000000004','22222222-0000-4000-8000-000000000005','Dewi Lestari','Honda Vario 160','D 3311 QW','Ganti Oli','Ganti oli rutin','2026-08-19','13:00','',NULL,NULL,NULL,'Menunggu Konfirmasi'),
 ('BK-2026-0030','11111111-0000-4000-8000-000000000002','22222222-0000-4000-8000-000000000003','Siti Rahmawati','Yamaha NMAX 2021','D 5521 KJ','Perbaikan Rem','Rem depan kurang pakem','2026-08-18','10:30','','Dedi','Dedi',NULL,'Diterima'),
 ('BK-2026-0029','11111111-0000-4000-8000-000000000005','22222222-0000-4000-8000-000000000006','Rizky Ramadhan','Suzuki Satria FU','D 7742 ZX','Kelistrikan','Lampu utama mati','2026-08-16','15:00','',NULL,NULL,'Jadwal servis pada tanggal tersebut sudah penuh. Silakan pilih tanggal lain.','Ditolak');

INSERT INTO public.payments (service_id, customer_id, no_transaksi, jumlah, metode, status, tanggal_bayar) VALUES
 ('44444444-0000-4000-8000-000000000145','11111111-0000-4000-8000-000000000003','TRX-2026-0145',480000,'Transfer Bank','Lunas','2026-08-17'),
 ('44444444-0000-4000-8000-000000000143','11111111-0000-4000-8000-000000000006','TRX-2026-0143',350000,'Cash','Lunas','2026-08-14'),
 ('44444444-0000-4000-8000-000000000144','11111111-0000-4000-8000-000000000001','TRX-2026-0144',55000,'Cash','Lunas','2026-07-28'),
 ('44444444-0000-4000-8000-000000000121','11111111-0000-4000-8000-000000000001','TRX-2025-0121',304000,'Cash','Lunas','2025-11-09'),
 ('44444444-0000-4000-8000-000000000118','11111111-0000-4000-8000-000000000002','TRX-2025-0118',78000,'QRIS','Lunas','2025-06-21');

INSERT INTO public.sparepart_purchases (nomor, sparepart_id, supplier, tanggal, jumlah, harga, total) VALUES
 ('PB-2026-0011','33333333-0000-4000-8000-000000000001','PT Sinar Pelumas','2026-08-05',24,41000,984000),
 ('PB-2026-0010','33333333-0000-4000-8000-000000000003','CV Rem Jaya','2026-07-28',10,78000,780000),
 ('PB-2026-0009','33333333-0000-4000-8000-000000000006','Toko Ban Makmur','2026-07-19',12,182000,2184000);

INSERT INTO public.stock_movements (sparepart_id, jenis, jumlah, tanggal, keterangan) VALUES
 ('33333333-0000-4000-8000-000000000001','Masuk',24,'2026-08-05','Pembelian PB-2026-0011 · PT Sinar Pelumas'),
 ('33333333-0000-4000-8000-000000000001','Keluar',1,'2026-08-18','Dipakai servis SRV-2026-0148'),
 ('33333333-0000-4000-8000-000000000002','Keluar',1,'2026-08-18','Dipakai servis SRV-2026-0148'),
 ('33333333-0000-4000-8000-000000000003','Masuk',10,'2026-07-28','Pembelian PB-2026-0010 · CV Rem Jaya'),
 ('33333333-0000-4000-8000-000000000007','Keluar',2,'2026-08-17','Dipakai servis SRV-2026-0145');

INSERT INTO public.sparepart_usages (sparepart_id, service_id, service_nomor, tanggal, jumlah, mekanik, keterangan) VALUES
 ('33333333-0000-4000-8000-000000000002','44444444-0000-4000-8000-000000000148','SRV-2026-0148','2026-08-18',1,'Joko','Ganti busi'),
 ('33333333-0000-4000-8000-000000000001','44444444-0000-4000-8000-000000000148','SRV-2026-0148','2026-08-18',1,'Joko','Ganti oli mesin'),
 ('33333333-0000-4000-8000-000000000007','44444444-0000-4000-8000-000000000145','SRV-2026-0145','2026-08-17',2,'Rudi','Ganti link stabilizer');

INSERT INTO public.support_tickets (nomor, pengirim, peran, subjek, kategori, pesan, tanggal, status, balasan) VALUES
 ('CS-001','Budi Santoso','Pelanggan','Tidak dapat melakukan booking','Booking','Saat menekan Kirim Booking, jadwal tidak tersimpan.','2026-08-29','Diproses','Tim kami sedang memeriksa kendala ini.'),
 ('CS-002','Admin Bengkel','Admin Bengkel','Laporan stok tidak sinkron','Sparepart','Stok sparepart pada laporan berbeda dengan katalog.','2026-08-27','Selesai','Sudah diperbaiki pada pembaruan terakhir.');
