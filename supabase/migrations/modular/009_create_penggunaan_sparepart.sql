-- 009_create_penggunaan_sparepart.sql
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

create index if not exists idx_penggunaan_servis on public.penggunaan_sparepart(id_servis);
create index if not exists idx_penggunaan_sparepart on public.penggunaan_sparepart(id_sparepart);

