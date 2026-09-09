-- ============================================================================
-- APPBENK: SETUP DATABASE LENGKAP & DATA REAL BERURUTAN
-- Urutan Eksekusi: Admin → Owner → Mekanik → Pelanggan → Kendaraan →
--                 Sparepart → Servis → Detail Servis → Pembayaran →
--                 Pembelian & Riwayat Stok → Laporan
-- ============================================================================

-- ----------------------------------------------------------------------------
-- TAHAP 1: EXTENSIONS & TABEL STRUKTUR (SCHEMA)
-- ----------------------------------------------------------------------------

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. Profiles
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text not null unique,
  phone text,
  role text not null default 'pelanggan' check (role in ('admin', 'owner', 'pelanggan')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Admin Bengkel
create table if not exists public.admin (
  id_admin uuid primary key default gen_random_uuid(),
  user_id uuid,
  nama text not null,
  email text not null unique,
  no_hp text,
  status text not null default 'aktif' check (status in ('aktif', 'nonaktif')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Owner Bengkel
create table if not exists public.owner (
  id_owner uuid primary key default gen_random_uuid(),
  user_id uuid,
  nama text not null,
  email text not null unique,
  no_hp text,
  status text not null default 'aktif' check (status in ('aktif', 'nonaktif')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Pelanggan
create table if not exists public.pelanggan (
  id_pelanggan uuid primary key default gen_random_uuid(),
  user_id uuid,
  nama text not null,
  no_hp text,
  email text not null unique,
  password text,
  alamat text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Kendaraan
create table if not exists public.kendaraan (
  id_kendaraan uuid primary key default gen_random_uuid(),
  id_pelanggan uuid not null references public.pelanggan(id_pelanggan) on delete cascade,
  merk text not null,
  tipe text not null,
  tahun integer not null default 2022,
  nopol text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Sparepart (Kode Bebas Non-Urut: SP-009, SP-003, SP-015, OIL-MPX2, dll)
create table if not exists public.sparepart (
  id_sparepart text primary key,
  nama_sparepart text not null,
  kategori text not null,
  satuan text not null,
  harga numeric(14,2) not null default 0,
  stok_tersedia integer not null default 0,
  stok_minimum integer not null default 5,
  status_stok text not null default 'tersedia' check (status_stok in ('tersedia', 'menipis', 'habis')),
  tanggal_update timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 7. Booking Servis
create table if not exists public.booking_servis (
  id_booking uuid primary key default gen_random_uuid(),
  nomor_booking text unique not null,
  id_pelanggan uuid not null references public.pelanggan(id_pelanggan) on delete cascade,
  id_kendaraan uuid not null references public.kendaraan(id_kendaraan) on delete cascade,
  tanggal_booking date not null,
  waktu_booking time not null,
  jenis_servis text not null,
  keluhan text not null,
  mekanik_diinginkan text,
  status_booking text not null default 'menunggu_konfirmasi',
  alasan_penolakan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 8. Servis
create table if not exists public.servis (
  id_servis uuid primary key default gen_random_uuid(),
  nomor_servis text unique not null,
  id_booking uuid references public.booking_servis(id_booking) on delete set null,
  id_pelanggan uuid not null references public.pelanggan(id_pelanggan) on delete cascade,
  id_kendaraan uuid not null references public.kendaraan(id_kendaraan) on delete cascade,
  mekanik text,
  jenis_servis text,
  keluhan text,
  hasil_pemeriksaan text,
  estimasi_biaya numeric(14,2) not null default 0,
  estimasi_waktu text,
  biaya_jasa numeric(14,2) not null default 0,
  biaya_sparepart numeric(14,2) not null default 0,
  total_biaya numeric(14,2) not null default 0,
  status_servis text not null default 'menunggu',
  tanggal_mulai timestamptz,
  estimasi_selesai timestamptz,
  tanggal_selesai timestamptz,
  catatan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. Detail Servis (Katalog Sparepart Terpakai per Servis)
create table if not exists public.detail_servis (
  id_detail_servis uuid primary key default gen_random_uuid(),
  id_servis uuid not null references public.servis(id_servis) on delete cascade,
  id_sparepart text references public.sparepart(id_sparepart) on delete restrict,
  jumlah integer not null default 1,
  keterangan text,
  harga numeric(14,2) not null default 0,
  created_at timestamptz not null default now()
);

-- 10. Penggunaan Sparepart
create table if not exists public.penggunaan_sparepart (
  id_penggunaan_sparepart uuid primary key default gen_random_uuid(),
  id_sparepart text not null references public.sparepart(id_sparepart) on delete restrict,
  id_servis uuid not null references public.servis(id_servis) on delete cascade,
  tanggal date not null default current_date,
  jumlah integer not null default 1,
  mekanik text,
  keterangan text,
  created_at timestamptz not null default now()
);

-- 11. Pembayaran (Transaksi Keuangan Servis)
create table if not exists public.pembayaran (
  id_pembayaran uuid primary key default gen_random_uuid(),
  nomor_transaksi text unique not null,
  id_servis uuid not null references public.servis(id_servis) on delete cascade,
  id_pelanggan uuid not null references public.pelanggan(id_pelanggan) on delete cascade,
  metode_pembayaran text not null,
  tanggal_bayar timestamptz,
  jumlah_bayar numeric(14,2) not null default 0,
  status_pembayaran text not null default 'belum_dibayar',
  bukti_pembayaran text,
  alasan_penolakan text,
  verified_by uuid,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 12. Pembelian Sparepart dari Supplier
create table if not exists public.pembelian_sparepart (
  id_pembelian_sparepart uuid primary key default gen_random_uuid(),
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

-- 13. Riwayat Stok
create table if not exists public.riwayat_stok (
  id_riwayat_stok uuid primary key default gen_random_uuid(),
  id_sparepart text not null references public.sparepart(id_sparepart) on delete cascade,
  jenis text not null check (jenis in ('masuk', 'keluar', 'penyesuaian')),
  jumlah integer not null default 1,
  tanggal timestamptz not null default now(),
  keterangan text,
  created_at timestamptz not null default now()
);

-- 14. Stok Opname
create table if not exists public.stok_opname (
  id_stok_opname uuid primary key default gen_random_uuid(),
  tanggal date not null default current_date,
  keterangan text,
  total_item integer not null default 0,
  selisih_total integer not null default 0,
  created_at timestamptz not null default now()
);

-- 15. Retur Sparepart
create table if not exists public.retur_sparepart (
  id_retur_sparepart uuid primary key default gen_random_uuid(),
  id_pembelian_sparepart uuid references public.pembelian_sparepart(id_pembelian_sparepart) on delete set null,
  id_sparepart text not null references public.sparepart(id_sparepart) on delete restrict,
  jumlah integer not null default 1,
  tanggal date not null default current_date,
  alasan text not null,
  status text not null default 'diproses',
  created_at timestamptz not null default now()
);

-- 16. Laporan Ringkasan Stok
create table if not exists public.laporan_ringkasan_stok (
  id_ringkasan_stok uuid primary key default gen_random_uuid(),
  id_sparepart text not null references public.sparepart(id_sparepart) on delete cascade,
  stok_awal integer not null default 0,
  stok_masuk integer not null default 0,
  stok_keluar integer not null default 0,
  stok_akhir integer not null default 0,
  periode text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- TAHAP 2: KEAMANAN ROW LEVEL SECURITY (RLS)
-- Diaktifkan dengan policy yang mengizinkan akses operasional aplikasi
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
alter table public.stok_opname enable row level security;
alter table public.retur_sparepart enable row level security;
alter table public.laporan_ringkasan_stok enable row level security;

-- Policies
do $$
declare
  t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public'
  loop
    execute format('drop policy if exists "allow_all_operations" on public.%I;', t);
    execute format('create policy "allow_all_operations" on public.%I for all using (true) with check (true);', t);
  end loop;
end $$;

-- ----------------------------------------------------------------------------
-- TAHAP 3: SEED DATA REAL BERURUTAN (TERHUBUNG 100%)
-- ----------------------------------------------------------------------------

-- Bersihkan data lama jika ada agar tidak terjadi duplikasi key
delete from public.detail_servis;
delete from public.penggunaan_sparepart;
delete from public.pembayaran;
delete from public.servis;
delete from public.booking_servis;
delete from public.kendaraan;
delete from public.pembelian_sparepart;
delete from public.riwayat_stok;
delete from public.retur_sparepart;
delete from public.laporan_ringkasan_stok;
delete from public.sparepart;
delete from public.pelanggan;
delete from public.admin;
delete from public.owner;
delete from public.profiles;

-- 1. ADMIN BENGKEL REAL
insert into public.profiles (id, full_name, email, phone, role)
values ('a0000000-0000-0000-0000-000000000001', 'Budi Santoso', 'admin@bengkel.com', '081234567890', 'admin')
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

insert into public.admin (id_admin, nama, email, no_hp, status)
values ('a0000000-0000-0000-0000-000000000001', 'Budi Santoso', 'admin@bengkel.com', '081234567890', 'aktif')
on conflict (email) do update set nama = excluded.nama;

-- 2. OWNER BENGKEL REAL
insert into public.profiles (id, full_name, email, phone, role)
values ('a0000000-0000-0000-0000-000000000002', 'Hendra Wijaya', 'owner@bengkel.com', '081299887766', 'owner')
on conflict (id) do update set full_name = excluded.full_name, role = excluded.role;

insert into public.owner (id_owner, nama, email, no_hp, status)
values ('a0000000-0000-0000-0000-000000000002', 'Hendra Wijaya', 'owner@bengkel.com', '081299887766', 'aktif')
on conflict (email) do update set nama = excluded.nama;

-- 3. PELANGGAN REAL (3 Pelanggan)
insert into public.pelanggan (id_pelanggan, nama, email, no_hp, alamat) values
('c0000000-0000-0000-0000-000000000001', 'Ahmad Fauzi', 'ahmad.fauzi@gmail.com', '081288991122', 'Jl. Riau No. 45, Bandung'),
('c0000000-0000-0000-0000-000000000002', 'Siti Rahmawati', 'siti.rahma@yahoo.com', '085711229090', 'Jl. Cihampelas No. 12, Bandung'),
('c0000000-0000-0000-0000-000000000003', 'Rian Pratama', 'rian.pratama@gmail.com', '082133445566', 'Jl. Soekarno Hatta No. 102, Bandung');

insert into public.profiles (id, full_name, email, phone, role) values
('c0000000-0000-0000-0000-000000000001', 'Ahmad Fauzi', 'ahmad.fauzi@gmail.com', '081288991122', 'pelanggan'),
('c0000000-0000-0000-0000-000000000002', 'Siti Rahmawati', 'siti.rahma@yahoo.com', '085711229090', 'pelanggan'),
('c0000000-0000-0000-0000-000000000003', 'Rian Pratama', 'rian.pratama@gmail.com', '082133445566', 'pelanggan')
on conflict (id) do nothing;

-- 4. KENDARAAN REAL (Terhubung ke Pelanggan)
insert into public.kendaraan (id_kendaraan, id_pelanggan, merk, tipe, tahun, nopol) values
('e0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'Honda', 'Vario 160', 2023, 'D 4521 ABC'),
('e0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'Yamaha', 'NMAX 155', 2022, 'D 2819 KJ'),
('e0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'Honda', 'Beat Street', 2021, 'D 6390 ZX');

-- 5. SPAREPART REAL (Kode Bebas Non-Urut)
insert into public.sparepart (id_sparepart, nama_sparepart, kategori, satuan, harga, stok_tersedia, stok_minimum, status_stok) values
('SP-009', 'Filter Udara Honda Matic', 'Filter', 'Pcs', 45000, 25, 5, 'tersedia'),
('SP-003', 'Busi NGK Laser Iridium', 'Pengapian', 'Pcs', 35000, 30, 5, 'tersedia'),
('SP-015', 'Kampas Rem Depan Nissin', 'Pengereman', 'Set', 65000, 18, 5, 'tersedia'),
('OIL-MPX2', 'Oli Mesin AHM MPX2 0.8L', 'Pelumas', 'Botol', 55000, 40, 10, 'tersedia'),
('OIL-GARD', 'Oli Gardan AHM 120ml', 'Pelumas', 'Botol', 18000, 35, 10, 'tersedia'),
('VBL-NMAX', 'V-Belt Kit Yamaha NMAX Original', 'Transmisi', 'Set', 145000, 12, 3, 'tersedia');

-- 6. BOOKING SERVIS REAL (Terhubung ke Pelanggan, Kendaraan, dan Mekanik)
insert into public.booking_servis (id_booking, nomor_booking, id_pelanggan, id_kendaraan, tanggal_booking, waktu_booking, jenis_servis, keluhan, mekanik_diinginkan, status_booking) values
('b0000000-0000-0000-0000-000000000001', 'BK-2026-0001', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', current_date - interval '4 days', '09:00', 'Servis Berkala', 'Ganti oli mesin dan oli gardan rutin', 'Joko', 'lunas'),
('b0000000-0000-0000-0000-000000000002', 'BK-2026-0002', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', current_date - interval '2 days', '10:30', 'Servis CVT & Rem', 'Tarikan CVT bergetar dan rem depan bunyi', 'Dedi', 'lunas'),
('b0000000-0000-0000-0000-000000000003', 'BK-2026-0003', 'c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', current_date, '13:00', 'Tune Up', 'Tarikan gas agak tersendat', 'Rudi', 'disetujui');

-- 7. SERVIS OPERASIONAL REAL (Terhubung ke Pelanggan, Kendaraan, dan Mekanik)
-- Servis 1: Ahmad Fauzi (Mekanik: Joko, Status: Lunas)
insert into public.servis (id_servis, nomor_servis, id_booking, id_pelanggan, id_kendaraan, mekanik, jenis_servis, keluhan, hasil_pemeriksaan, biaya_jasa, biaya_sparepart, total_biaya, status_servis, catatan, created_at) values
('f0000000-0000-0000-0000-000000000001', 'SRV-2026-0001', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Joko', 'Servis Berkala & Ganti Oli', 'Ganti oli rutin berkala', 'Kondisi mesin sehat, oli lama sudah hitam pekat', 55000, 73000, 128000, 'lunas', 'Selesai tepat waktu, pelanggan puas', now() - interval '4 days');

-- Servis 2: Siti Rahmawati (Mekanik: Dedi, Status: Lunas)
insert into public.servis (id_servis, nomor_servis, id_booking, id_pelanggan, id_kendaraan, mekanik, jenis_servis, keluhan, hasil_pemeriksaan, biaya_jasa, biaya_sparepart, total_biaya, status_servis, catatan, created_at) values
('f0000000-0000-0000-0000-000000000002', 'SRV-2026-0002', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000002', 'Dedi', 'Ganti V-Belt & Kampas Rem', 'CVT getar dan rem bunyi', 'V-Belt retak-retak, kampas rem depan menipis sisa 15%', 70000, 210000, 280000, 'lunas', 'Penggantian part orisinil selesai', now() - interval '2 days');

-- Servis 3: Rian Pratama (Mekanik: Rudi, Status: Diproses)
insert into public.servis (id_servis, nomor_servis, id_booking, id_pelanggan, id_kendaraan, mekanik, jenis_servis, keluhan, hasil_pemeriksaan, biaya_jasa, biaya_sparepart, total_biaya, status_servis, catatan, created_at) values
('f0000000-0000-0000-0000-000000000003', 'SRV-2026-0003', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'Rudi', 'Tune Up & Ganti Busi', 'Tarikan tersendat', 'Busi elektroda aus, filter udara kotor debu tebal', 50000, 80000, 130000, 'diproses', 'Sedang pengerjaan pemasangan busi baru', now());

-- 8. DETAIL SERVIS REAL (Menghubungkan Servis dan Sparepart)
-- Sparepart untuk Servis 1 (OIL-MPX2 + OIL-GARD)
insert into public.detail_servis (id_detail_servis, id_servis, id_sparepart, jumlah, harga, keterangan) values
('d0000000-0000-0000-0000-000000000001', 'f0000000-0000-0000-0000-000000000001', 'OIL-MPX2', 1, 55000, 'Oli Mesin AHM MPX2'),
('d0000000-0000-0000-0000-000000000002', 'f0000000-0000-0000-0000-000000000001', 'OIL-GARD', 1, 18000, 'Oli Gardan AHM');

-- Sparepart untuk Servis 2 (VBL-NMAX + SP-015)
insert into public.detail_servis (id_detail_servis, id_servis, id_sparepart, jumlah, harga, keterangan) values
('d0000000-0000-0000-0000-000000000003', 'f0000000-0000-0000-0000-000000000002', 'VBL-NMAX', 1, 145000, 'V-Belt Kit NMAX'),
('d0000000-0000-0000-0000-000000000004', 'f0000000-0000-0000-0000-000000000002', 'SP-015', 1, 65000, 'Kampas Rem Depan Nissin');

-- Sparepart untuk Servis 3 (SP-003 + SP-009)
insert into public.detail_servis (id_detail_servis, id_servis, id_sparepart, jumlah, harga, keterangan) values
('d0000000-0000-0000-0000-000000000005', 'f0000000-0000-0000-0000-000000000003', 'SP-003', 1, 35000, 'Busi NGK Iridium'),
('d0000000-0000-0000-0000-000000000006', 'f0000000-0000-0000-0000-000000000003', 'SP-009', 1, 45000, 'Filter Udara Matic');

-- Catat juga ke tabel penggunaan sparepart
insert into public.penggunaan_sparepart (id_penggunaan_sparepart, id_sparepart, id_servis, tanggal, jumlah, mekanik, keterangan) values
('u0000000-0000-0000-0000-000000000001', 'OIL-MPX2', 'f0000000-0000-0000-0000-000000000001', current_date - interval '4 days', 1, 'Joko', 'Penggunaan oli mesin'),
('u0000000-0000-0000-0000-000000000002', 'OIL-GARD', 'f0000000-0000-0000-0000-000000000001', current_date - interval '4 days', 1, 'Joko', 'Penggunaan oli gardan'),
('u0000000-0000-0000-0000-000000000003', 'VBL-NMAX', 'f0000000-0000-0000-0000-000000000002', current_date - interval '2 days', 1, 'Dedi', 'Penggantian V-Belt NMAX'),
('u0000000-0000-0000-0000-000000000004', 'SP-015', 'f0000000-0000-0000-0000-000000000002', current_date - interval '2 days', 1, 'Dedi', 'Penggantian kampas rem depan');

-- 9. PEMBAYARAN REAL (Terhubung ke Servis & Pelanggan)
insert into public.pembayaran (id_pembayaran, nomor_transaksi, id_servis, id_pelanggan, metode_pembayaran, tanggal_bayar, jumlah_bayar, status_pembayaran) values
('p0000000-0000-0000-0000-000000000001', 'TRX-2026-0001', 'f0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'cash', now() - interval '4 days', 128000, 'lunas'),
('p0000000-0000-0000-0000-000000000002', 'TRX-2026-0002', 'f0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'transfer', now() - interval '2 days', 280000, 'lunas');

-- 10. PEMBELIAN DARI SUPPLIER & RIWAYAT STOK (Untuk Laporan & Stok Real)
insert into public.pembelian_sparepart (id_pembelian_sparepart, nomor_pembelian, id_sparepart, supplier, tanggal, jumlah, harga, total, status) values
('s0000000-0000-0000-0000-000000000001', 'BL-2026-001', 'OIL-MPX2', 'PT Astra Otoparts', current_date - interval '10 days', 24, 48000, 1152000, 'diterima'),
('s0000000-0000-0000-0000-000000000002', 'BL-2026-002', 'VBL-NMAX', 'Yamaha Motor Parts', current_date - interval '8 days', 10, 125000, 1250000, 'diterima'),
('s0000000-0000-0000-0000-000000000003', 'BL-2026-003', 'SP-015', 'Nissin Brake Official', current_date - interval '6 days', 15, 55000, 825000, 'diterima');

insert into public.riwayat_stok (id_sparepart, jenis, jumlah, tanggal, keterangan) values
('OIL-MPX2', 'masuk', 24, now() - interval '10 days', 'Pembelian supplier PT Astra Otoparts'),
('VBL-NMAX', 'masuk', 10, now() - interval '8 days', 'Pembelian supplier Yamaha Motor Parts'),
('SP-015', 'masuk', 15, now() - interval '6 days', 'Pembelian supplier Nissin Brake Official'),
('OIL-MPX2', 'keluar', 1, now() - interval '4 days', 'Digunakan untuk servis SRV-2026-0001 (Ahmad Fauzi)'),
('OIL-GARD', 'keluar', 1, now() - interval '4 days', 'Digunakan untuk servis SRV-2026-0001 (Ahmad Fauzi)'),
('VBL-NMAX', 'keluar', 1, now() - interval '2 days', 'Digunakan untuk servis SRV-2026-0002 (Siti Rahmawati)'),
('SP-015', 'keluar', 1, now() - interval '2 days', 'Digunakan untuk servis SRV-2026-0002 (Siti Rahmawati)');

-- ----------------------------------------------------------------------------
-- TAHAP 4: REFRESH SCHEMA CACHE SUPABASE
-- ----------------------------------------------------------------------------
notify pgrst, 'reload schema';

