-- ============================================================================
-- APPBENK: SISTEM BENGKEL TERPADU
-- Master Database Migration (PostgreSQL / Supabase)
-- 15 Entities:
--   1. pelanggan
--   2. kendaraan
--   3. booking_servis
--   4. servis
--   5. pembayaran
--   6. detail_servis
--   7. pembelian_sparepart
--   8. penggunaan_sparepart
--   9. sparepart
--  10. riwayat_stok
--  11. stok_opname
--  12. retur_sparepart
--  13. laporan_ringkasan_stok
--  14. admin
--  15. owner
-- ============================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- Enum Types
do $$ begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('admin', 'pelanggan', 'owner');
  end if;
  if not exists (select 1 from pg_type where typname = 'status_booking_enum') then
    create type public.status_booking_enum as enum (
      'menunggu_konfirmasi',
      'disetujui',
      'ditolak',
      'menunggu_servis',
      'sedang_dikerjakan',
      'selesai',
      'menunggu_pembayaran',
      'lunas'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'status_servis_enum') then
    create type public.status_servis_enum as enum (
      'menunggu',
      'diproses',
      'selesai',
      'menunggu_pembayaran',
      'lunas'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'status_pembayaran_enum') then
    create type public.status_pembayaran_enum as enum (
      'belum_dibayar',
      'menunggu_verifikasi',
      'lunas',
      'ditolak'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'metode_pembayaran_enum') then
    create type public.metode_pembayaran_enum as enum (
      'cash',
      'transfer',
      'qris'
    );
  end if;
  if not exists (select 1 from pg_type where typname = 'jenis_riwayat_stok_enum') then
    create type public.jenis_riwayat_stok_enum as enum (
      'masuk',
      'keluar',
      'penyesuaian'
    );
  end if;
end $$;

-- ----------------------------------------------------------------------------
-- PROFILES (Supabase Auth Integration Bridge)
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  phone text,
  role public.app_role not null default 'pelanggan',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 1. PELANGGAN
-- ----------------------------------------------------------------------------
create table if not exists public.pelanggan (
  id_pelanggan uuid primary key default gen_random_uuid(),
  user_id uuid unique references auth.users(id) on delete set null,
  nama text not null,
  no_hp text,
  email text not null unique,
  password text, -- Optional / hashed if standalone auth; stays in auth.users when using Supabase Auth
  alamat text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. KENDARAAN (Pelanggan 1 : M Kendaraan)
-- ----------------------------------------------------------------------------
create table if not exists public.kendaraan (
  id_kendaraan uuid primary key default gen_random_uuid(),
  id_pelanggan uuid not null references public.pelanggan(id_pelanggan) on delete cascade,
  merk text not null,
  tipe text not null,
  tahun integer not null check (tahun >= 1900 and tahun <= 2100),
  nopol text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 9. SPAREPART & STOK
-- ----------------------------------------------------------------------------
create table if not exists public.sparepart (
  id_sparepart text primary key, -- contoh: 'SP-001', 'SP-002'
  nama_sparepart text not null,
  kategori text not null,
  satuan text not null,
  harga numeric(14,2) not null check (harga >= 0),
  stok_tersedia integer not null default 0 check (stok_tersedia >= 0),
  stok_minimum integer not null default 5 check (stok_minimum >= 0),
  status_stok text not null default 'tersedia' check (status_stok in ('tersedia', 'menipis', 'habis')),
  tanggal_update timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. BOOKING SERVIS (Pelanggan 1:M Booking, Kendaraan 1:M Booking)
-- ----------------------------------------------------------------------------
create table if not exists public.booking_servis (
  id_booking uuid primary key default gen_random_uuid(),
  nomor_booking text unique not null,
  id_pelanggan uuid not null references public.pelanggan(id_pelanggan) on delete cascade,
  id_kendaraan uuid not null references public.kendaraan(id_kendaraan) on delete restrict,
  tanggal_booking date not null,
  waktu_booking time not null,
  jenis_servis text not null,
  keluhan text not null,
  mekanik_diinginkan text,
  status_booking text not null default 'menunggu_konfirmasi' check (
    status_booking in (
      'menunggu_konfirmasi',
      'disetujui',
      'ditolak',
      'menunggu_servis',
      'sedang_dikerjakan',
      'selesai',
      'menunggu_pembayaran',
      'lunas'
    )
  ),
  alasan_penolakan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rejected_booking_requires_reason check (
    status_booking <> 'ditolak' or nullif(trim(alasan_penolakan), '') is not null
  )
);

-- ----------------------------------------------------------------------------
-- 4. SERVIS (Booking Servis 1 : 1 Servis)
-- ----------------------------------------------------------------------------
create table if not exists public.servis (
  id_servis uuid primary key default gen_random_uuid(),
  nomor_servis text unique not null,
  id_booking uuid unique references public.booking_servis(id_booking) on delete set null,
  id_pelanggan uuid not null references public.pelanggan(id_pelanggan) on delete restrict,
  id_kendaraan uuid not null references public.kendaraan(id_kendaraan) on delete restrict,
  mekanik text,
  jenis_servis text,
  keluhan text,
  hasil_pemeriksaan text,
  estimasi_biaya numeric(14,2) not null default 0 check (estimasi_biaya >= 0),
  estimasi_waktu text,
  biaya_jasa numeric(14,2) not null default 0 check (biaya_jasa >= 0),
  biaya_sparepart numeric(14,2) not null default 0 check (biaya_sparepart >= 0),
  total_biaya numeric(14,2) not null default 0 check (total_biaya >= 0),
  status_servis text not null default 'menunggu' check (
    status_servis in ('menunggu', 'diproses', 'selesai', 'menunggu_pembayaran', 'lunas')
  ),
  tanggal_mulai timestamptz,
  estimasi_selesai timestamptz,
  tanggal_selesai timestamptz,
  catatan text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. PEMBAYARAN (Servis 1 : 1 Pembayaran)
-- ----------------------------------------------------------------------------
create table if not exists public.pembayaran (
  id_pembayaran uuid primary key default gen_random_uuid(),
  nomor_transaksi text unique not null,
  id_servis uuid unique not null references public.servis(id_servis) on delete cascade,
  id_pelanggan uuid not null references public.pelanggan(id_pelanggan) on delete restrict,
  metode_pembayaran text not null check (metode_pembayaran in ('cash', 'transfer', 'qris')),
  tanggal_bayar timestamptz,
  jumlah_bayar numeric(14,2) not null default 0 check (jumlah_bayar >= 0),
  status_pembayaran text not null default 'belum_dibayar' check (
    status_pembayaran in ('belum_dibayar', 'menunggu_verifikasi', 'lunas', 'ditolak')
  ),
  bukti_pembayaran text,
  alasan_penolakan text,
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint transfer_requires_proof check (
    metode_pembayaran <> 'transfer' or status_pembayaran = 'belum_dibayar' or bukti_pembayaran is not null
  )
);

-- ----------------------------------------------------------------------------
-- 6. DETAIL SERVIS (Servis 1:M Detail Servis, Sparepart 1:M Detail Servis)
-- ----------------------------------------------------------------------------
create table if not exists public.detail_servis (
  id_detail_servis uuid primary key default gen_random_uuid(),
  id_servis uuid not null references public.servis(id_servis) on delete cascade,
  id_sparepart text references public.sparepart(id_sparepart) on delete restrict,
  jumlah integer not null default 1 check (jumlah > 0),
  keterangan text,
  harga numeric(14,2) not null default 0 check (harga >= 0),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 8. PENGGUNAAN SPAREPART (Sparepart 1:M, Servis 1:M)
-- ----------------------------------------------------------------------------
create table if not exists public.penggunaan_sparepart (
  id_penggunaan_sparepart uuid primary key default gen_random_uuid(),
  id_sparepart text not null references public.sparepart(id_sparepart) on delete restrict,
  id_servis uuid not null references public.servis(id_servis) on delete cascade,
  tanggal date not null default current_date,
  jumlah integer not null check (jumlah > 0),
  mekanik text,
  keterangan text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 7. PEMBELIAN SPAREPART (Sparepart 1:M Pembelian Sparepart)
-- ----------------------------------------------------------------------------
create table if not exists public.pembelian_sparepart (
  id_pembelian_sparepart uuid primary key default gen_random_uuid(),
  nomor_pembelian text unique not null,
  id_sparepart text not null references public.sparepart(id_sparepart) on delete restrict,
  supplier text not null,
  tanggal date not null default current_date,
  jumlah integer not null check (jumlah > 0),
  harga numeric(14,2) not null check (harga >= 0),
  total numeric(14,2) not null check (total >= 0),
  status text not null default 'diterima' check (status in ('diterima', 'dibatalkan', 'retur')),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 10. RIWAYAT STOK (Sparepart 1:M Riwayat Stok)
-- ----------------------------------------------------------------------------
create table if not exists public.riwayat_stok (
  id_riwayat_stok uuid primary key default gen_random_uuid(),
  id_sparepart text not null references public.sparepart(id_sparepart) on delete cascade,
  jenis text not null check (jenis in ('masuk', 'keluar', 'penyesuaian')),
  jumlah integer not null check (jumlah > 0),
  tanggal timestamptz not null default now(),
  keterangan text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 11. STOK OPNAME
-- ----------------------------------------------------------------------------
create table if not exists public.stok_opname (
  id_stok_opname uuid primary key default gen_random_uuid(),
  tanggal date not null default current_date,
  keterangan text,
  total_item integer not null default 0,
  selisih_total integer not null default 0,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 12. RETUR SPAREPART (Sparepart 1:M, Pembelian 1:M)
-- ----------------------------------------------------------------------------
create table if not exists public.retur_sparepart (
  id_retur_sparepart uuid primary key default gen_random_uuid(),
  id_pembelian_sparepart uuid references public.pembelian_sparepart(id_pembelian_sparepart) on delete set null,
  id_sparepart text not null references public.sparepart(id_sparepart) on delete restrict,
  jumlah integer not null check (jumlah > 0),
  tanggal date not null default current_date,
  alasan text not null,
  status text not null default 'diproses' check (status in ('diproses', 'disetujui', 'ditolak')),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 13. LAPORAN RINGKASAN STOK (Sparepart 1:M)
-- ----------------------------------------------------------------------------
create table if not exists public.laporan_ringkasan_stok (
  id_ringkasan_stok uuid primary key default gen_random_uuid(),
  id_sparepart text not null references public.sparepart(id_sparepart) on delete cascade,
  stok_awal integer not null default 0,
  stok_masuk integer not null default 0,
  stok_keluar integer not null default 0,
  stok_akhir integer not null default 0,
  periode text not null, -- e.g. '2026-08' atau 'bulanan' / 'tahunan'
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 14. ADMIN
-- ----------------------------------------------------------------------------
create table if not exists public.admin (
  id_admin uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  nama text not null,
  email text not null unique,
  no_hp text,
  status text not null default 'aktif' check (status in ('aktif', 'nonaktif')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 15. OWNER
-- ----------------------------------------------------------------------------
create table if not exists public.owner (
  id_owner uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  nama text not null,
  email text not null unique,
  no_hp text,
  status text not null default 'aktif' check (status in ('aktif', 'nonaktif')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================================
-- INDEXES
-- ============================================================================
create index if not exists idx_pelanggan_email on public.pelanggan(email);
create index if not exists idx_pelanggan_user_id on public.pelanggan(user_id);
create index if not exists idx_kendaraan_pelanggan on public.kendaraan(id_pelanggan);
create index if not exists idx_kendaraan_nopol on public.kendaraan(nopol);

create index if not exists idx_booking_pelanggan on public.booking_servis(id_pelanggan);
create index if not exists idx_booking_kendaraan on public.booking_servis(id_kendaraan);
create index if not exists idx_booking_status on public.booking_servis(status_booking);
create index if not exists idx_booking_tanggal on public.booking_servis(tanggal_booking);

create index if not exists idx_servis_booking on public.servis(id_booking);
create index if not exists idx_servis_pelanggan on public.servis(id_pelanggan);
create index if not exists idx_servis_status on public.servis(status_servis);
create index if not exists idx_servis_estimasi on public.servis(estimasi_selesai);

create index if not exists idx_pembayaran_servis on public.pembayaran(id_servis);
create index if not exists idx_pembayaran_pelanggan on public.pembayaran(id_pelanggan);
create index if not exists idx_pembayaran_status on public.pembayaran(status_pembayaran);

create index if not exists idx_detail_servis_servis on public.detail_servis(id_servis);
create index if not exists idx_detail_servis_sparepart on public.detail_servis(id_sparepart);

create index if not exists idx_penggunaan_servis on public.penggunaan_sparepart(id_servis);
create index if not exists idx_penggunaan_sparepart on public.penggunaan_sparepart(id_sparepart);

create index if not exists idx_pembelian_sparepart on public.pembelian_sparepart(id_sparepart);
create index if not exists idx_riwayat_stok_sparepart on public.riwayat_stok(id_sparepart);
create index if not exists idx_retur_sparepart on public.retur_sparepart(id_sparepart);
create index if not exists idx_laporan_ringkasan_sparepart on public.laporan_ringkasan_stok(id_sparepart);

create index if not exists idx_admin_user_id on public.admin(user_id);
create index if not exists idx_owner_user_id on public.owner(user_id);

-- ============================================================================
-- FUNCTIONS & TRIGGERS (CONSISTENCY & AUTOMATION)
-- ============================================================================

-- Generic Updated At Trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_pelanggan_updated_at on public.pelanggan;
create trigger trg_pelanggan_updated_at before update on public.pelanggan for each row execute procedure public.set_updated_at();

drop trigger if exists trg_kendaraan_updated_at on public.kendaraan;
create trigger trg_kendaraan_updated_at before update on public.kendaraan for each row execute procedure public.set_updated_at();

drop trigger if exists trg_booking_updated_at on public.booking_servis;
create trigger trg_booking_updated_at before update on public.booking_servis for each row execute procedure public.set_updated_at();

drop trigger if exists trg_servis_updated_at on public.servis;
create trigger trg_servis_updated_at before update on public.servis for each row execute procedure public.set_updated_at();

drop trigger if exists trg_pembayaran_updated_at on public.pembayaran;
create trigger trg_pembayaran_updated_at before update on public.pembayaran for each row execute procedure public.set_updated_at();

drop trigger if exists trg_sparepart_updated_at on public.sparepart;
create trigger trg_sparepart_updated_at before update on public.sparepart for each row execute procedure public.set_updated_at();

drop trigger if exists trg_admin_updated_at on public.admin;
create trigger trg_admin_updated_at before update on public.admin for each row execute procedure public.set_updated_at();

drop trigger if exists trg_owner_updated_at on public.owner;
create trigger trg_owner_updated_at before update on public.owner for each row execute procedure public.set_updated_at();

-- Trigger: Otomatisasi Pergerakan Stok saat Penggunaan Sparepart
create or replace function public.trigger_kurangi_stok_penggunaan()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_stok_saat_ini integer;
  v_min integer;
  v_status text;
  v_nomor_servis text;
begin
  -- Kunci baris sparepart untuk mencegah race condition (atomic)
  select stok_tersedia, stok_minimum
  into v_stok_saat_ini, v_min
  from public.sparepart
  where id_sparepart = new.id_sparepart
  for update;

  if not found then
    raise exception 'Sparepart dengan ID % tidak ditemukan.', new.id_sparepart;
  end if;

  if v_stok_saat_ini < new.jumlah then
    raise exception 'Stok tidak mencukupi untuk sparepart %. Tersedia: %, diminta: %',
      new.id_sparepart, v_stok_saat_ini, new.jumlah;
  end if;

  v_stok_saat_ini := v_stok_saat_ini - new.jumlah;

  if v_stok_saat_ini = 0 then
    v_status := 'habis';
  elsif v_stok_saat_ini <= v_min then
    v_status := 'menipis';
  else
    v_status := 'tersedia';
  end if;

  update public.sparepart
  set stok_tersedia = v_stok_saat_ini,
      status_stok = v_status,
      tanggal_update = now(),
      updated_at = now()
  where id_sparepart = new.id_sparepart;

  select nomor_servis into v_nomor_servis from public.servis where id_servis = new.id_servis;

  insert into public.riwayat_stok (
    id_sparepart,
    jenis,
    jumlah,
    tanggal,
    keterangan
  ) values (
    new.id_sparepart,
    'keluar',
    new.jumlah,
    now(),
    coalesce(new.keterangan, 'Digunakan untuk servis ' || coalesce(v_nomor_servis, ''))
  );

  return new;
end;
$$;

drop trigger if exists trg_on_penggunaan_sparepart_created on public.penggunaan_sparepart;
create trigger trg_on_penggunaan_sparepart_created
after insert on public.penggunaan_sparepart
for each row execute procedure public.trigger_kurangi_stok_penggunaan();

-- Trigger: Otomatisasi Pergerakan Stok saat Pembelian Sparepart Diterima
create or replace function public.trigger_tambah_stok_pembelian()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_stok_saat_ini integer;
  v_min integer;
  v_status text;
begin
  if new.status = 'diterima' then
    select stok_tersedia, stok_minimum
    into v_stok_saat_ini, v_min
    from public.sparepart
    where id_sparepart = new.id_sparepart
    for update;

    if not found then
      raise exception 'Sparepart dengan ID % tidak ditemukan.', new.id_sparepart;
    end if;

    v_stok_saat_ini := v_stok_saat_ini + new.jumlah;

    if v_stok_saat_ini = 0 then
      v_status := 'habis';
    elsif v_stok_saat_ini <= v_min then
      v_status := 'menipis';
    else
      v_status := 'tersedia';
    end if;

    update public.sparepart
    set stok_tersedia = v_stok_saat_ini,
        status_stok = v_status,
        tanggal_update = now(),
        updated_at = now()
    where id_sparepart = new.id_sparepart;

    insert into public.riwayat_stok (
      id_sparepart,
      jenis,
      jumlah,
      tanggal,
      keterangan
    ) values (
      new.id_sparepart,
      'masuk',
      new.jumlah,
      now(),
      'Pembelian ' || new.nomor_pembelian || ' · Supplier: ' || new.supplier
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_on_pembelian_sparepart_created on public.pembelian_sparepart;
create trigger trg_on_pembelian_sparepart_created
after insert on public.pembelian_sparepart
for each row execute procedure public.trigger_tambah_stok_pembelian();

-- Trigger: Otomatisasi Retur Sparepart (disetujui)
create or replace function public.trigger_retur_sparepart()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_stok_saat_ini integer;
  v_min integer;
  v_status text;
begin
  if new.status = 'disetujui' and (old is null or old.status <> 'disetujui') then
    select stok_tersedia, stok_minimum
    into v_stok_saat_ini, v_min
    from public.sparepart
    where id_sparepart = new.id_sparepart
    for update;

    if v_stok_saat_ini < new.jumlah then
      raise exception 'Stok tidak mencukupi untuk retur sparepart %', new.id_sparepart;
    end if;

    v_stok_saat_ini := v_stok_saat_ini - new.jumlah;
    v_status := case when v_stok_saat_ini = 0 then 'habis' when v_stok_saat_ini <= v_min then 'menipis' else 'tersedia' end;

    update public.sparepart
    set stok_tersedia = v_stok_saat_ini,
        status_stok = v_status,
        tanggal_update = now(),
        updated_at = now()
    where id_sparepart = new.id_sparepart;

    insert into public.riwayat_stok (
      id_sparepart,
      jenis,
      jumlah,
      tanggal,
      keterangan
    ) values (
      new.id_sparepart,
      'keluar',
      new.jumlah,
      now(),
      'Retur sparepart: ' || new.alasan
    );
  end if;

  return new;
end;
$$;

drop trigger if exists trg_on_retur_sparepart_approved on public.retur_sparepart;
create trigger trg_on_retur_sparepart_approved
after insert or update on public.retur_sparepart
for each row execute procedure public.trigger_retur_sparepart();

-- Trigger: Sinkronisasi Total Biaya Servis dari Detail Servis
create or replace function public.recalculate_servis_biaya()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_servis_id uuid;
  v_total_part numeric(14,2);
  v_biaya_jasa numeric(14,2);
begin
  v_servis_id := coalesce(new.id_servis, old.id_servis);

  select coalesce(sum(jumlah * harga), 0)
  into v_total_part
  from public.detail_servis
  where id_servis = v_servis_id;

  select biaya_jasa into v_biaya_jasa
  from public.servis
  where id_servis = v_servis_id;

  update public.servis
  set biaya_sparepart = v_total_part,
      total_biaya = coalesce(v_biaya_jasa, 0) + v_total_part,
      updated_at = now()
  where id_servis = v_servis_id;

  return null;
end;
$$;

drop trigger if exists trg_detail_servis_recalculate on public.detail_servis;
create trigger trg_detail_servis_recalculate
after insert or update or delete on public.detail_servis
for each row execute procedure public.recalculate_servis_biaya();

-- Trigger: Supabase Auth User Creation Handler & Auto Sync
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_role public.app_role;
  v_full_name text;
  v_phone text;
begin
  v_full_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));
  v_phone := new.raw_user_meta_data->>'phone';
  v_role := coalesce((new.raw_user_meta_data->>'role')::public.app_role, 'pelanggan'::public.app_role);

  -- Upsert profiles
  insert into public.profiles (id, full_name, email, phone, role)
  values (new.id, v_full_name, new.email, v_phone, v_role)
  on conflict (id) do update
  set full_name = excluded.full_name,
      email = excluded.email,
      phone = excluded.phone,
      role = excluded.role,
      updated_at = now();

  -- Upsert ke role-specific table
  if v_role = 'pelanggan' then
    insert into public.pelanggan (user_id, nama, email, no_hp)
    values (new.id, v_full_name, new.email, v_phone)
    on conflict (email) do update
    set user_id = new.id,
        nama = excluded.nama,
        no_hp = excluded.no_hp,
        updated_at = now();
  elsif v_role = 'admin' then
    insert into public.admin (user_id, nama, email, no_hp, status)
    values (new.id, v_full_name, new.email, v_phone, 'aktif')
    on conflict (email) do update
    set user_id = new.id,
        nama = excluded.nama,
        no_hp = excluded.no_hp,
        status = 'aktif',
        updated_at = now();
  elsif v_role = 'owner' then
    insert into public.owner (user_id, nama, email, no_hp, status)
    values (new.id, v_full_name, new.email, v_phone, 'aktif')
    on conflict (email) do update
    set user_id = new.id,
        nama = excluded.nama,
        no_hp = excluded.no_hp,
        status = 'aktif',
        updated_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Helper function: Memeriksa role pengguna yang sedang login
create or replace function public.has_role(required public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = any(required)
  );
$$;

-- Helper function: Mendapatkan ID Pelanggan untuk pengguna auth yang login
create or replace function public.current_pelanggan_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id_pelanggan from public.pelanggan where user_id = auth.uid() limit 1;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.pelanggan enable row level security;
alter table public.kendaraan enable row level security;
alter table public.booking_servis enable row level security;
alter table public.servis enable row level security;
alter table public.detail_servis enable row level security;
alter table public.pembayaran enable row level security;
alter table public.sparepart enable row level security;
alter table public.penggunaan_sparepart enable row level security;
alter table public.pembelian_sparepart enable row level security;
alter table public.riwayat_stok enable row level security;
alter table public.stok_opname enable row level security;
alter table public.retur_sparepart enable row level security;
alter table public.laporan_ringkasan_stok enable row level security;
alter table public.admin enable row level security;
alter table public.owner enable row level security;

-- 1. Profiles
create policy "profiles_own_read" on public.profiles
  for select using (id = auth.uid());
create policy "profiles_operational_read" on public.profiles
  for select using (public.has_role(array['admin','owner']::public.app_role[]));
create policy "profiles_own_update" on public.profiles
  for update using (id = auth.uid());

-- 2. Pelanggan
create policy "pelanggan_own_read" on public.pelanggan
  for select using (user_id = auth.uid());
create policy "pelanggan_own_update" on public.pelanggan
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "pelanggan_operational" on public.pelanggan
  for all using (public.has_role(array['admin','owner']::public.app_role[]))
  with check (public.has_role(array['admin','owner']::public.app_role[]));

-- 3. Kendaraan
create policy "kendaraan_own_read" on public.kendaraan
  for select using (id_pelanggan = public.current_pelanggan_id());
create policy "kendaraan_own_manage" on public.kendaraan
  for all using (id_pelanggan = public.current_pelanggan_id())
  with check (id_pelanggan = public.current_pelanggan_id());
create policy "kendaraan_operational" on public.kendaraan
  for all using (public.has_role(array['admin','owner']::public.app_role[]))
  with check (public.has_role(array['admin','owner']::public.app_role[]));

-- 4. Booking Servis
create policy "booking_own_read" on public.booking_servis
  for select using (id_pelanggan = public.current_pelanggan_id());
create policy "booking_own_insert" on public.booking_servis
  for insert with check (id_pelanggan = public.current_pelanggan_id());
create policy "booking_operational" on public.booking_servis
  for all using (public.has_role(array['admin','owner']::public.app_role[]))
  with check (public.has_role(array['admin','owner']::public.app_role[]));

-- 5. Servis
create policy "servis_own_read" on public.servis
  for select using (id_pelanggan = public.current_pelanggan_id());
create policy "servis_operational" on public.servis
  for all using (public.has_role(array['admin','owner']::public.app_role[]))
  with check (public.has_role(array['admin','owner']::public.app_role[]));

-- 6. Detail Servis
create policy "detail_servis_own_read" on public.detail_servis
  for select using (
    exists (
      select 1 from public.servis s
      where s.id_servis = detail_servis.id_servis
        and s.id_pelanggan = public.current_pelanggan_id()
    )
  );
create policy "detail_servis_operational" on public.detail_servis
  for all using (public.has_role(array['admin','owner']::public.app_role[]))
  with check (public.has_role(array['admin','owner']::public.app_role[]));

-- 7. Pembayaran
create policy "pembayaran_own_read" on public.pembayaran
  for select using (id_pelanggan = public.current_pelanggan_id());
create policy "pembayaran_own_submit" on public.pembayaran
  for update using (id_pelanggan = public.current_pelanggan_id())
  with check (id_pelanggan = public.current_pelanggan_id());
create policy "pembayaran_operational" on public.pembayaran
  for all using (public.has_role(array['admin','owner']::public.app_role[]))
  with check (public.has_role(array['admin','owner']::public.app_role[]));

-- 8. Sparepart & Stok (Katalog dapat dibaca semua user terotentikasi, diubah oleh admin/owner)
create policy "sparepart_read_all" on public.sparepart
  for select using (true);
create policy "sparepart_operational" on public.sparepart
  for all using (public.has_role(array['admin','owner']::public.app_role[]))
  with check (public.has_role(array['admin','owner']::public.app_role[]));

-- 9. Penggunaan Sparepart, Pembelian, Riwayat Stok, Stok Opname, Retur, Laporan (Admin & Owner)
create policy "penggunaan_operational" on public.penggunaan_sparepart
  for all using (public.has_role(array['admin','owner']::public.app_role[]))
  with check (public.has_role(array['admin','owner']::public.app_role[]));

create policy "pembelian_operational" on public.pembelian_sparepart
  for all using (public.has_role(array['admin','owner']::public.app_role[]))
  with check (public.has_role(array['admin','owner']::public.app_role[]));

create policy "riwayat_stok_operational" on public.riwayat_stok
  for all using (public.has_role(array['admin','owner']::public.app_role[]))
  with check (public.has_role(array['admin','owner']::public.app_role[]));

create policy "stok_opname_operational" on public.stok_opname
  for all using (public.has_role(array['admin','owner']::public.app_role[]))
  with check (public.has_role(array['admin','owner']::public.app_role[]));

create policy "retur_operational" on public.retur_sparepart
  for all using (public.has_role(array['admin','owner']::public.app_role[]))
  with check (public.has_role(array['admin','owner']::public.app_role[]));

create policy "laporan_ringkasan_operational" on public.laporan_ringkasan_stok
  for all using (public.has_role(array['admin','owner']::public.app_role[]))
  with check (public.has_role(array['admin','owner']::public.app_role[]));

-- 10. Admin & Owner Management
create policy "admin_read" on public.admin
  for select using (public.has_role(array['admin','owner']::public.app_role[]));
create policy "admin_owner_manage" on public.admin
  for all using (public.has_role(array['owner']::public.app_role[]))
  with check (public.has_role(array['owner']::public.app_role[]));

create policy "owner_only_read" on public.owner
  for select using (public.has_role(array['owner']::public.app_role[]));
create policy "owner_only_manage" on public.owner
  for all using (public.has_role(array['owner']::public.app_role[]))
  with check (public.has_role(array['owner']::public.app_role[]));

-- ============================================================================
-- DEVELOPMENT SEED DATA
-- ============================================================================
-- 1. Pelanggan Contoh
insert into public.pelanggan (id_pelanggan, nama, email, no_hp, alamat)
values
  ('11111111-1111-1111-1111-111111111111', 'Budi Santoso', 'budi@mail.test', '0812-3344-5566', 'Jl. Merdeka No. 12, Bandung'),
  ('22222222-2222-2222-2222-222222222222', 'Siti Rahmawati', 'siti@mail.test', '0857-1122-9090', 'Jl. Cihampelas No. 7, Bandung'),
  ('33333333-3333-3333-3333-333333333333', 'Agus Prasetyo', 'agus@mail.test', '0813-7788-4455', 'Jl. Sudirman No. 88, Cimahi')
on conflict (email) do nothing;

-- 2. Kendaraan Contoh
insert into public.kendaraan (id_kendaraan, id_pelanggan, merk, tipe, tahun, nopol)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Honda', 'Beat', 2019, 'D 1234 ABC'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Honda', 'Vario 160', 2023, 'B 1234 XYZ'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'Yamaha', 'NMAX', 2021, 'D 5521 KJ'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'Toyota', 'Avanza', 2017, 'D 9087 PL')
on conflict do nothing;

-- 3. Sparepart & Stok Contoh (SP-001, SP-002, SP-003, etc.)
insert into public.sparepart (id_sparepart, nama_sparepart, kategori, satuan, harga, stok_tersedia, stok_minimum, status_stok)
values
  ('SP-001', 'Oli Mesin AHM MPX 0.8L', 'Oli', 'Botol', 48000, 34, 10, 'tersedia'),
  ('SP-002', 'Busi NGK CPR9EA', 'Mesin', 'Pcs', 27000, 18, 8, 'tersedia'),
  ('SP-003', 'Kampas Rem Depan NMAX', 'Rem', 'Set', 95000, 6, 6, 'menipis'),
  ('SP-004', 'Filter Udara Beat', 'Mesin', 'Pcs', 62000, 0, 5, 'habis'),
  ('SP-005', 'Aki GS Astra NS40', 'Kelistrikan', 'Unit', 610000, 4, 3, 'tersedia'),
  ('SP-006', 'Ban Luar IRC 80/90-14', 'Ban', 'Pcs', 215000, 11, 4, 'tersedia')
on conflict (id_sparepart) do nothing;

-- 4. Booking Servis Contoh
insert into public.booking_servis (
  id_booking, nomor_booking, id_pelanggan, id_kendaraan, tanggal_booking, waktu_booking, jenis_servis, keluhan, mekanik_diinginkan, status_booking
) values (
  'e1111111-1111-1111-1111-111111111111',
  'BK-2026-0032',
  '11111111-1111-1111-1111-111111111111',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  current_date + interval '1 day',
  '09:00',
  'Servis Ringan',
  'Mesin bergetar saat tarikan awal dan ganti oli rutin',
  'Joko',
  'menunggu_konfirmasi'
), (
  'e2222222-2222-2222-2222-222222222222',
  'BK-2026-0031',
  '22222222-2222-2222-2222-222222222222',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  current_date,
  '10:30',
  'Perbaikan Rem',
  'Rem depan kurang pakem dan berdecit',
  'Dedi',
  'disetujui'
) on conflict (nomor_booking) do nothing;

-- 5. Servis Contoh (1:1 dengan Booking BK-2026-0031)
insert into public.servis (
  id_servis, nomor_servis, id_booking, id_pelanggan, id_kendaraan, mekanik, jenis_servis, keluhan, hasil_pemeriksaan, estimasi_biaya, estimasi_waktu, biaya_jasa, biaya_sparepart, total_biaya, status_servis, tanggal_mulai, estimasi_selesai
) values (
  'f1111111-1111-1111-1111-111111111111',
  'SRV-2026-0147',
  'e2222222-2222-2222-2222-222222222222',
  '22222222-2222-2222-2222-222222222222',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'Dedi',
  'Perbaikan Rem',
  'Rem depan kurang pakem dan berdecit',
  'Kampas rem depan menipis dan perlu diganti',
  155000,
  '1 jam',
  60000,
  95000,
  155000,
  'menunggu_pembayaran',
  now() - interval '2 hours',
  now() + interval '1 hour'
) on conflict (nomor_servis) do nothing;

-- 6. Detail Servis Contoh
insert into public.detail_servis (
  id_servis, id_sparepart, jumlah, keterangan, harga
) values (
  'f1111111-1111-1111-1111-111111111111',
  'SP-003',
  1,
  'Ganti kampas rem depan NMAX',
  95000
) on conflict do nothing;

-- 7. Pembayaran Contoh (1:1 dengan Servis SRV-2026-0147)
insert into public.pembayaran (
  id_pembayaran, nomor_transaksi, id_servis, id_pelanggan, metode_pembayaran, tanggal_bayar, jumlah_bayar, status_pembayaran
) values (
  '91111111-1111-1111-1111-111111111111',
  'TRX-2026-0147',
  'f1111111-1111-1111-1111-111111111111',
  '22222222-2222-2222-2222-222222222222',
  'transfer',
  now(),
  155000,
  'menunggu_verifikasi'
) on conflict (nomor_transaksi) do nothing;

-- 8. Pembelian Sparepart Contoh
insert into public.pembelian_sparepart (
  id_pembelian_sparepart, nomor_pembelian, id_sparepart, supplier, tanggal, jumlah, harga, total, status
) values (
  '81111111-1111-1111-1111-111111111111',
  'PB-2026-0011',
  'SP-001',
  'PT Sinar Pelumas',
  current_date - interval '10 days',
  24,
  41000,
  984000,
  'diterima'
) on conflict (nomor_pembelian) do nothing;

-- 9. Riwayat Stok Awal
insert into public.riwayat_stok (
  id_sparepart, jenis, jumlah, tanggal, keterangan
) values
  ('SP-001', 'masuk', 24, now() - interval '10 days', 'Pembelian PB-2026-0011 · PT Sinar Pelumas'),
  ('SP-001', 'keluar', 1, now() - interval '2 days', 'Dipakai servis SRV-2026-0146'),
  ('SP-003', 'keluar', 1, now() - interval '1 hour', 'Dipakai servis SRV-2026-0147')
on conflict do nothing;

-- 10. Stok Opname Contoh
insert into public.stok_opname (
  tanggal, keterangan, total_item, selisih_total
) values (
  current_date - interval '5 days',
  'Stok opname rutin akhir bulan gudang utama',
  6,
  0
) on conflict do nothing;

-- 11. Laporan Ringkasan Stok Contoh
insert into public.laporan_ringkasan_stok (
  id_sparepart, stok_awal, stok_masuk, stok_keluar, stok_akhir, periode
) values
  ('SP-001', 11, 24, 1, 34, '2026-08'),
  ('SP-002', 20, 0, 2, 18, '2026-08'),
  ('SP-003', 7, 0, 1, 6, '2026-08')
on conflict do nothing;

