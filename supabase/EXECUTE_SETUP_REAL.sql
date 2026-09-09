-- ============================================================================
-- APPBENK: MIGRATION & SEED RESMI DATABASE SUPABASE CLOUD
-- Urutan Eksekusi: Admin → Owner → Mekanik → Pelanggan → Kendaraan →
--                 Sparepart → Booking → Servis → Detail Part → Pembayaran →
--                 Pembelian & Riwayat Stok → Laporan
-- ============================================================================

-- 1. Bersihkan tabel lama jika ada
drop table if exists public.detail_servis cascade;
drop table if exists public.penggunaan cascade;
drop table if exists public.penggunaan_sparepart cascade;
drop table if exists public.pembayaran cascade;
drop table if exists public.servis cascade;
drop table if exists public.booking_servis cascade;
drop table if exists public.booking cascade;
drop table if exists public.kendaraan cascade;
drop table if exists public.pembelian cascade;
drop table if exists public.pembelian_sparepart cascade;
drop table if exists public.riwayat_stok cascade;
drop table if exists public.stok_opname cascade;
drop table if exists public.retur_sparepart cascade;
drop table if exists public.laporan_ringkasan_stok cascade;
drop table if exists public.sparepart cascade;
drop table if exists public.pelanggan cascade;
drop table if exists public.admin cascade;
drop table if exists public.owner cascade;

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 2. Tipe Enum (Jika belum ada)
do $$ begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'pelanggan', 'owner');
  end if;
end $$;

-- 3. PROFILES (Bridge Supabase Auth)
create table if not exists public.profiles (
  id uuid primary key,
  full_name text not null,
  email text not null unique,
  phone text,
  role text not null default 'pelanggan' check (role in ('admin', 'owner', 'pelanggan')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. ADMIN BENGKEL
create table public.admin (
  id_admin uuid primary key default gen_random_uuid(),
  user_id uuid,
  nama text not null,
  email text not null unique,
  no_hp text,
  status text not null default 'aktif' check (status in ('aktif', 'nonaktif')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. OWNER BENGKEL
create table public.owner (
  id_owner uuid primary key default gen_random_uuid(),
  user_id uuid,
  nama text not null,
  email text not null unique,
  no_hp text,
  status text not null default 'aktif' check (status in ('aktif', 'nonaktif')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. PELANGGAN
create table public.pelanggan (
  id_pelanggan text primary key,
  user_id uuid,
  nama text not null,
  no_hp text,
  email text unique,
  password text,
  alamat text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. KENDARAAN (Pelanggan 1 : M Kendaraan)
create table public.kendaraan (
  id_kendaraan text primary key,
  id_pelanggan text not null references public.pelanggan(id_pelanggan) on delete cascade,
  merk text not null,
  tipe text not null,
  tahun integer not null default 2022,
  nopol text not null,
  kilometer integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. SPAREPART & STOK (Kode Bebas Non-Urut: SP-009, SP-003, SP-015, OIL-MPX2, dll)
create table public.sparepart (
  id_sparepart text primary key,
  kode text not null,
  nama text not null,
  nama_sparepart text not null,
  kategori text not null default 'Umum',
  satuan text not null default 'Pcs',
  harga numeric(14,2) not null default 0,
  stok integer not null default 0,
  stok_tersedia integer not null default 0,
  stok_minimum integer not null default 5,
  status_stok text not null default 'tersedia' check (status_stok in ('tersedia', 'menipis', 'habis')),
  tanggal_update timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. BOOKING SERVIS
create table public.booking_servis (
  id_booking text primary key,
  nomor_booking text unique not null,
  id_pelanggan text not null references public.pelanggan(id_pelanggan) on delete cascade,
  id_kendaraan text not null references public.kendaraan(id_kendaraan) on delete cascade,
  tanggal_booking date not null default current_date,
  waktu_booking time not null default '09:00',
  jenis_servis text not null,
  keluhan text not null,
  mekanik_diinginkan text,
  status_booking text not null default 'menunggu_konfirmasi',
  alasan_penolakan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. SERVIS OPERASIONAL (Terhubung ke Pelanggan, Kendaraan, dan Mekanik)
create table public.servis (
  id_servis text primary key,
  nomor_servis text unique not null,
  id_booking text references public.booking_servis(id_booking) on delete set null,
  id_pelanggan text not null references public.pelanggan(id_pelanggan) on delete cascade,
  id_kendaraan text not null references public.kendaraan(id_kendaraan) on delete cascade,
  mekanik text not null default 'Joko',
  jenis_servis text not null,
  keluhan text,
  pekerjaan text,
  hasil_pemeriksaan text,
  estimasi_biaya numeric(14,2) not null default 0,
  estimasi_waktu text,
  biaya_jasa numeric(14,2) not null default 0,
  biaya_sparepart numeric(14,2) not null default 0,
  total_biaya numeric(14,2) not null default 0,
  status_servis text not null default 'menunggu',
  tanggal_servis date not null default current_date,
  tanggal_mulai timestamptz,
  estimasi_selesai timestamptz,
  tanggal_selesai timestamptz,
  catatan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 11. DETAIL SERVIS (Sparepart terpakai per order servis)
create table public.detail_servis (
  id_detail text primary key,
  id_detail_servis text,
  id_servis text not null references public.servis(id_servis) on delete cascade,
  id_sparepart text references public.sparepart(id_sparepart) on delete restrict,
  jumlah integer not null default 1,
  qty integer not null default 1,
  harga numeric(14,2) not null default 0,
  harga_satuan numeric(14,2) not null default 0,
  subtotal numeric(14,2) not null default 0,
  keterangan text,
  created_at timestamptz not null default now()
);

-- 12. PENGGUNAAN SPAREPART
create table public.penggunaan_sparepart (
  id_penggunaan_sparepart text primary key,
  id_sparepart text not null references public.sparepart(id_sparepart) on delete restrict,
  id_servis text not null references public.servis(id_servis) on delete cascade,
  tanggal date not null default current_date,
  jumlah integer not null default 1,
  qty integer not null default 1,
  total_harga numeric(14,2) not null default 0,
  mekanik text,
  keterangan text,
  created_at timestamptz not null default now()
);

-- 13. PEMBAYARAN (Transaksi Keuangan)
create table public.pembayaran (
  id_pembayaran text primary key,
  nomor_transaksi text unique not null,
  no_transaksi text,
  id_servis text not null references public.servis(id_servis) on delete cascade,
  id_pelanggan text not null references public.pelanggan(id_pelanggan) on delete cascade,
  metode text not null default 'Cash',
  metode_pembayaran text default 'cash',
  tanggal_bayar date not null default current_date,
  total_bayar numeric(14,2) not null default 0,
  jumlah_bayar numeric(14,2) not null default 0,
  status text not null default 'Lunas',
  status_pembayaran text not null default 'lunas',
  bukti_url text,
  bukti_pembayaran text,
  alasan_penolakan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 14. PEMBELIAN SPAREPART DARI SUPPLIER
create table public.pembelian_sparepart (
  id_pembelian_sparepart text primary key,
  id_pembelian text,
  nomor_pembelian text unique not null,
  id_sparepart text not null references public.sparepart(id_sparepart) on delete restrict,
  supplier text not null,
  tanggal date not null default current_date,
  jumlah integer not null default 1,
  harga numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  status text not null default 'diterima',
  created_at timestamptz not null default now()
);

-- 15. RIWAYAT STOK (Mutasi Masuk/Keluar)
create table public.riwayat_stok (
  id_riwayat_stok text primary key,
  id_riwayat text,
  id_sparepart text not null references public.sparepart(id_sparepart) on delete cascade,
  tipe text not null default 'masuk',
  jenis text not null default 'masuk',
  qty integer not null default 1,
  jumlah integer not null default 1,
  tanggal date not null default current_date,
  keterangan text,
  created_at timestamptz not null default now()
);

-- 16. VIEW ALIAS (Untuk kompatibilitas query lama jika ada)
create or replace view public.penggunaan as select id_penggunaan_sparepart as id_penggunaan, id_servis, id_sparepart, qty, total_harga, created_at from public.penggunaan_sparepart;
create or replace view public.pembelian as select id_pembelian_sparepart as id_pembelian, nomor_pembelian, id_sparepart, supplier, tanggal, jumlah, harga, total, created_at from public.pembelian_sparepart;

-- ----------------------------------------------------------------------------
-- TAHAP 2: BUKA AKSES RLS OPERASIONAL (Agar Anon & Authenticated Bisa Baca/Tulis)
-- ----------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.admin enable row level security;
alter table public.owner enable row level security;
alter table public.pelanggan enable row level security;
alter table public.kendaraan enable row level security;
alter table public.sparepart enable row level security;
alter table public.booking_servis enable row level security;
alter table public.servis enable row level security;
alter table public.detail_servis enable row level security;
alter table public.penggunaan_sparepart enable row level security;
alter table public.pembayaran enable row level security;
alter table public.pembelian_sparepart enable row level security;
alter table public.riwayat_stok enable row level security;

do $$
declare
  t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' and tablename not in ('schema_migrations')
  loop
    execute format('drop policy if exists "allow_all" on public.%I;', t);
    execute format('create policy "allow_all" on public.%I for all to anon, authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- TAHAP 3: SEED DATA REAL BERURUTAN (TERHUBUNG 100%)
-- ----------------------------------------------------------------------------

-- 1. ADMIN BENGKEL REAL (Menggunakan ID Supabase Auth Yang Sudah Terdaftar)
insert into public.profiles (id, full_name, email, phone, role)
values ('96877dce-949c-4665-98f6-f74ab01695ea', 'Budi Santoso (Admin)', 'admin@bengkel.com', '081234567890', 'admin')
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

insert into public.admin (id_admin, user_id, nama, email, no_hp, status)
values ('96877dce-949c-4665-98f6-f74ab01695ea', '96877dce-949c-4665-98f6-f74ab01695ea', 'Budi Santoso (Admin)', 'admin@bengkel.com', '081234567890', 'aktif')
on conflict (email) do update set nama = excluded.nama;

-- 2. OWNER BENGKEL REAL (Menggunakan ID Supabase Auth Yang Sudah Terdaftar)
insert into public.profiles (id, full_name, email, phone, role)
values ('84978b0a-311f-4c06-96c9-7537fd9555a8', 'Anzar Amanah (Owner)', 'owner@bengkel.com', '081299887766', 'owner')
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

insert into public.owner (id_owner, user_id, nama, email, no_hp, status)
values ('84978b0a-311f-4c06-96c9-7537fd9555a8', '84978b0a-311f-4c06-96c9-7537fd9555a8', 'Anzar Amanah (Owner)', 'owner@bengkel.com', '081299887766', 'aktif')
on conflict (id_owner) do nothing;

-- 3. PELANGGAN REAL (3 Pelanggan Nyata)
insert into public.pelanggan (id_pelanggan, nama, email, no_hp, alamat) values
('pl-001', 'Ahmad Fauzi', 'ahmad.fauzi@gmail.com', '081288991122', 'Jl. Riau No. 45, Bandung'),
('pl-002', 'Siti Rahmawati', 'siti.rahma@yahoo.com', '085711229090', 'Jl. Cihampelas No. 12, Bandung'),
('pl-003', 'Rian Pratama', 'rian.pratama@gmail.com', '082133445566', 'Jl. Soekarno Hatta No. 102, Bandung');

-- 4. KENDARAAN REAL (Terhubung ke Pelanggan)
insert into public.kendaraan (id_kendaraan, id_pelanggan, merk, tipe, tahun, nopol, kilometer) values
('kd-001', 'pl-001', 'Honda', 'Vario 160', 2023, 'D 4521 ABC', 12400),
('kd-002', 'pl-002', 'Yamaha', 'NMAX 155', 2022, 'D 2819 KJ', 21300),
('kd-003', 'pl-003', 'Honda', 'Beat Street', 2021, 'D 6390 ZX', 34200);

-- 5. SPAREPART REAL (Mendukung Kode Bebas Non-Urut)
insert into public.sparepart (id_sparepart, kode, nama, nama_sparepart, kategori, satuan, harga, stok, stok_tersedia, stok_minimum, status_stok) values
('sp-001', 'OIL-MPX2', 'Oli Mesin AHM MPX2 0.8L', 'Oli Mesin AHM MPX2 0.8L', 'Pelumas', 'Botol', 55000, 40, 40, 10, 'tersedia'),
('sp-002', 'SP-009', 'Filter Udara Honda Matic', 'Filter Udara Honda Matic', 'Filter', 'Pcs', 45000, 25, 25, 5, 'tersedia'),
('sp-003', 'SP-003', 'Busi NGK Laser Iridium', 'Busi NGK Laser Iridium', 'Pengapian', 'Pcs', 35000, 30, 30, 5, 'tersedia'),
('sp-004', 'SP-015', 'Kampas Rem Depan Nissin', 'Kampas Rem Depan Nissin', 'Pengereman', 'Set', 65000, 18, 18, 5, 'tersedia'),
('sp-005', 'OIL-GARD', 'Oli Gardan AHM 120ml', 'Oli Gardan AHM 120ml', 'Pelumas', 'Botol', 18000, 35, 35, 10, 'tersedia'),
('sp-006', 'VBL-NMAX', 'V-Belt Kit Yamaha NMAX Original', 'V-Belt Kit Yamaha NMAX Original', 'Transmisi', 'Set', 145000, 12, 12, 3, 'tersedia');

-- 6. BOOKING SERVIS REAL (Terhubung ke Pelanggan, Kendaraan, dan Mekanik)
insert into public.booking_servis (id_booking, nomor_booking, id_pelanggan, id_kendaraan, tanggal_booking, waktu_booking, jenis_servis, keluhan, mekanik_diinginkan, status_booking) values
('bk-001', 'BK-2026-0001', 'pl-001', 'kd-001', current_date - interval '4 days', '09:00', 'Servis Berkala', 'Ganti oli mesin dan oli gardan rutin', 'Joko', 'disetujui'),
('bk-002', 'BK-2026-0002', 'pl-002', 'kd-002', current_date - interval '2 days', '10:30', 'Servis CVT & Rem', 'Tarikan CVT bergetar dan rem depan bunyi', 'Dedi', 'disetujui'),
('bk-003', 'BK-2026-0003', 'pl-003', 'kd-003', current_date, '13:00', 'Tune Up', 'Tarikan gas agak tersendat', 'Rudi', 'disetujui');

-- 7. SERVIS OPERASIONAL REAL (Mekanik: Joko, Dedi, Rudi)
-- Servis 1: Ahmad Fauzi (Mekanik: Joko, Status: Selesai Dibayar / Lunas)
insert into public.servis (id_servis, nomor_servis, id_booking, id_pelanggan, id_kendaraan, mekanik, jenis_servis, keluhan, pekerjaan, hasil_pemeriksaan, biaya_jasa, biaya_sparepart, total_biaya, status_servis, tanggal_servis, catatan, created_at) values
('srv-001', 'SRV-2026-0001', 'bk-001', 'pl-001', 'kd-001', 'Joko', 'Servis Berkala & Ganti Oli', 'Ganti oli rutin berkala', 'Ganti oli mesin + oli gardan', 'Kondisi mesin sehat, oli lama sudah hitam pekat', 55000, 73000, 128000, 'lunas', current_date - interval '4 days', 'Selesai tepat waktu, performa kembali prima', now() - interval '4 days');

-- Servis 2: Siti Rahmawati (Mekanik: Dedi, Status: Selesai Dibayar / Lunas)
insert into public.servis (id_servis, nomor_servis, id_booking, id_pelanggan, id_kendaraan, mekanik, jenis_servis, keluhan, pekerjaan, hasil_pemeriksaan, biaya_jasa, biaya_sparepart, total_biaya, status_servis, tanggal_servis, catatan, created_at) values
('srv-002', 'SRV-2026-0002', 'bk-002', 'pl-002', 'kd-002', 'Dedi', 'Ganti V-Belt & Kampas Rem', 'CVT getar dan rem bunyi', 'Ganti V-Belt NMAX & kampas rem depan', 'V-Belt retak, kampas rem depan menipis sisa 15%', 70000, 210000, 280000, 'lunas', current_date - interval '2 days', 'Penggantian part orisinil selesai', now() - interval '2 days');

-- Servis 3: Rian Pratama (Mekanik: Rudi, Status: Diproses)
insert into public.servis (id_servis, nomor_servis, id_booking, id_pelanggan, id_kendaraan, mekanik, jenis_servis, keluhan, pekerjaan, hasil_pemeriksaan, biaya_jasa, biaya_sparepart, total_biaya, status_servis, tanggal_servis, catatan, created_at) values
('srv-003', 'SRV-2026-0003', 'bk-003', 'pl-003', 'kd-003', 'Rudi', 'Tune Up & Ganti Busi', 'Tarikan tersendat', 'Pembersihan throttle body & ganti busi + filter', 'Busi elektroda aus, filter udara kotor', 50000, 80000, 130000, 'diproses', current_date, 'Sedang pengerjaan perakitan busi baru', now());

-- 8. DETAIL SERVIS (Sparepart Terpakai Pada Servis)
insert into public.detail_servis (id_detail, id_detail_servis, id_servis, id_sparepart, jumlah, qty, harga, harga_satuan, subtotal, keterangan) values
('dt-001', 'dt-001', 'srv-001', 'sp-001', 1, 1, 55000, 55000, 55000, 'Oli Mesin AHM MPX2'),
('dt-002', 'dt-002', 'srv-001', 'sp-005', 1, 1, 18000, 18000, 18000, 'Oli Gardan AHM'),
('dt-003', 'dt-003', 'srv-002', 'sp-006', 1, 1, 145000, 145000, 145000, 'V-Belt Kit NMAX'),
('dt-004', 'dt-004', 'srv-002', 'sp-004', 1, 1, 65000, 65000, 65000, 'Kampas Rem Depan Nissin'),
('dt-005', 'dt-005', 'srv-003', 'sp-003', 1, 1, 35000, 35000, 35000, 'Busi NGK Iridium'),
('dt-006', 'dt-006', 'srv-003', 'sp-002', 1, 1, 45000, 45000, 45000, 'Filter Udara Matic');

-- Penggunaan Sparepart
insert into public.penggunaan_sparepart (id_penggunaan_sparepart, id_sparepart, id_servis, tanggal, jumlah, qty, total_harga, mekanik, keterangan) values
('pg-001', 'sp-001', 'srv-001', current_date - interval '4 days', 1, 1, 55000, 'Joko', 'Penggunaan oli mesin servis SRV-2026-0001'),
('pg-002', 'sp-005', 'srv-001', current_date - interval '4 days', 1, 1, 18000, 'Joko', 'Penggunaan oli gardan servis SRV-2026-0001'),
('pg-003', 'sp-006', 'srv-002', current_date - interval '2 days', 1, 1, 145000, 'Dedi', 'Penggantian V-Belt NMAX servis SRV-2026-0002'),
('pg-004', 'sp-004', 'srv-002', current_date - interval '2 days', 1, 1, 65000, 'Dedi', 'Penggantian kampas rem depan servis SRV-2026-0002');

-- 9. PEMBAYARAN TRANSAKSI (Lunas & Terkoneksi)
insert into public.pembayaran (id_pembayaran, nomor_transaksi, no_transaksi, id_servis, id_pelanggan, metode, metode_pembayaran, tanggal_bayar, total_bayar, jumlah_bayar, status, status_pembayaran) values
('pay-001', 'TRX-2026-0001', 'TRX-2026-0001', 'srv-001', 'pl-001', 'Cash', 'cash', current_date - interval '4 days', 128000, 128000, 'Lunas', 'lunas'),
('pay-002', 'TRX-2026-0002', 'TRX-2026-0002', 'srv-002', 'pl-002', 'Transfer Bank', 'transfer', current_date - interval '2 days', 280000, 280000, 'Lunas', 'lunas');

-- 10. PEMBELIAN DARI SUPPLIER & RIWAYAT STOK (Masuk Ke Laporan)
insert into public.pembelian_sparepart (id_pembelian_sparepart, id_pembelian, nomor_pembelian, id_sparepart, supplier, tanggal, jumlah, harga, total, status) values
('pb-001', 'pb-001', 'BL-2026-001', 'sp-001', 'PT Astra Otoparts', current_date - interval '10 days', 24, 48000, 1152000, 'diterima'),
('pb-002', 'pb-002', 'BL-2026-002', 'sp-006', 'Yamaha Motor Parts', current_date - interval '8 days', 10, 125000, 1250000, 'diterima'),
('pb-003', 'pb-003', 'BL-2026-003', 'sp-004', 'Nissin Brake Official', current_date - interval '6 days', 15, 55000, 825000, 'diterima');

insert into public.riwayat_stok (id_riwayat_stok, id_riwayat, id_sparepart, tipe, jenis, qty, jumlah, tanggal, keterangan) values
('rw-001', 'rw-001', 'sp-001', 'masuk', 'masuk', 24, 24, current_date - interval '10 days', 'Pembelian supplier PT Astra Otoparts'),
('rw-002', 'rw-002', 'sp-006', 'masuk', 'masuk', 10, 10, current_date - interval '8 days', 'Pembelian supplier Yamaha Motor Parts'),
('rw-003', 'rw-003', 'sp-004', 'masuk', 'masuk', 15, 15, current_date - interval '6 days', 'Pembelian supplier Nissin Brake Official'),
('rw-004', 'rw-004', 'sp-001', 'keluar', 'keluar', 1, 1, current_date - interval '4 days', 'Digunakan untuk servis SRV-2026-0001 (Ahmad Fauzi)'),
('rw-005', 'rw-005', 'sp-005', 'keluar', 'keluar', 1, 1, current_date - interval '4 days', 'Digunakan untuk servis SRV-2026-0001 (Ahmad Fauzi)'),
('rw-006', 'rw-006', 'sp-006', 'keluar', 'keluar', 1, 1, current_date - interval '2 days', 'Digunakan untuk servis SRV-2026-0002 (Siti Rahmawati)'),
('rw-007', 'rw-007', 'sp-004', 'keluar', 'keluar', 1, 1, current_date - interval '2 days', 'Digunakan untuk servis SRV-2026-0002 (Siti Rahmawati)');

-- ----------------------------------------------------------------------------
-- TAHAP 4: REFRESH CACHE SUPABASE
-- ----------------------------------------------------------------------------
notify pgrst, 'reload schema';

