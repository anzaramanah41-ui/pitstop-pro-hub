-- 013_create_retur_sparepart.sql
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

create index if not exists idx_retur_sparepart on public.retur_sparepart(id_sparepart);

