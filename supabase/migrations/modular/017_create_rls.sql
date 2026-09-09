-- 017_create_rls.sql

-- Helper functions
create or replace function public.has_role(required public.app_role[])
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role = any(required)
  );
$$;

create or replace function public.current_pelanggan_id()
returns uuid language sql stable security definer set search_path = public as $$
  select id_pelanggan from public.pelanggan where user_id = auth.uid() limit 1;
$$;

-- Enable RLS
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

-- Profiles
create policy "profiles_own_read" on public.profiles for select using (id = auth.uid());
create policy "profiles_operational_read" on public.profiles for select using (public.has_role(array['admin','owner']::public.app_role[]));
create policy "profiles_own_update" on public.profiles for update using (id = auth.uid());

-- Pelanggan
create policy "pelanggan_own_read" on public.pelanggan for select using (user_id = auth.uid());
create policy "pelanggan_own_update" on public.pelanggan for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "pelanggan_operational" on public.pelanggan for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));

-- Kendaraan
create policy "kendaraan_own_read" on public.kendaraan for select using (id_pelanggan = public.current_pelanggan_id());
create policy "kendaraan_own_manage" on public.kendaraan for all using (id_pelanggan = public.current_pelanggan_id()) with check (id_pelanggan = public.current_pelanggan_id());
create policy "kendaraan_operational" on public.kendaraan for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));

-- Booking Servis
create policy "booking_own_read" on public.booking_servis for select using (id_pelanggan = public.current_pelanggan_id());
create policy "booking_own_insert" on public.booking_servis for insert with check (id_pelanggan = public.current_pelanggan_id());
create policy "booking_operational" on public.booking_servis for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));

-- Servis
create policy "servis_own_read" on public.servis for select using (id_pelanggan = public.current_pelanggan_id());
create policy "servis_operational" on public.servis for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));

-- Detail Servis
create policy "detail_servis_own_read" on public.detail_servis for select using (
  exists (
    select 1 from public.servis s
    where s.id_servis = detail_servis.id_servis
      and s.id_pelanggan = public.current_pelanggan_id()
  )
);
create policy "detail_servis_operational" on public.detail_servis for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));

-- Pembayaran
create policy "pembayaran_own_read" on public.pembayaran for select using (id_pelanggan = public.current_pelanggan_id());
create policy "pembayaran_own_submit" on public.pembayaran for update using (id_pelanggan = public.current_pelanggan_id()) with check (id_pelanggan = public.current_pelanggan_id());
create policy "pembayaran_operational" on public.pembayaran for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));

-- Sparepart (Katalog dibaca publik/auth, kelola admin/owner)
create policy "sparepart_read_all" on public.sparepart for select using (true);
create policy "sparepart_operational" on public.sparepart for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));

-- Stok & Operasional
create policy "penggunaan_operational" on public.penggunaan_sparepart for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));
create policy "pembelian_operational" on public.pembelian_sparepart for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));
create policy "riwayat_stok_operational" on public.riwayat_stok for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));
create policy "stok_opname_operational" on public.stok_opname for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));
create policy "retur_operational" on public.retur_sparepart for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));
create policy "laporan_ringkasan_operational" on public.laporan_ringkasan_stok for all using (public.has_role(array['admin','owner']::public.app_role[])) with check (public.has_role(array['admin','owner']::public.app_role[]));

-- Admin & Owner
create policy "admin_read" on public.admin for select using (public.has_role(array['admin','owner']::public.app_role[]));
create policy "admin_owner_manage" on public.admin for all using (public.has_role(array['owner']::public.app_role[])) with check (public.has_role(array['owner']::public.app_role[]));
create policy "owner_only_read" on public.owner for select using (public.has_role(array['owner']::public.app_role[]));
create policy "owner_only_manage" on public.owner for all using (public.has_role(array['owner']::public.app_role[])) with check (public.has_role(array['owner']::public.app_role[]));

