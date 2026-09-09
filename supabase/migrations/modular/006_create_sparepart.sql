-- 006_create_sparepart.sql
create table if not exists public.sparepart (
  id_sparepart text primary key,
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

