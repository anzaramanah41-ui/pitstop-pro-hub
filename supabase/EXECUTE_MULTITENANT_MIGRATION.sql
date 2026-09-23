-- ============================================================================
-- APPBENK: MULTI-TENANT SAAS ARCHITECTURE MIGRATION
-- Migration: 20260910_multitenant_saas_architecture.sql
-- Description:
-- 1. Creates core SaaS multi-tenant entities:
--    - workshops
--    - workshop_members
--    - workshop_payment_accounts
--    - notification_logs
-- 2. Adds workshop_id to all operational tables with bi-directional sync to id_bengkel
-- 3. Implements Row Level Security (RLS) enforcing strict tenant isolation:
--    - Owner/Admin isolated to their workshop
--    - Customer isolated to their own records
-- 4. Safe backfill for existing data without data loss
-- ============================================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABEL: workshops (Multi-Tenant Workshop / Bengkel Entity)
-- ----------------------------------------------------------------------------
create table if not exists public.workshops (
  id text primary key,
  name text not null,
  code text not null unique,
  owner_id uuid references auth.users(id) on delete set null,
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
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index workshops
create index if not exists idx_workshops_code on public.workshops(code);
create index if not exists idx_workshops_owner on public.workshops(owner_id);

-- Backfill workshops dari tabel bengkel eksisting (jika ada)
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'bengkel') then
    insert into public.workshops (id, name, code, phone, address, created_at, updated_at)
    select
      id_bengkel,
      nama_bengkel,
      upper(replace(id_bengkel, '-', '_')),
      no_telepon,
      alamat,
      created_at,
      updated_at
    from public.bengkel
    on conflict (id) do update set
      name = excluded.name,
      phone = excluded.phone,
      address = excluded.address;
  end if;
end $$;

-- Pastikan minimal 2 workshop default tersedia untuk isolasi multi-cabang
insert into public.workshops (id, name, code, phone, email, address, city, created_at, updated_at)
values
  ('bengkel-001', 'AppBenk Motor Pusat', 'BGL-001', '021-5550101', 'pusat@appbenk.com', 'Jl. Merdeka No. 45, Jakarta', 'Jakarta Pusat', now(), now()),
  ('bengkel-002', 'AppBenk Motor Cabang Timur', 'BGL-002', '021-5550202', 'timur@appbenk.com', 'Jl. Pemuda No. 12, Bekasi', 'Bekasi', now(), now())
on conflict (id) do update set
  name = excluded.name,
  code = excluded.code,
  phone = excluded.phone,
  address = excluded.address;

-- Hubungkan owner ke workshop jika ada data di tabel owner dan terdaftar di auth.users
update public.workshops w
set owner_id = o.user_id
from public.owner o
where (o.id_bengkel = w.id or (o.id_bengkel is null and w.id = 'bengkel-001'))
  and w.owner_id is null
  and o.user_id is not null
  and exists (select 1 from auth.users u where u.id = o.user_id);

-- Sinkronkan tabel bengkel lama jika masih berwujud tabel
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'bengkel') then
    insert into public.bengkel (id_bengkel, nama_bengkel, alamat, no_telepon, created_at, updated_at)
    select id, name, address, phone, created_at, updated_at
    from public.workshops
    on conflict (id_bengkel) do update set
      nama_bengkel = excluded.nama_bengkel,
      alamat = excluded.alamat,
      no_telepon = excluded.no_telepon;
  end if;
end $$;


-- ----------------------------------------------------------------------------
-- 2. TABEL: workshop_members (Relasi Membership & Role User pada Workshop)
-- ----------------------------------------------------------------------------
create table if not exists public.workshop_members (
  id uuid primary key default gen_random_uuid(),
  workshop_id text not null references public.workshops(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (upper(role) in ('OWNER', 'ADMIN', 'MECHANIC', 'CUSTOMER')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workshop_id, user_id, role)
);

create index if not exists idx_workshop_members_user on public.workshop_members(user_id);
create index if not exists idx_workshop_members_workshop on public.workshop_members(workshop_id);
create index if not exists idx_workshop_members_role on public.workshop_members(role);

-- Backfill data membership dari tabel owner eksisting (Hanya jika terdaftar di auth.users)
insert into public.workshop_members (workshop_id, user_id, role)
select
  coalesce(o.id_bengkel, 'bengkel-001'),
  o.user_id,
  'OWNER'
from public.owner o
where o.user_id is not null
  and exists (select 1 from auth.users u where u.id = o.user_id)
on conflict (workshop_id, user_id, role) do nothing;

-- Backfill data membership dari tabel admin eksisting (Hanya jika terdaftar di auth.users)
insert into public.workshop_members (workshop_id, user_id, role)
select
  coalesce(a.id_bengkel, 'bengkel-001'),
  a.user_id,
  'ADMIN'
from public.admin a
where a.user_id is not null
  and exists (select 1 from auth.users u where u.id = a.user_id)
on conflict (workshop_id, user_id, role) do nothing;

-- Backfill data membership dari tabel profiles jika ada role admin / owner yang belum terdaftar (Hanya jika terdaftar di auth.users)
insert into public.workshop_members (workshop_id, user_id, role)
select
  coalesce(p.id_bengkel, 'bengkel-001'),
  p.id,
  upper(p.role)
from public.profiles p
where upper(p.role) in ('OWNER', 'ADMIN')
  and exists (select 1 from auth.users u where u.id = p.id)
on conflict (workshop_id, user_id, role) do nothing;


-- ----------------------------------------------------------------------------
-- 3. TABEL: workshop_payment_accounts (Multi-Account Payment Gateway)
-- ----------------------------------------------------------------------------
create table if not exists public.workshop_payment_accounts (
  id uuid primary key default gen_random_uuid(),
  workshop_id text not null references public.workshops(id) on delete cascade,
  provider text not null default 'XENDIT',
  provider_account_id text not null,
  status text not null default 'active',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(workshop_id, provider)
);

create index if not exists idx_payment_accounts_workshop on public.workshop_payment_accounts(workshop_id);


-- ----------------------------------------------------------------------------
-- 4. TABEL: notification_logs (Multi-Channel Notification Audit Log)
-- ----------------------------------------------------------------------------
create table if not exists public.notification_logs (
  id uuid primary key default gen_random_uuid(),
  workshop_id text references public.workshops(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  channel text not null check (channel in ('EMAIL', 'WHATSAPP', 'IN_APP')),
  type text not null,
  recipient text not null,
  subject text,
  message text not null,
  status text not null default 'pending',
  provider text,
  provider_message_id text,
  sent_at timestamptz,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists idx_notification_logs_workshop on public.notification_logs(workshop_id);
create index if not exists idx_notification_logs_user on public.notification_logs(user_id);
create index if not exists idx_notification_logs_channel on public.notification_logs(channel);


-- ----------------------------------------------------------------------------
-- 5. FUNCTION & TRIGGER: SINKRONISASI DUAL-COLUMN (workshop_id <-> id_bengkel)
-- ----------------------------------------------------------------------------
create or replace function public.fn_sync_workshop_bengkel_id()
returns trigger language plpgsql as $$
begin
  if new.workshop_id is null and new.id_bengkel is not null then
    new.workshop_id := new.id_bengkel;
  elsif new.id_bengkel is null and new.workshop_id is not null then
    new.id_bengkel := new.workshop_id;
  end if;

  -- Default fallback jika keduanya kosong
  if new.workshop_id is null and new.id_bengkel is null then
    new.workshop_id := 'bengkel-001';
    new.id_bengkel := 'bengkel-001';
  end if;

  return new;
end;
$$;


-- ----------------------------------------------------------------------------
-- 6. PERLUASAN KOLOM WORKSHOP_ID PADA TABEL OPERASIONAL
-- ----------------------------------------------------------------------------

-- Helper macro to add column safely
do $$
declare
  t text;
  tables text[] := array[
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
    'laporan_ringkasan_stok'
  ];
begin
  foreach t in array tables loop
    -- Pastikan tabel ada
    if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = t) then
      -- Tambah kolom workshop_id jika belum ada
      if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = t and column_name = 'workshop_id') then
        execute format('alter table public.%I add column workshop_id text references public.workshops(id) on delete cascade;', t);
      end if;

      -- Tambah kolom id_bengkel jika belum ada (untuk kompatibilitas total)
      if not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = t and column_name = 'id_bengkel') then
        execute format('alter table public.%I add column id_bengkel text;', t);
      end if;

      -- Pasang trigger sinkronisasi
      execute format('drop trigger if exists trg_sync_workshop_bengkel on public.%I;', t);
      execute format('create trigger trg_sync_workshop_bengkel before insert or update on public.%I for each row execute function public.fn_sync_workshop_bengkel_id();', t);

      -- Buat index workshop_id
      execute format('create index if not exists %I on public.%I(workshop_id);', 'idx_' || t || '_workshop', t);
    end if;
  end loop;
end $$;

-- Tabel stok_opname jika ada / dibuat
create table if not exists public.stok_opname (
  id_stok_opname text primary key,
  workshop_id text references public.workshops(id) on delete cascade default 'bengkel-001',
  id_bengkel text default 'bengkel-001',
  tanggal date not null default current_date,
  keterangan text,
  total_item integer not null default 0,
  selisih_total integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_stok_opname_workshop on public.stok_opname(workshop_id);


-- ----------------------------------------------------------------------------
-- 7. BACKFILL EXISTING OPERATIONAL DATA
-- ----------------------------------------------------------------------------

-- 1. Pelanggan
update public.pelanggan
set workshop_id = coalesce(id_bengkel, 'bengkel-001'),
    id_bengkel = coalesce(id_bengkel, 'bengkel-001')
where workshop_id is null;

-- 2. Kendaraan
update public.kendaraan k
set workshop_id = coalesce(k.id_bengkel, p.workshop_id, 'bengkel-001'),
    id_bengkel = coalesce(k.id_bengkel, p.id_bengkel, 'bengkel-001')
from public.pelanggan p
where k.id_pelanggan = p.id_pelanggan
  and k.workshop_id is null;

update public.kendaraan
set workshop_id = 'bengkel-001', id_bengkel = 'bengkel-001'
where workshop_id is null;

-- 3. Booking Servis
update public.booking_servis
set workshop_id = coalesce(id_bengkel, 'bengkel-001'),
    id_bengkel = coalesce(id_bengkel, 'bengkel-001')
where workshop_id is null;

-- 4. Servis
update public.servis
set workshop_id = coalesce(id_bengkel, 'bengkel-001'),
    id_bengkel = coalesce(id_bengkel, 'bengkel-001')
where workshop_id is null;

-- 5. Detail Servis
update public.detail_servis ds
set workshop_id = coalesce(ds.id_bengkel, s.workshop_id, 'bengkel-001'),
    id_bengkel = coalesce(ds.id_bengkel, s.id_bengkel, 'bengkel-001')
from public.servis s
where ds.id_servis = s.id_servis
  and ds.workshop_id is null;

-- 6. Pembayaran
update public.pembayaran p
set workshop_id = coalesce(p.id_bengkel, s.workshop_id, 'bengkel-001'),
    id_bengkel = coalesce(p.id_bengkel, s.id_bengkel, 'bengkel-001')
from public.servis s
where p.id_servis = s.id_servis
  and p.workshop_id is null;

update public.pembayaran
set workshop_id = 'bengkel-001', id_bengkel = 'bengkel-001'
where workshop_id is null;

-- 7. Sparepart
update public.sparepart
set workshop_id = coalesce(id_bengkel, 'bengkel-001'),
    id_bengkel = coalesce(id_bengkel, 'bengkel-001')
where workshop_id is null;

-- 8. Penggunaan Sparepart
update public.penggunaan_sparepart ps
set workshop_id = coalesce(ps.id_bengkel, s.workshop_id, 'bengkel-001'),
    id_bengkel = coalesce(ps.id_bengkel, s.id_bengkel, 'bengkel-001')
from public.servis s
where ps.id_servis = s.id_servis
  and ps.workshop_id is null;

-- 9. Pembelian Sparepart
update public.pembelian_sparepart
set workshop_id = coalesce(id_bengkel, 'bengkel-001'),
    id_bengkel = coalesce(id_bengkel, 'bengkel-001')
where workshop_id is null;

-- 10. Riwayat Stok
update public.riwayat_stok
set workshop_id = coalesce(id_bengkel, 'bengkel-001'),
    id_bengkel = coalesce(id_bengkel, 'bengkel-001')
where workshop_id is null;

-- 11. Retur Sparepart
update public.retur_sparepart
set workshop_id = coalesce(id_bengkel, 'bengkel-001'),
    id_bengkel = coalesce(id_bengkel, 'bengkel-001')
where workshop_id is null;

-- 12. Supplier
update public.supplier
set workshop_id = coalesce(id_bengkel, 'bengkel-001'),
    id_bengkel = coalesce(id_bengkel, 'bengkel-001')
where workshop_id is null;

-- 13. Mekanik
update public.mekanik
set workshop_id = coalesce(id_bengkel, 'bengkel-001'),
    id_bengkel = coalesce(id_bengkel, 'bengkel-001')
where workshop_id is null;

-- 14. Admin & Owner
update public.admin
set workshop_id = coalesce(id_bengkel, 'bengkel-001'),
    id_bengkel = coalesce(id_bengkel, 'bengkel-001')
where workshop_id is null;

update public.owner
set workshop_id = coalesce(id_bengkel, 'bengkel-001'),
    id_bengkel = coalesce(id_bengkel, 'bengkel-001')
where workshop_id is null;

-- 15. Profiles
update public.profiles
set workshop_id = id_bengkel
where workshop_id is null and id_bengkel is not null;


-- ----------------------------------------------------------------------------
-- 8. SECURITY DEFINER HELPER FUNCTIONS UNTUK RLS MULTI-TENANT
-- ----------------------------------------------------------------------------

-- Daftar workshop_id yang diakses oleh authenticated user saat ini
create or replace function public.current_user_workshops()
returns setof text language sql stable security definer set search_path = public as $$
  select wm.workshop_id
  from public.workshop_members wm
  where wm.user_id = auth.uid()
  union
  select w.id
  from public.workshops w
  where w.owner_id = auth.uid();
$$;

-- Periksa apakah user memiliki role tertentu pada workshop
create or replace function public.user_has_workshop_role(target_workshop_id text, allowed_roles text[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workshop_members wm
    where wm.user_id = auth.uid()
      and wm.workshop_id = target_workshop_id
      and upper(wm.role) = any(array(select upper(unnest(allowed_roles))))
  ) or exists (
    select 1 from public.workshops w
    where w.id = target_workshop_id
      and w.owner_id = auth.uid()
      and 'OWNER' = any(array(select upper(unnest(allowed_roles))))
  );
$$;

-- Periksa apakah user adalah staff (OWNER, ADMIN, atau MECHANIC) pada workshop
create or replace function public.is_workshop_staff(target_workshop_id text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.user_has_workshop_role(target_workshop_id, array['OWNER', 'ADMIN', 'MECHANIC']);
$$;

-- Periksa apakah user adalah OWNER pada workshop
create or replace function public.is_workshop_owner(target_workshop_id text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.user_has_workshop_role(target_workshop_id, array['OWNER']);
$$;

-- Daftar id_pelanggan milik user yang sedang login
create or replace function public.current_pelanggan_ids()
returns setof text language sql stable security definer set search_path = public as $$
  select p.id_pelanggan
  from public.pelanggan p
  where p.user_id = auth.uid();
$$;


-- ----------------------------------------------------------------------------
-- 9. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------

-- Enable RLS on all tables
alter table public.workshops enable row level security;
alter table public.workshop_members enable row level security;
alter table public.workshop_payment_accounts enable row level security;
alter table public.notification_logs enable row level security;
alter table public.profiles enable row level security;
alter table public.pelanggan enable row level security;
alter table public.kendaraan enable row level security;
alter table public.mekanik enable row level security;
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
alter table public.supplier enable row level security;
alter table public.admin enable row level security;
alter table public.owner enable row level security;

-- Bersihkan policy lama (jika ada)
do $$
declare
  t text;
  pol record;
  all_tables text[] := array[
    'workshops', 'workshop_members', 'workshop_payment_accounts', 'notification_logs',
    'profiles', 'pelanggan', 'kendaraan', 'mekanik', 'booking_servis', 'servis',
    'detail_servis', 'pembayaran', 'sparepart', 'penggunaan_sparepart',
    'pembelian_sparepart', 'riwayat_stok', 'stok_opname', 'retur_sparepart',
    'supplier', 'admin', 'owner', 'laporan_ringkasan_stok'
  ];
begin
  foreach t in array all_tables loop
    if exists (select 1 from pg_tables where schemaname = 'public' and tablename = t) then
      for pol in select policyname from pg_policies where schemaname = 'public' and tablename = t loop
        execute format('drop policy if exists %I on public.%I;', pol.policyname, t);
      end loop;
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------
-- A. Policy: workshops
-- ---------------------------------------------------------
-- Siapapun yang terautentikasi dapat melihat daftar workshop (untuk booking/katalog)
create policy "workshops_select" on public.workshops
  for select to authenticated
  using (true);

-- Hanya Owner workshop yang dapat mengubah workshop
create policy "workshops_owner_update" on public.workshops
  for update to authenticated
  using (public.is_workshop_owner(id))
  with check (public.is_workshop_owner(id));

-- ---------------------------------------------------------
-- B. Policy: workshop_members
-- ---------------------------------------------------------
-- User dapat melihat membership sendiri, atau staff workshop dapat melihat membership workshopnya
create policy "members_select" on public.workshop_members
  for select to authenticated
  using (user_id = auth.uid() or public.is_workshop_staff(workshop_id));

-- Owner dapat mengelola anggota workshopnya
create policy "members_owner_manage" on public.workshop_members
  for all to authenticated
  using (public.is_workshop_owner(workshop_id))
  with check (public.is_workshop_owner(workshop_id));

-- ---------------------------------------------------------
-- C. Policy: profiles
-- ---------------------------------------------------------
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_insert_own" on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

-- ---------------------------------------------------------
-- D. Policy: pelanggan
-- ---------------------------------------------------------
-- Pelanggan melihat data miliknya sendiri, staff workshop melihat pelanggan di workshopnya
create policy "pelanggan_select" on public.pelanggan
  for select to authenticated
  using (user_id = auth.uid() or public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

create policy "pelanggan_update" on public.pelanggan
  for update to authenticated
  using (user_id = auth.uid() or public.is_workshop_staff(coalesce(workshop_id, id_bengkel)))
  with check (user_id = auth.uid() or public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

create policy "pelanggan_insert" on public.pelanggan
  for insert to authenticated
  with check (user_id = auth.uid() or public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

create policy "pelanggan_delete" on public.pelanggan
  for delete to authenticated
  using (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

-- ---------------------------------------------------------
-- E. Policy: kendaraan
-- ---------------------------------------------------------
create policy "kendaraan_select" on public.kendaraan
  for select to authenticated
  using (
    id_pelanggan in (select public.current_pelanggan_ids())
    or public.is_workshop_staff(coalesce(workshop_id, id_bengkel))
  );

create policy "kendaraan_insert" on public.kendaraan
  for insert to authenticated
  with check (
    id_pelanggan in (select public.current_pelanggan_ids())
    or public.is_workshop_staff(coalesce(workshop_id, id_bengkel))
  );

create policy "kendaraan_update" on public.kendaraan
  for update to authenticated
  using (
    id_pelanggan in (select public.current_pelanggan_ids())
    or public.is_workshop_staff(coalesce(workshop_id, id_bengkel))
  );

create policy "kendaraan_delete" on public.kendaraan
  for delete to authenticated
  using (
    id_pelanggan in (select public.current_pelanggan_ids())
    or public.is_workshop_staff(coalesce(workshop_id, id_bengkel))
  );

-- ---------------------------------------------------------
-- F. Policy: booking_servis
-- ---------------------------------------------------------
create policy "booking_select" on public.booking_servis
  for select to authenticated
  using (
    id_pelanggan in (select public.current_pelanggan_ids())
    or public.is_workshop_staff(coalesce(workshop_id, id_bengkel))
  );

create policy "booking_insert" on public.booking_servis
  for insert to authenticated
  with check (
    id_pelanggan in (select public.current_pelanggan_ids())
    or public.is_workshop_staff(coalesce(workshop_id, id_bengkel))
  );

create policy "booking_update" on public.booking_servis
  for update to authenticated
  using (
    id_pelanggan in (select public.current_pelanggan_ids())
    or public.is_workshop_staff(coalesce(workshop_id, id_bengkel))
  );

create policy "booking_delete" on public.booking_servis
  for delete to authenticated
  using (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

-- ---------------------------------------------------------
-- G. Policy: servis & detail_servis
-- ---------------------------------------------------------
create policy "servis_select" on public.servis
  for select to authenticated
  using (
    id_pelanggan in (select public.current_pelanggan_ids())
    or public.is_workshop_staff(coalesce(workshop_id, id_bengkel))
  );

create policy "servis_staff_manage" on public.servis
  for all to authenticated
  using (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)))
  with check (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

create policy "detail_servis_select" on public.detail_servis
  for select to authenticated
  using (
    exists (
      select 1 from public.servis s
      where s.id_servis = detail_servis.id_servis
        and (s.id_pelanggan in (select public.current_pelanggan_ids()) or public.is_workshop_staff(coalesce(s.workshop_id, s.id_bengkel)))
    )
  );

create policy "detail_servis_staff_manage" on public.detail_servis
  for all to authenticated
  using (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)))
  with check (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

-- ---------------------------------------------------------
-- H. Policy: pembayaran
-- ---------------------------------------------------------
create policy "pembayaran_select" on public.pembayaran
  for select to authenticated
  using (
    id_pelanggan in (select public.current_pelanggan_ids())
    or public.is_workshop_staff(coalesce(workshop_id, id_bengkel))
  );

-- Pelanggan bisa upload bukti bayar
create policy "pembayaran_customer_upload" on public.pembayaran
  for update to authenticated
  using (id_pelanggan in (select public.current_pelanggan_ids()))
  with check (id_pelanggan in (select public.current_pelanggan_ids()));

-- Staff workshop kelola penuh pembayaran workshopnya
create policy "pembayaran_staff_manage" on public.pembayaran
  for all to authenticated
  using (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)))
  with check (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

-- ---------------------------------------------------------
-- I. Policy: sparepart, stok & operasional (Multi-Tenant Terisolasi)
-- ---------------------------------------------------------
-- Sparepart dapat dibaca oleh staff workshop miliknya, atau katalog umum/customer untuk estimasi
create policy "sparepart_select" on public.sparepart
  for select to authenticated
  using (
    public.is_workshop_staff(coalesce(workshop_id, id_bengkel))
    or coalesce(workshop_id, id_bengkel) is null
    or (not exists (
      select 1 from public.workshop_members wm
      where wm.user_id = auth.uid() and upper(wm.role) in ('OWNER', 'ADMIN', 'MECHANIC')
    ))
  );

create policy "sparepart_staff_manage" on public.sparepart
  for all to authenticated
  using (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)))
  with check (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

create policy "penggunaan_staff_manage" on public.penggunaan_sparepart
  for all to authenticated
  using (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)))
  with check (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

create policy "pembelian_staff_manage" on public.pembelian_sparepart
  for all to authenticated
  using (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)))
  with check (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

create policy "riwayat_stok_staff_manage" on public.riwayat_stok
  for all to authenticated
  using (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)))
  with check (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

create policy "stok_opname_staff_manage" on public.stok_opname
  for all to authenticated
  using (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)))
  with check (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

create policy "retur_staff_manage" on public.retur_sparepart
  for all to authenticated
  using (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)))
  with check (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

create policy "supplier_staff_manage" on public.supplier
  for all to authenticated
  using (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)))
  with check (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

create policy "mekanik_staff_manage" on public.mekanik
  for all to authenticated
  using (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)))
  with check (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));

-- Policy untuk laporan ringkasan stok jika tabel ada
do $$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'laporan_ringkasan_stok') then
    execute 'create policy "laporan_ringkasan_staff_manage" on public.laporan_ringkasan_stok for all to authenticated using (public.is_workshop_staff(coalesce(workshop_id, id_bengkel))) with check (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)));';
  end if;
end $$;

-- ---------------------------------------------------------
-- J. Policy: workshop_payment_accounts
-- ---------------------------------------------------------
create policy "payment_accounts_staff" on public.workshop_payment_accounts
  for all to authenticated
  using (public.is_workshop_staff(workshop_id))
  with check (public.is_workshop_owner(workshop_id));

-- ---------------------------------------------------------
-- K. Policy: notification_logs
-- ---------------------------------------------------------
create policy "notif_select" on public.notification_logs
  for select to authenticated
  using (user_id = auth.uid() or public.is_workshop_staff(workshop_id));

create policy "notif_staff_manage" on public.notification_logs
  for all to authenticated
  using (public.is_workshop_staff(workshop_id))
  with check (public.is_workshop_staff(workshop_id));

-- ---------------------------------------------------------
-- L. Policy: admin & owner tables
-- ---------------------------------------------------------
create policy "admin_table_manage" on public.admin
  for all to authenticated
  using (public.is_workshop_staff(coalesce(workshop_id, id_bengkel)))
  with check (public.is_workshop_owner(coalesce(workshop_id, id_bengkel)));

create policy "owner_table_manage" on public.owner
  for all to authenticated
  using (public.is_workshop_owner(coalesce(workshop_id, id_bengkel)))
  with check (public.is_workshop_owner(coalesce(workshop_id, id_bengkel)));

-- ----------------------------------------------------------------------------
-- 10. REFRESH SCHEMA CACHE
-- ----------------------------------------------------------------------------
notify pgrst, 'reload schema';
