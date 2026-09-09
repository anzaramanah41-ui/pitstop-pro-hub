-- 010_create_pembelian_sparepart.sql
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

create index if not exists idx_pembelian_sparepart on public.pembelian_sparepart(id_sparepart);

