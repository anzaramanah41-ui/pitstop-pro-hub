-- 011_create_riwayat_stok.sql
create table if not exists public.riwayat_stok (
  id_riwayat_stok uuid primary key default gen_random_uuid(),
  id_sparepart text not null references public.sparepart(id_sparepart) on delete cascade,
  jenis text not null check (jenis in ('masuk', 'keluar', 'penyesuaian')),
  jumlah integer not null check (jumlah > 0),
  tanggal timestamptz not null default now(),
  keterangan text,
  created_at timestamptz not null default now()
);

create index if not exists idx_riwayat_stok_sparepart on public.riwayat_stok(id_sparepart);

