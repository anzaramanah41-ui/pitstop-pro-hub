-- 003_create_kendaraan.sql
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

create index if not exists idx_kendaraan_pelanggan on public.kendaraan(id_pelanggan);
create index if not exists idx_kendaraan_nopol on public.kendaraan(nopol);

