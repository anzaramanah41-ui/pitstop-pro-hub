-- 012_create_stok_opname.sql
create table if not exists public.stok_opname (
  id_stok_opname uuid primary key default gen_random_uuid(),
  tanggal date not null default current_date,
  keterangan text,
  total_item integer not null default 0,
  selisih_total integer not null default 0,
  created_at timestamptz not null default now()
);

