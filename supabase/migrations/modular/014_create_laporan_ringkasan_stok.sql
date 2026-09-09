-- 014_create_laporan_ringkasan_stok.sql
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

create index if not exists idx_laporan_ringkasan_sparepart on public.laporan_ringkasan_stok(id_sparepart);

