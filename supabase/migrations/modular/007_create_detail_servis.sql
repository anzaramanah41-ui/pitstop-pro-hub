-- 007_create_detail_servis.sql
create table if not exists public.detail_servis (
  id_detail_servis uuid primary key default gen_random_uuid(),
  id_servis uuid not null references public.servis(id_servis) on delete cascade,
  id_sparepart text references public.sparepart(id_sparepart) on delete restrict,
  jumlah integer not null default 1 check (jumlah > 0),
  keterangan text,
  harga numeric(14,2) not null default 0 check (harga >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_detail_servis_servis on public.detail_servis(id_servis);
create index if not exists idx_detail_servis_sparepart on public.detail_servis(id_sparepart);

